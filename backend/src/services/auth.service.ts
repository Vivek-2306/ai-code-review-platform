import crypto from 'crypto';
import { AppDataSource } from "@/config/datasource";
import { User } from "@/models/postgres/user.entity";
import { PasswordUtil } from "@/utils/password.util";
import { EmailUtil } from "@/utils/email.util";
import { JWTUtil, TokenPair, DecodedTokenPayload } from "@/utils/jwt.util";
import { tokenBlacklistService } from "./token-blacklist.service";
import { oauthService } from './oauth.service';
import { sessionService } from './session.service';
import { tokenStorageService } from './token-storage.service';
import { Response, Request } from 'express';


export interface RegisterDto {
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
    };
    tokens: TokenPair;
}

class AuthService {

    async register(data: RegisterDto): Promise<AuthResponse> {

        const emailValidation = EmailUtil.validateAndNormalize(data.email);
        if (!emailValidation.valid || !emailValidation.normalized) {
            throw new Error(emailValidation.error || 'Invalid email');
        }

        const normalizedEmail = emailValidation.normalized;

        const existingUser = await AppDataSource.getRepository(User).findOne({
            where: { email: normalizedEmail }
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const passwordValidation = PasswordUtil.validatePasswordStrength(data.password);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        const passwordHash = await PasswordUtil.hash(data.password);

        const user = AppDataSource.getRepository(User).create({
            email: normalizedEmail,
            passwordHash
        });
        const saveUser = await AppDataSource.getRepository(User).save(user);

        const tokens = JWTUtil.generateTokenPair({
            userId: saveUser.id,
            email: saveUser.email
        });

        return {
            user: { id: saveUser.id, email: saveUser.email },
            tokens
        }
    }

    async registerWithSession(
        data: RegisterDto,
        req: Request,
        res: Response
    ): Promise<AuthResponse> {
        // Perform registration
        const result = await this.register(data);

        // Create session
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const sessionId = await sessionService.createSession(
            result.user.id,
            result.user.email,
            ipAddress,
            userAgent
        );

        // Set tokens
        tokenStorageService.setTokens(res, result.tokens.accessToken, result.tokens.refreshToken);

        // Set session ID
        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: sessionService.getSessionTimeout(),
            path: '/',
        });

        return result;
    }

    async login(data: LoginDto): Promise<AuthResponse> {

        const emailValidation = EmailUtil.validateAndNormalize(data.email);
        if (!emailValidation.valid || !emailValidation.normalized) {
            throw new Error('Invalid email or password');
        }

        const normalizedEmail = emailValidation.normalized;

        const user = await AppDataSource.getRepository(User).findOne({
            where: { email: normalizedEmail }
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await PasswordUtil.compare(
            data.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const tokens = JWTUtil.generateTokenPair({
            userId: user.id,
            email: user.email
        });

        return {
            user: { id: user.id, email: user.email },
            tokens
        }
    }

    async loginWithSession(
        data: LoginDto,
        req: Request,
        res: Response
    ): Promise<AuthResponse> {
        // Perform login
        const result = await this.login(data);

        // Create session
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const sessionId = await sessionService.createSession(
            result.user.id,
            result.user.email,
            ipAddress,
            userAgent
        );

        // Set tokens based on storage strategy
        tokenStorageService.setTokens(res, result.tokens.accessToken, result.tokens.refreshToken);

        // Set session ID in cookie
        res.cookie('session_id', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: sessionService.getSessionTimeout(),
            path: '/',
        });

        return result;
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const payload = JWTUtil.verifyRefreshToken(refreshToken);

        const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) {
            throw new Error('Refresh token has been revoked');
        }

        const blacklistTimestamp = await tokenBlacklistService.getUserBlacklistTimestamp(payload.userId);
        if (blacklistTimestamp) {
            const tokenPayload = JWTUtil.decodeToken(refreshToken);
            if (tokenPayload && tokenPayload.iat && tokenPayload.iat * 1000 < blacklistTimestamp) {
                throw new Error('Refresh toke has been revoked');
            }
        }

        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: payload.userId }
        });
        if (!user) {
            throw new Error('User not found');
        }

        const accessToken = JWTUtil.generateAccessToken({
            userId: user.id,
            email: user.email
        })

        return { accessToken }
    }

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        // Get user
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isPasswordValid = await PasswordUtil.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password strength
        const passwordValidation = PasswordUtil.validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        // Hash new password
        const newPasswordHash = await PasswordUtil.hash(newPassword);

        // Update password
        user.passwordHash = newPasswordHash;
        await AppDataSource.getRepository(User).save(user);

        // Invalidate all sessions (logout all devices)
        await sessionService.invalidateUserSessions(userId);
    }

    async logout(accessToken: string, refreshToken: string): Promise<void> {

        try {
            const accessPayload = JWTUtil.decodeToken(accessToken);
            const refreshPayload = JWTUtil.decodeToken(refreshToken);

            if (accessPayload && accessPayload.exp) {
                const ttl = accessPayload.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    await tokenBlacklistService.blacklistToken(accessToken, ttl);
                }
            }

            if (refreshPayload && refreshPayload.exp) {
                const ttl = refreshPayload.exp - Math.floor(Date.now() / 1000);
                if (ttl > 0) {
                    await tokenBlacklistService.blacklistToken(refreshToken, ttl);
                }
            }
        } catch (error) {
            console.error('Error blacklisting token:', error);
        }
    }

    async logoutAll(userId: string): Promise<void> {
        await tokenBlacklistService.blacklistUserTokens(userId)
    }

    generateOAuthState(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    getOAuthUrl(provider: 'github' | 'google', state?: string): string {
        const oauthState = state || this.generateOAuthState();
        return oauthService.getAuthUrl(provider, oauthState);
    }

    async handleOAuthCallback(
        provider: 'github' | 'google',
        code: string,
        state?: string
    ): Promise<AuthResponse> {
        // Exchange code for access token
        const accessToken = await oauthService.getAccessToken(provider, code);

        // Get user info from OAuth provider
        const oauthUserInfo = await oauthService.getUserInfo(provider, accessToken);

        // Validate email
        const emailValidation = EmailUtil.validateAndNormalize(oauthUserInfo.email);
        if (!emailValidation.valid || !emailValidation.normalized) {
            throw new Error('Invalid email from OAuth provider');
        }

        const normalizedEmail = emailValidation.normalized;

        // Check if user exists
        let user = await AppDataSource.getRepository(User).findOne({
            where: { email: normalizedEmail },
        });

        // Create user if doesn't exist
        if (!user) {
            // Generate a random password (user won't use it, but required by schema)
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const passwordHash = await PasswordUtil.hash(randomPassword);

            user = AppDataSource.getRepository(User).create({
                email: normalizedEmail,
                passwordHash,
            });

            user = await AppDataSource.getRepository(User).save(user);
        }

        // Generate JWT tokens
        const tokens = JWTUtil.generateTokenPair({
            userId: user.id,
            email: user.email,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
            },
            tokens,
        };
    }

    async getUserSessions(userId: string) {
        return sessionService.getUserSessions(userId);
    }

    async revokeSession(userId: string, sessionId: string): Promise<void> {
        const sessions = await sessionService.getUserSessions(userId);
        const session = sessions.find((s) => s.sessionId === sessionId);

        if (!session) {
            throw new Error('Session not found');
        }

        await sessionService.removeSession(sessionId);
    }

}

export const authService = new AuthService();