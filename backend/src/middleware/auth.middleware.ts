import { Request, Response, NextFunction } from "express";
import { JWTUtil } from "@/utils/jwt.util";
import { tokenBlacklistService } from "@/services/token-blacklist.service";
import { AppDataSource } from "@/config/datasource";
import { User } from "@/models/postgres/user.entity";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }

        const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            res.status(401).json({ error: 'Token has been revoked' });
            return;
        }

        const payload = JWTUtil.verifyAccessToken(token);
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: payload.userId }
        });

        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        req.user = {
            id: user.id,
            email: user.email
        };

        next();
    } catch (error: any) {
        if (error.message === 'Token expired') {
            res.status(401).json({ error: 'Token expired' });
        }

        if (error.message === 'Invalid token') {
            res.status(401).json({ error: 'Invalid token' });
        }

        res.status(500).json({ error: 'Authentication failed' });
    }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
            if (!isBlacklisted) {
                try {
                    const payload = JWTUtil.verifyAccessToken(token);
                    const user = await AppDataSource.getRepository(User).findOne({ where: { id: payload.userId } });
                    if (user) {
                        req.user = {
                            id: user.id,
                            email: user.email
                        };
                    }
                } catch { }
            }
        }
        next();
    } catch {
        next();
    }
}