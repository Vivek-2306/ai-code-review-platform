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
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your_openai_api_key',
    OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
    OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS || 4000,
    GRPC_HOST: process.env.GRPC_HOST || 'localhost',
    GRPC_PORT: process.env.GRPC_PORT || 50051,
    GRPC_AI_SERVICE_URL: process.env.GRPC_AI_SERVICE_URL || 'localhost:50051',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'admin123',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};