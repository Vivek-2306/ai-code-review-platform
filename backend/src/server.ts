import app from './app';
import { AppDataSource } from './config/datasource';
import { runMigrations } from './config/migration-runner';
import { mongodbConnection } from './config/mongodb';

const PORT = process.env.PORT || 3001;

async function intializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('Postgres DB Connected');

    await runMigrations();
    console.log('Migrations completed successfully');

    await mongodbConnection.connect();
    console.log('MongoDB connected');
    console.log('All databases initialized successfully');
  } catch (error) {
    console.error('Database initialized failed:', error);
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  await intializeDatabase();
});