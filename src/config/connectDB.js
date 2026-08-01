import pool from './db.js';

const RETRY_INTERVAL_MS = 2000;
const MAX_RETRY_DURATION_MS = 30000;

const connectDB = async () => {
    const startTime = Date.now();

    while (true) {
        try {
            await pool.query('SELECT 1');
            // await pool.query('SET search_path TO public'); //this is only for neon database because tables name change like table_name -> public.table_name
            console.log('✅ Database connection successful');
            return;
        } catch (err) {
            const elapsed = Date.now() - startTime;
            const remaining = MAX_RETRY_DURATION_MS - elapsed;

            if (remaining <= 0) {
                console.error('❌ Could not connect to database after 30s. Shutting down.');
                process.exit(1);
            }

            console.warn(`⚠️  DB connection failed. Retrying in 2s... (${Math.ceil(remaining / 1000)}s left)`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL_MS));
        }
    }
};

export default connectDB;