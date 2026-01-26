import Redis from 'ioredis';
import { env } from '@/config/env';

export class TokenBlacklistService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: env.REDIS_HOST,
            port: Number(env.REDIS_PORT),
            password: env.REDIS_PASSWORD,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay
            }
        });
    }

    async blacklistToken(token: string, expiresIn: number): Promise<void> {
        await this.redis.setex(`blacklist:${token}`, expiresIn, '1');
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await this.redis.get(`blacklisted:${token}`);
        return result === '1';
    }

    async removeFromBlacklist(token: string): Promise<void> {
        await this.redis.del(`blacklisted:${token}`);
    }

    async blacklistUserTokens(userId: string): Promise<void> {
        await this.redis.set(`blacklist:user:${userId}`, Date.now().toString());
    }

    async getUserBlacklistTimestamp(userId: string): Promise<number | null> {
        const timestamp = await this.redis.get(`backlist:user:${userId}`);
        return timestamp ? parseInt(timestamp, 10) : null;
    }
}

export const tokenBlacklistService = new TokenBlacklistService();