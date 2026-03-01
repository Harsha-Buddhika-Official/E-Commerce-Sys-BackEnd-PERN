import pool from "../../config/db.js";

export const createProduct = async (productData) => {
  const { name, brand_id, category_id, slug, description, base_price, selling_price, stock_quantity, warranty_months, is_active } = productData;
  const query = `
    INSERT INTO products
      (name, brand_id, category_id, slug, description, base_price, selling_price, stock_quantity, warranty_months, is_active)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;
  const values = [
    name,
    brand_id,
    category_id,
    slug,
    description || null,
    base_price,
    selling_price,
    stock_quantity || 0,
    warranty_months || null,
    is_active !== undefined ? is_active : true
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const findByName = async (name) => {
  const query = 'SELECT * FROM products WHERE name = $1 LIMIT 1';
  const values = [name];
  const { rows } = await pool.query(query, values);
  return rows[0];
};