import pool from "../../config/db.js";

// create product with transaction
export const createProduct = async (productData, client = pool) => {

  const {
    name,
    brand_id,
    category_id,
    slug,
    description,
    base_price,
    selling_price,
    stock_quantity,
    warranty_months,
    product_tag
  } = productData;

  const query = `
    INSERT INTO products
      (name, brand_id, category_id, slug, description, base_price, selling_price, stock_quantity, warranty_months, product_tag)
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
    stock_quantity ?? 0,
    warranty_months ?? null,
    product_tag ?? null
  ];

  const { rows } = await client.query(query, values);
  return rows[0];
};

// delete product images
export const deleteProductImages = async (productId, client = pool) => {
  const query = `DELETE FROM product_images WHERE product_id = $1`;
  const values = [productId];
  await client.query(query, values);
};

// insert product images
export const insertProductImages = async (productId, images, client = pool) => {
  if (!images || images.length === 0) return;

  const values = [];
  const placeholders = [];

  images.forEach((img, index) => {
    const baseIndex = index * 5;
    placeholders.push(
      `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`
    );

    values.push(
      productId,
      img.image_url,
      img.is_primary ?? false,
      img.alt_text ?? "",
      img.sort_order ?? index
    );
  });

  const query = `
    INSERT INTO product_images
    (product_id, image_url, is_primary, alt_text, sort_order)
    VALUES ${placeholders.join(",")}
  `;

  await client.query(query, values);

};

// get all products
export const getAllProducts = async () => {
  const query = 'SELECT * FROM products WHERE is_active = true ORDER BY name';
  const { rows } = await pool.query(query);
  return rows;
};

// get product by id
export const findProductById = async (id) => {
  const query = 'SELECT * FROM products WHERE product_id = $1';
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// get product by name
export const findProductByName = async (name) => {
  const query = 'SELECT * FROM products WHERE name = $1 LIMIT 1';
  const values = [name];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// update product with transaction support
export const updateProduct = async (id, productData, client = pool) => {
  const { name, brand_id, category_id, slug, description, base_price, selling_price, stock_quantity, warranty_months, product_tag } = productData;
  const query = `
    UPDATE products
    SET name = $1, brand_id = $2, category_id = $3, slug = $4, description = $5, base_price = $6, selling_price = $7, stock_quantity = $8, warranty_months = $9, product_tag = $10, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $11
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
    product_tag || null,
    id
  ];
  const { rows } = await client.query(query, values);
  return rows[0];
};

// delete product
export const deleteProduct = async (id) => {
  const query = `DELETE FROM products WHERE product_id = $1 RETURNING *`;
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// soft delete product
export const softDeleteProduct = async (id) => {
  const query = `UPDATE products SET is_active = false,
  updated_at = CURRENT_TIMESTAMP
  WHERE product_id = $1
  RETURNING *`;
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

// restore product
export const restoreProduct = async (id) => {
  const query = `UPDATE products
  SET is_active = true,
  updated_at = CURRENT_TIMESTAMP
  WHERE product_id = $1
  RETURNING *`;
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};