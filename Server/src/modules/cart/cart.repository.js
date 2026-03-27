import pool from '../../config/database.js';

export const createCart = async (userId) => {
  const connection = await pool.getConnection(async (conn) => conn);
    try {
        const query = 'INSERT INTO carts (user_id) VALUES (?)';
        const [result] = await connection.execute(query, [userId]);
        return result;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};