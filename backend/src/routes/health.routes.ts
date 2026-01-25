import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/datasource';
import { mongodbConnection } from '../config/mongodb';

const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            postgres: {
                status: 'unknown',
                connected: false,
                error: null,
            },
            mongodb: {
                status: 'unknown',
                connected: false,
                state: mongodbConnection.getConnectionState(),
                error: null,
            },
        },
    };

    // Check PostgreSQL connection
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.query('SELECT 1');
            health.services.postgres = {
                status: 'connected',
                connected: true,
                error: null,
            };
        } else {
            health.services.postgres = {
                status: 'not_initialized',
                connected: false,
                error: null,
            };
        }
    } catch (error: any) {
        health.services.postgres = {
            status: 'error',
            connected: false,
            error: error.message,
        };
    }

    // Check MongoDB connection
    try {
        if (mongodbConnection.isConnected()) {
            const conn = await mongodbConnection.connect();
            await conn.connection.db?.admin().ping();
            health.services.mongodb = {
                status: 'connected',
                connected: true,
                state: mongodbConnection.getConnectionState(),
                error: null,
            };
        } else {
            health.services.mongodb = {
                status: 'disconnected',
                connected: false,
                state: mongodbConnection.getConnectionState(),
                error: null,
            };
        }
    } catch (error: any) {
        health.services.mongodb = {
            status: 'error',
            connected: false,
            state: mongodbConnection.getConnectionState(),
            error: error.message,
        };
    }

    // Determine overall health
    const allHealthy =
        health.services.postgres.connected &&
        health.services.mongodb.connected;

    res.status(allHealthy ? 200 : 503).json(health);
});

export default healthRouter;