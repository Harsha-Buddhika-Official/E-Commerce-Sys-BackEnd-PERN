import pool from "../../config/db.js";

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

export const deleteProductImages = async (productId, client = pool) => {
  const query = `DELETE FROM product_images WHERE product_id = $1`;
  const values = [productId];
  await client.query(query, values);
};

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

export const deleteProductAttributes = async (productId, client = pool) => {
  const query = `DELETE FROM product_attributes WHERE product_id = $1`;
  const values = [productId];
  await client.query(query, values);
};

export const insertProductAttributes = async (productId, attributes, client = pool) => {
  if (!attributes || attributes.length === 0) return;

  const values = [];
  const placeholders = [];

  attributes.forEach((attribute, index) => {
    const baseIndex = index * 3;
    placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);

    values.push(
      productId,
      attribute.attribute_id,
      attribute.value
    );
  });

  const query = `
    INSERT INTO product_attributes
      (product_id, attribute_id, value)
    VALUES ${placeholders.join(",")}
  `;

  await client.query(query, values);
};

export const createProductAttribute = async (productId, attributeData, client = pool) => {
  const query = `
    INSERT INTO product_attributes
      (product_id, attribute_id, value)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [productId, attributeData.attribute_id, attributeData.value];
  const { rows } = await client.query(query, values);
  return rows[0];
};

export const removeProductAttribute = async (productId, attributeId, client = pool) => {
  const query = `
    DELETE FROM product_attributes
    WHERE product_id = $1 AND attribute_id = $2
    RETURNING *
  `;
  const values = [productId, attributeId];
  const { rows } = await client.query(query, values);
  return rows[0];
};

export const getAllProducts = async () => {
  const query = `
    SELECT
      p.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id', pa.attribute_id,
            'attribute_name', a.name,
            'value', pa.value
          )
        ) FILTER (WHERE pa.product_attribute_id IS NOT NULL),
        '[]'::json
      ) AS attributes
    FROM products p
    LEFT JOIN product_attributes pa ON pa.product_id = p.product_id
    LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
    WHERE p.is_active = true
    GROUP BY p.product_id
    ORDER BY p.product_id ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const findProductById = async (id, client = pool) => {
  const query = `
    SELECT
      p.*,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id', pa.attribute_id,
            'attribute_name', a.name,
            'value', pa.value
          )
        ) FILTER (WHERE pa.product_attribute_id IS NOT NULL),
        '[]'::json
      ) AS attributes
    FROM products p
    LEFT JOIN product_attributes pa ON pa.product_id = p.product_id
    LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
    WHERE p.product_id = $1
    GROUP BY p.product_id
  `;
  const values = [id];
  const { rows } = await client.query(query, values);
  return rows[0];
};

export const findProductByName = async (name, client = pool) => {
  const query = 'SELECT * FROM products WHERE name = $1 LIMIT 1';
  const values = [name];
  const { rows } = await client.query(query, values);
  return rows[0];
};

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

export const deleteProduct = async (id) => {
  const query = `DELETE FROM products WHERE product_id = $1 RETURNING *`;
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const softDeleteProduct = async (id) => {
  const query = `UPDATE products SET is_active = false,
  updated_at = CURRENT_TIMESTAMP
  WHERE product_id = $1
  RETURNING *`;
  const values = [id];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

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

export const getAttributesByCategory = async (categoryId, client = pool) => {
  const query = `
    SELECT attribute_id, name
    FROM attributes
    WHERE category_id = $1 AND is_active = true
    ORDER BY name ASC
  `;
  const values = [categoryId];
  const { rows } = await client.query(query, values);
  return rows;
};