import { Response, Request } from "express";
import { env } from "@/config/env";

export type TokenStorageStrategy = 'cookie' | 'localstorage' | 'both';

export interface TokenStorageConfig {
    strategy: TokenStorageStrategy;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    cookieMaxAge?: number;
}

export class TokenStorageService {
    private config: TokenStorageConfig;

    constructor() {
        this.config = {
            strategy: (env.TOKEN_STORAGE_STATERGY as TokenStorageStrategy) || 'both',
            httpOnly: env.TOKEN_HTTP_ONLY === 'true' || true,
            secure: env.NODE_ENV === 'production',
            sameSite: (env.TOKEN_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
            cookieMaxAge: this.parseExpiration(env.JWT_EXPIRES_IN || '7d'),
        }
    }

    setTokens(res: Response, accessToken: string, refreshToken: string): void {
        if (this.config.strategy === 'cookie' || this.config.strategy === 'both') {
            this.setCookieToken(res, 'access_token', accessToken, this.config.cookieMaxAge);
            this.setCookieToken(
                res,
                'refresh_token',
                refreshToken,
                this.parseExpiration(env.JWT_REFRESH_EXPIRES_IN || '30d')
            );
        }

        if (this.config.strategy === 'localstorage' || this.config.strategy === 'both') {
            res.json({
                tokens: {
                    accessToken,
                    refreshToken
                }
            });
        } else {
            res.json({
                message: 'Tokens set in HTTP-only cookies'
            });
        }
    }

    /**
     * Set tokens as cookies only (no JSON body). Use before res.redirect() for OAuth callback.
     */
    setTokensAsCookies(res: Response, accessToken: string, refreshToken: string): void {
        this.setCookieToken(res, 'access_token', accessToken, this.config.cookieMaxAge);
        this.setCookieToken(
            res,
            'refresh_token',
            refreshToken,
            this.parseExpiration(env.JWT_REFRESH_EXPIRES_IN || '30d')
        );
    }

    private setCookieToken(
        res: Response,
        name: string,
        token: string,
        maxAge?: number
    ): void {
        res.cookie(name, token, {
            httpOnly: this.config.httpOnly,
            secure: this.config.secure,
            sameSite: this.config.sameSite,
            maxAge: maxAge,
            path: '/'
        });
    }

    getAccessToken(req: Request): string | null {
        if (req.cookies && req.cookies.access_token) {
            return req.cookies.access_token;
        }

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        return null;
    }

    getRefreshToken(req: Request): string | null {
        if (req.cookies && req.cookies.refresh_token) {
            return req.cookies.refresh_token;
        }

        if (req.body && req.body.refreshToken) {
            return req.body.refreshToken;
        }

        return null;
    }

    clearTokens(res: Response): void {
        res.clearCookie('access_token', {
            httpOnly: this.config.httpOnly,
            secure: this.config.secure,
            sameSite: this.config.sameSite,
            path: '/',
        });

        res.clearCookie('refresh_token', {
            httpOnly: this.config.httpOnly,
            secure: this.config.secure,
            sameSite: this.config.sameSite,
            path: '/',
        });
    }

    private parseExpiration(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 7 * 24 * 60 * 60 * 1000;
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        const multiplier: Record<string, number> = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000
        }

        return value * (multiplier[unit] || multiplier.d);
    }

    getStrategy(): TokenStorageStrategy {
        return this.config.strategy;
    }
}

export const tokenStorageService = new TokenStorageService();