import { env } from './env';

export interface TokenExpirationPolicy {
    accessToken: {
        expiresIn: string;
        maxAge: number; // milliseconds
        refreshThreshold: number; // Refresh if expires in less than this (milliseconds)
    };
    refreshToken: {
        expiresIn: string;
        maxAge: number; // milliseconds
    };
    session: {
        inactivityTimeout: number; // milliseconds
        maxSessionDuration: number; // milliseconds
    };
}

export class TokenExpirationConfig {
    private policy: TokenExpirationPolicy;

    constructor() {
        this.policy = {
            accessToken: {
                expiresIn: env.JWT_EXPIRES_IN || '7d',
                maxAge: this.parseToMilliseconds(env.JWT_EXPIRES_IN || '7d'),
                refreshThreshold: this.parseToMilliseconds(env.JWT_REFRESH_THRESHOLD || '1d'),
            },
            refreshToken: {
                expiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d',
                maxAge: this.parseToMilliseconds(env.JWT_REFRESH_EXPIRES_IN || '30d'),
            },
            session: {
                inactivityTimeout: this.parseToMilliseconds(env.SESSION_INACTIVITY_TIMEOUT || '30m'),
                maxSessionDuration: this.parseToMilliseconds(env.MAX_SESSION_DURATION || '90d'),
            },
        };
    }

    /**
     * Parse expiration string to milliseconds
     */
    private parseToMilliseconds(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            return 7 * 24 * 60 * 60 * 1000; // Default 7 days
        }

        const value = parseInt(match[1], 10);
        const unit = match[2];

        const multipliers: Record<string, number> = {
            s: 1000,
            m: 60 * 1000,
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
        };

        return value * (multipliers[unit] || multipliers.d);
    }

    /**
     * Get access token expiration policy
     */
    getAccessTokenPolicy() {
        return this.policy.accessToken;
    }

    /**
     * Get refresh token expiration policy
     */
    getRefreshTokenPolicy() {
        return this.policy.refreshToken;
    }

    /**
     * Get session expiration policy
     */
    getSessionPolicy() {
        return this.policy.session;
    }

    /**
     * Check if access token should be refreshed
     */
    shouldRefreshToken(tokenExpirationTime: number): boolean {
        const now = Date.now();
        const timeUntilExpiration = tokenExpirationTime - now;
        return timeUntilExpiration < this.policy.accessToken.refreshThreshold;
    }

    /**
     * Get full policy
     */
    getPolicy(): TokenExpirationPolicy {
        return this.policy;
    }
}

export const tokenExpirationConfig = new TokenExpirationConfig();