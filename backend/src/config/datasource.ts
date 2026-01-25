import { DataSource } from 'typeorm';
import { env } from './env';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: env.POSTGRES_HOST,
    port: Number(env.POSTGRES_PORT),
    username: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    entities: [__dirname + '/../models/**/*.entity.{ts,js}'],
    migrations: [__dirname + '/../migrations/*.{ts,js}'],
    synchronize: false,
    logging: env.NODE_ENV === 'development',
});