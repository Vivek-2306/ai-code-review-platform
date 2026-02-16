import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';
import projectRouter from './routes/project.routes';
import gitRouter from './routes/git.routes';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.use('/health', healthRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/git', gitRouter);
app.use('/api/projects', projectRouter);

export default app;