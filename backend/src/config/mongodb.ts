import mongoose, { mongo } from "mongoose";
import { env } from "./env"

interface RetryOptions {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
}

class MongoDBConnection {
    private connection: typeof mongoose | null = null;
    private isConnecting = false;
    private retryOptions: RetryOptions = {
        maxRetries: 5,
        retryDelay: 1000,
        backoffMultiplier: 2
    };

    async connect(): Promise<typeof mongoose> {
        if (this.connection && mongoose.connection.readyState === 1) {
            return this.connection
        }
        if (this.isConnecting) {
            return this.waitForConnection();
        }

        this.isConnecting = true;

        try {
            this.connection = await this.connectWithRetry();
            this.isConnecting = false;
            return this.connection;
        } catch (error) {
            this.isConnecting = false;
            throw error;
        }
    }

    private async connectWithRetry(attempt = 1): Promise<typeof mongoose> {
        const { maxRetries, retryDelay, backoffMultiplier } = this.retryOptions;

        try {
            const connection = await mongoose.connect(env.MONGODB_URI, {
                maxPoolSize: 10,
                minPoolSize: 2,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                connectTimeoutMS: 10000,
                heartbeatFrequencyMS: 10000,
                retryWrites: true,
                retryReads: true,
                bufferCommands: false
            });

            console.log('MongoDB connected successfully');
            this.setupEventHandlers();
            return connection
        } catch (error: any) {
            if (attempt >= maxRetries) {
                console.error(`MongoDB connection failed after ${maxRetries} attempts:`, error);
                throw new Error(
                    `MongoDB connection failed after ${maxRetries} retries: ${error.message}`
                )
            }

            const delay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
            console.warn(
                `MongoDB connection attempt ${attempt} failed. Retrying in ${delay}ms... (${attempt}/${maxRetries})`
            );
            await this.sleep(delay);
            return this.connectWithRetry(attempt + 1)
        }
    }

    private async waitForConnection(): Promise<typeof mongoose> {
        const maxWait = 30000;
        const checkInterval = 100;
        const startTime = Date.now();

        while (this.isConnecting && Date.now() - startTime < maxWait) {
            if (this.connection && mongoose.connection.readyState === 1) {
                return this.connection;
            }
            await this.sleep(checkInterval);
        }

        throw new Error('Timeout waiting for MongoDB connection');
    }

    private setupEventHandlers(): void {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection established');
        });

        mongoose.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect....');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        })

        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.disconnect();
            this.connection = null;
            console.log('MongoDB disconnected');
        }
    }

    isConnected(): boolean {
        return mongoose.connection.readyState === 1;
    }

    getConnectionState(): string {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        }

        return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const mongodbConnection = new MongoDBConnection();