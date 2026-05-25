import { Pool } from 'pg';
import config from './env.js';

//for local development

const pool = new Pool({
    user: config.db.user,
    host: config.db.host,
    database: config.db.name,
    password: config.db.password,
    port: config.db.port
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(-1);
});

export default pool;

//for neon

// import { Pool } from 'pg';
// import './env.js';

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,

//   ssl: {
//     rejectUnauthorized: false,
//   },

//   max: 10,
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 10000,
// });

// pool.on('connect', () => {
//   console.log('✅ Neon connected');
// });

// pool.on('error', (err) => {
//   console.error('DB error:', err);
// });

// export default pool;