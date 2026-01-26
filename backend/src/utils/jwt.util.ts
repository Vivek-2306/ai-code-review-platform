import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@/config/env";

export interface TokenPayload {
    userId: string;
    email: string;
    type: 'access' | 'refresh';
}

export interface DecodedTokenPayload extends TokenPayload {
    iat?: number; // Issued at (timestamp in seconds)
    exp?: number; // Expiration (timestamp in seconds)
    iss?: string; // Issuer
    aud?: string | string[]; // Audience
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class JWTUtil {

    static generateAccessToken(payload: Omit<TokenPayload, 'type'>): string {
        const secret = env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }
        const options = {
            expiresIn: env.JWT_EXPIRES_IN || '7d',
            issuer: 'code-review-platform',
            audience: 'code-review-users'
        } as SignOptions;
        return jwt.sign(
            { ...payload, type: 'access' },
            secret,
            options
        );
    }

    static generateRefreshToken(payload: Omit<TokenPayload, 'type'>): string {
        const secret = env.JWT_REFRESH_SECRET;
        if (!secret) {
            throw new Error('JWT_REFRESH_SECRET is not configured');
        }
        const options = {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d',
            issuer: 'code-review-platform',
            audience: 'code-review-users'
        } as SignOptions;
        return jwt.sign(
            { ...payload, type: 'refresh' },
            secret,
            options
        );
    }

    static generateTokenPair(payload: Omit<TokenPayload, 'type'>): TokenPair {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload)
        }
    }

    static verifyAccessToken(token: string): TokenPayload {
        const secret = env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not configured');
        }
        try {
            const decoded = jwt.verify(token, secret, {
                issuer: 'code-review-platform',
                audience: 'code-review-users',
            }) as TokenPayload;

            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token Expired');
            }

            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }

            throw error;
        }
    }

    static verifyRefreshToken(token: string): TokenPayload {
        const secret = env.JWT_REFRESH_SECRET;
        if (!secret) {
            throw new Error('JWT_REFRESH_SECRET is not configured');
        }
        try {
            const decoded = jwt.verify(token, secret, {
                issuer: 'code-review-platform',
                audience: 'code-review-users'
            }) as TokenPayload;

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            return decoded
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Refresh token expired');
            }

            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }

            throw error;
        }
    }

    static decodeToken(token: string): DecodedTokenPayload | null {
        try {
            return jwt.decode(token) as DecodedTokenPayload;
        } catch (error) {
            return null;
        }
    }


}