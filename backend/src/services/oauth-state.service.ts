import Redis from 'ioredis';
import { env } from '@/config/env';

const CONNECT_STATE_PREFIX = 'oauth:connect:state:';
const STATE_TTL_SECONDS = 600; // 10 minutes

export interface ConnectStatePayload {
    userId: string;
    purpose: 'repo';
    provider: string;
}

export class OAuthStateService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: env.REDIS_HOST,
            port: Number(env.REDIS_PORT),
            password: env.REDIS_PASSWORD,
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });
    }

    async setConnectState(state: string, payload: ConnectStatePayload): Promise<void> {
        await this.redis.setex(
            CONNECT_STATE_PREFIX + state,
            STATE_TTL_SECONDS,
            JSON.stringify(payload)
        );
    }

    async getConnectState(state: string): Promise<ConnectStatePayload | null> {
        const raw = await this.redis.get(CONNECT_STATE_PREFIX + state);
        if (!raw) return null;
        await this.redis.del(CONNECT_STATE_PREFIX + state);
        try {
            return JSON.parse(raw) as ConnectStatePayload;
        } catch {
            return null;
        }
    }
}

export const oauthStateService = new OAuthStateService();
