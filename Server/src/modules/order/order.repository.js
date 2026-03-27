import pool from '../../config/database.js';

export const getCartItemsByUserId = async (userId) => {
  const query = `
    SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = (
      SELECT id FROM carts WHERE user_id = ?
    )
  `;
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(query, [userId]);
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};