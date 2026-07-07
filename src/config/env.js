import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'PORT',
    'JWT_SECRET',

    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_NAME',
    'DB_PORT',

    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
];

// validate env variables
requiredEnvVars.forEach((key) => {

    if (!process.env[key]) {
        throw new Error(`${key} is required in .env`);
    }

});

const config = {

    port: process.env.PORT,

    jwtSecret: process.env.JWT_SECRET,
    // databaseUrl: process.env.DATABASE_URL,
    db: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        port: process.env.DB_PORT
    },

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    }

};

export default config;

// import dotenv from 'dotenv';

// dotenv.config();

// if (!process.env.JWT_SECRET) {
//   throw new Error('JWT_SECRET is required');
// }

// if (!process.env.PORT) {
//   throw new Error('PORT is required');
// }

// if (!process.env.DATABASE_URL) {
//   throw new Error('DATABASE_URL is required');
// }

// const config = {
//   port: process.env.PORT,
//   jwtSecret: process.env.JWT_SECRET,
//   databaseUrl: process.env.DATABASE_URL,
// };

// export default config;