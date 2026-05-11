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
    discounted_price,
    stock_quantity,
    warranty_months,
    product_tag
  } = productData;

  const query = `
    INSERT INTO products
      (name, brand_id, category_id, slug, description, base_price, selling_price, discounted_price, stock_quantity, warranty_months, product_tag)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
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
    discounted_price,
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
      c.name AS category_name,
      b.name AS brand_name,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images, '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN (
      SELECT
        pa.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id', pa.attribute_id,
            'attribute_name', a.name,
            'value', pa.value
          )
        ) AS attributes
      FROM product_attributes pa
      LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
      GROUP BY pa.product_id
    ) attr_agg ON attr_agg.product_id = p.product_id
    LEFT JOIN (
      SELECT
        pi.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'image_id', pi.image_id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary,
            'alt_text', pi.alt_text,
            'sort_order', pi.sort_order
          ) ORDER BY pi.sort_order
        ) AS images
      FROM product_images pi
      GROUP BY pi.product_id
    ) img_agg ON img_agg.product_id = p.product_id
    WHERE p.is_active = true
    ORDER BY p.product_id ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getProductsByCategory = async (categoryId) => {
  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images, '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN (
      SELECT
        pa.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id', pa.attribute_id,
            'attribute_name', a.name,
            'value', pa.value
          )
        ) AS attributes
      FROM product_attributes pa
      LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
      GROUP BY pa.product_id
    ) attr_agg ON attr_agg.product_id = p.product_id
    LEFT JOIN (
      SELECT
        pi.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'image_id', pi.image_id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary,
            'alt_text', pi.alt_text,
            'sort_order', pi.sort_order
          ) ORDER BY pi.sort_order
        ) AS images
      FROM product_images pi
      GROUP BY pi.product_id
    ) img_agg ON img_agg.product_id = p.product_id
    WHERE p.is_active = true AND p.category_id = $1
    ORDER BY p.product_id ASC
  `;
  const { rows } = await pool.query(query, [categoryId]);
  return rows;
};

export const getBestSellingProducts = async () => {
  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images, '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN (
      SELECT
        pa.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id', pa.attribute_id,
            'attribute_name', a.name,
            'value', pa.value
          )
        ) AS attributes
      FROM product_attributes pa
      LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
      GROUP BY pa.product_id
    ) attr_agg ON attr_agg.product_id = p.product_id
    LEFT JOIN (
      SELECT
        pi.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'image_id', pi.image_id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary,
            'alt_text', pi.alt_text,
            'sort_order', pi.sort_order
          ) ORDER BY pi.sort_order
        ) AS images
      FROM product_images pi
      GROUP BY pi.product_id
    ) img_agg ON img_agg.product_id = p.product_id
    WHERE p.is_active = true
    AND p.product_tag = 'BEST_SELLER'
    ORDER BY p.product_id ASC;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getLatestProducts = async () => {
  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images, '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN (
      SELECT
        pa.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id', pa.attribute_id,
            'attribute_name', a.name,
            'value', pa.value
          )
        ) AS attributes
      FROM product_attributes pa
      LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
      GROUP BY pa.product_id
    ) attr_agg ON attr_agg.product_id = p.product_id
    LEFT JOIN (
      SELECT
        pi.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'image_id', pi.image_id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary,
            'alt_text', pi.alt_text,
            'sort_order', pi.sort_order
          ) ORDER BY pi.sort_order
        ) AS images
      FROM product_images pi
      GROUP BY pi.product_id
    ) img_agg ON img_agg.product_id = p.product_id
    WHERE p.is_active = true
    ORDER BY p.created_at DESC
    LIMIT 8;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const findProductById = async (id, client = pool) => {
  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images, '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN (
      SELECT
        pa.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id', pa.attribute_id,
            'attribute_name', a.name,
            'value', pa.value
          )
        ) AS attributes
      FROM product_attributes pa
      LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
      GROUP BY pa.product_id
    ) attr_agg ON attr_agg.product_id = p.product_id
    LEFT JOIN (
      SELECT
        pi.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'image_id', pi.image_id,
            'image_url', pi.image_url,
            'is_primary', pi.is_primary,
            'alt_text', pi.alt_text,
            'sort_order', pi.sort_order
          ) ORDER BY pi.sort_order
        ) AS images
      FROM product_images pi
      GROUP BY pi.product_id
    ) img_agg ON img_agg.product_id = p.product_id
    WHERE p.product_id = $1
  `;
  const values = [id];
  const { rows } = await client.query(query, values);
  return rows[0];
};

export const findProductByName = async (name, client = pool) => {
  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    WHERE p.name = $1
    LIMIT 1
  `;
  const values = [name];
  const { rows } = await client.query(query, values);
  return rows[0];
};

export const updateProduct = async (id, productData, client = pool) => {
  const { name, brand_id, category_id, slug, description, base_price, selling_price, discounted_price, stock_quantity, warranty_months, product_tag } = productData;
  const query = `
    UPDATE products
    SET name = $1, brand_id = $2, category_id = $3, slug = $4, description = $5, base_price = $6, selling_price = $7, discounted_price = $8, stock_quantity = $9, warranty_months = $10, product_tag = $11, updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $12
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
    discounted_price,
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

export const getAttributesByCategory = async (categoryId) => {
  const query = `
            SELECT
        a.attribute_id,
        a.name        AS attribute_name,
        pa.value,
        COUNT(DISTINCT p.product_id) AS product_count
        FROM attributes a
        JOIN product_attributes pa ON pa.attribute_id = a.attribute_id
        JOIN products p            ON p.product_id    = pa.product_id
        WHERE a.category_id = $1
        AND p.is_active   = true
        GROUP BY a.attribute_id, a.name, pa.value
        ORDER BY a.name, pa.value
    `;
  const values = [categoryId];
  const { rows } = await pool.query(query, values);
  return rows;
};


export const getFilteredProducts = async ({ categoryId, attributeFilters = [], priceMin, priceMax }) => {
  const conditions = [`p.category_id = $1`, `p.is_active = true`];
  const params = [categoryId];
  let idx = 2;

  if (priceMin !== undefined) {
    conditions.push(`p.selling_price >= $${idx++}`);
    params.push(priceMin);
  }

  if (priceMax !== undefined) {
    conditions.push(`p.selling_price <= $${idx++}`);
    params.push(priceMax);
  }

  for (const { attributeId, values } of attributeFilters) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM product_attributes pa2
        WHERE pa2.product_id   = p.product_id
          AND pa2.attribute_id = $${idx++}
          AND pa2.value        = ANY($${idx++}::text[])
      )
    `);
    params.push(Number(attributeId), values); // values is already a JS array — pg handles it
  }

  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images,      '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b     ON b.brand_id    = p.brand_id
    LEFT JOIN (
      SELECT
        pa.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'product_attribute_id', pa.product_attribute_id,
            'attribute_id',         pa.attribute_id,
            'attribute_name',       a.name,
            'value',                pa.value
          )
        ) AS attributes
      FROM product_attributes pa
      LEFT JOIN attributes a ON a.attribute_id = pa.attribute_id
      GROUP BY pa.product_id
    ) attr_agg ON attr_agg.product_id = p.product_id
    LEFT JOIN (
      SELECT
        pi.product_id,
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'image_id',   pi.image_id,
            'image_url',  pi.image_url,
            'is_primary', pi.is_primary,
            'alt_text',   pi.alt_text,
            'sort_order', pi.sort_order
          ) ORDER BY pi.sort_order
        ) AS images
      FROM product_images pi
      GROUP BY pi.product_id
    ) img_agg ON img_agg.product_id = p.product_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY p.created_at DESC
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};