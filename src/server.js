import app from './app.js';
import connectDB from './config/connectDB.js';
import config from './config/env.js';

const port = config.port;

const startServer = async () => {
    try {
        await connectDB();
        
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
