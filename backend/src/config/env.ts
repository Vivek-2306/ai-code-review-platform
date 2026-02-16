import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_VERSION: process.env.API_VERSION || 'v1',

    POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
    POSTGRES_PORT: process.env.POSTGRES_PORT || 5432,
    POSTGRES_USER: process.env.POSTGRES_USER || 'admin',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'admin123',
    POSTGRES_DB: process.env.POSTGRES_DB || 'code_review_db',

    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/code_review_db',

    JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    JWT_REFRESH_THRESHOLD: process.env.JWT_REFRESH_THRESHOLD || '1d',
    SESSION_INACTIVITY_TIMEOUT: process.env.SESSION_INACTIVITY_TIMEOUT || '30m',
    MAX_SESSION_DURATION: process.env.MAX_SESSION_DURATION || '90d',
    TOKEN_STORAGE_STATERGY: process.env.TOKEN_STORAGE_STATERGY || 'both',
    TOKEN_HTTP_ONLY: process.env.TOKEN_HTTP_ONLY || 'true',
    TOKEN_SAME_SITE: process.env.TOKEN_SAME_SITE || 'lax',

    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
    OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS || 4000,

    GRPC_HOST: process.env.GRPC_HOST || 'localhost',
    GRPC_PORT: process.env.GRPC_PORT || 50051,
    GRPC_AI_SERVICE_URL: process.env.GRPC_AI_SERVICE_URL || 'localhost:50051',

    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'admin123',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/oauth/github/callback',

    GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID || '',
    GITLAB_CLIENT_SECRET: process.env.GITLAB_CLIENT_SECRET || '',
    GITLAB_REDIRECT_URI: process.env.GITLAB_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/oauth/gitlab/callback',

    BITBUCKET_CLIENT_ID: process.env.BITBUCKET_CLIENT_ID || '',
    BITBUCKET_CLIENT_SECRET: process.env.BITBUCKET_CLIENT_SECRET || '',
    BITBUCKET_REDIRECT_URI: process.env.BITBUCKET_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/oauth/bitbucket/callback',

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/v1/auth/oauth/google/callback',

    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};