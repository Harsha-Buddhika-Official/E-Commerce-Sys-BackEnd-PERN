import app from './app.js';
import pool from './config/db.js';

const port = 3000;

const startServer = async () => {
    try {
        await pool.query('SELECT 1'); // testing database connection
        console.log('Database connection successful');
        
        app.listen(port,() => {
            console.log(`Server is running on port ${port}`);
            console.log(`http://localhost:${port}`);
        })
    } catch(err) {
        console.error("Failed to start server", err);
        process.exit(1);
    }
}

startServer();
