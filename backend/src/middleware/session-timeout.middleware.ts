import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { sessionService } from '../services/session.service';
import { JWTUtil, DecodedTokenPayload } from '../utils/jwt.util';
import { tokenExpirationConfig } from '../config/token-expiration.config';

export interface SessionTimeoutRequest extends AuthRequest {
    sessionId?: string;
    tokenExpirationTime?: number;
}

/**
 * Middleware to check session timeout and token expiration
 */
export function checkSessionTimeout(
    req: SessionTimeoutRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            next();
            return;
        }

        // Decode token to check expiration
        const decoded = JWTUtil.decodeToken(token);
        if (decoded && decoded.exp) {
            const expirationTime = decoded.exp * 1000; // Convert to milliseconds
            const now = Date.now();
            const timeUntilExpiration = expirationTime - now;

            // Check if token is expired
            if (timeUntilExpiration <= 0) {
                res.status(401).json({
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                });
                return;
            }

            // Check if token should be refreshed
            if (tokenExpirationConfig.shouldRefreshToken(expirationTime)) {
                res.setHeader('X-Token-Refresh-Required', 'true');
                res.setHeader('X-Token-Expires-In', timeUntilExpiration.toString());
            }

            req.tokenExpirationTime = expirationTime;
        }

        next();
    } catch (error) {
        next();
    }
}

/**
 * Middleware to update session activity
 */
export async function updateSessionActivity(
    req: SessionTimeoutRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (req.user && req.sessionId) {
            await sessionService.updateSessionActivity(req.sessionId);
        }
        next();
    } catch (error) {
        // Don't block request if session update fails
        next();
    }
}

/**
 * Middleware to validate session is still active
 */
export async function validateSession(
    req: SessionTimeoutRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        if (req.sessionId) {
            const isActive = await sessionService.isSessionActive(req.sessionId);
            if (!isActive) {
                res.status(401).json({
                    error: 'Session expired',
                    code: 'SESSION_EXPIRED',
                });
                return;
            }
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Session validation failed' });
    }
}