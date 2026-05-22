import pool from "../../config/db.js";

export const getOrderNotifications = async (userId) => {
  const query = `
    SELECT order_id, customer_email FROM orders
    WHERE created_at = NOW()
    `;
    const [rows] = await pool.query(query, [userId]);
    return rows;
}