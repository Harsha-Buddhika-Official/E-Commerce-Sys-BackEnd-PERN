import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}

if(!process.env.PORT){
    throw new Error('PORT is required');
}

const config = {
    port: process.env.PORT,
    jwtSecret: process.env.JWT_SECRET,
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT
    }
}

export default config;