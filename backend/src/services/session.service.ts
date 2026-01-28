import { AppDataSource } from "@/config/datasource";
import { User } from "@/models/postgres/user.entity";
import { tokenBlacklistService } from "./token-blacklist.service";
import Redis from "ioredis";
import { env } from "@/config/env";

export interface SessionInfo {
    userId: string;
    email: string;
    createdAt: number;
    lastActivity: number;
    ipAddress?: string;
    userAgent?: string;
}

export interface ActiveSession {
    sessionId: string;
    info: SessionInfo;
}

export class SessionService {
    private redis: Redis;
    private readonly SESSION_PREFIX = 'session:';
    private readonly USER_SESSIONS_PREFIX = 'user_sessions';
    private readonly SESSION_TIMEOUT = 30 * 60 * 1000;

    constructor() {
        this.redis = new Redis({
            host: env.REDIS_HOST,
            port: Number(env.REDIS_PORT),
            password: env.REDIS_PASSWORD
        });
    }

    async createSession(
        userId: string,
        email: string,
        ipAddress?: string,
        userAgent?: string
    ): Promise<string> {
        const sessionId = this.generateSessionId();
        const now = Date.now();

        const sessionInfo: SessionInfo = {
            userId,
            email,
            createdAt: now,
            lastActivity: now,
            ipAddress,
            userAgent
        };

        await this.redis.setex(
            `${this.SESSION_PREFIX}${sessionId}`,
            this.SESSION_TIMEOUT / 1000,
            JSON.stringify(sessionInfo)
        );

        await this.redis.sadd(`${this.USER_SESSIONS_PREFIX}${userId}`, sessionId);

        return sessionId;
    }

    async getSession(sessionId: string): Promise<SessionInfo | null> {
        const data = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
        if (!data) {
            return null;
        }

        return JSON.parse(data) as SessionInfo;
    }

    async updateSessionActivity(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (!session) {
            return;
        }

        session.lastActivity = Date.now();

        await this.redis.setex(
            `${this.SESSION_PREFIX}${sessionId}`,
            this.SESSION_TIMEOUT / 1000,
            JSON.stringify(session)
        );
    }

    async isSessionActive(sessionId: string): Promise<boolean> {
        const session = await this.getSession(sessionId);
        if (!session) {
            return false;
        }

        const now = Date.now();
        const timeSinceActivity = now - session.lastActivity;

        return timeSinceActivity < this.SESSION_TIMEOUT;
    }

    async getUserSessions(userId: string): Promise<ActiveSession[]> {
        const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
        const sessions: ActiveSession[] = [];

        for (const sessionId of sessionIds) {
            const session = await this.getSession(sessionId);
            if (session && (await this.isSessionActive(sessionId))) {
                sessions.push({ sessionId, info: session });
            } else {
                await this.removeSession(sessionId);
            }
        }

        return sessions.sort((a, b) => b.info.lastActivity - a.info.lastActivity);
    }

    async removeSession(sessionId: string): Promise<void> {
        const session = await this.getSession(sessionId);
        if (session) {
            await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
            await this.redis.srem(`${this.USER_SESSIONS_PREFIX}${session.userId}`, sessionId);
        }
    }

    async removeAllUserSessions(userId: string): Promise<void> {
        const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);

        for (const sessionId of sessionIds) {
            await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
        }

        await this.redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
    }

    async invalidateUserSessions(userId: string): Promise<void> {
        await tokenBlacklistService.blacklistUserTokens(userId);
        await this.removeAllUserSessions(userId);
    }

    async cleanupExpiredSessions(): Promise<number> {
        let cleaned = 0;
        const keys = await this.redis.keys(`${this.SESSION_PREFIX}*`);

        for (const key of keys) {
            const sessionId = key.replace(this.SESSION_PREFIX, '');
            if (!(await this.isSessionActive(sessionId))) {
                await this.removeSession(sessionId);
                cleaned++;
            }
        }

        return cleaned;
    }

    private generateSessionId(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    getSessionTimeout(): number {
        return this.SESSION_TIMEOUT;
    }
}

export const sessionService = new SessionService();