import { AppDataSource } from './datasource';

export async function runMigrations(): Promise<void> {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const pendingMigrations = await AppDataSource.showMigrations();

        if (Array.isArray(pendingMigrations) && pendingMigrations.length > 0) {
            console.log(`🔄 Running ${pendingMigrations.length} pending migration(s)...`);
            await AppDataSource.runMigrations();
            console.log('✅ Migrations completed successfully');
        } else {
            console.log('✅ No pending migrations');
        }
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}