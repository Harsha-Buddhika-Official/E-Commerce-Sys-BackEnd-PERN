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

export const getAttributeValueById = async (attributeValueId, client = pool) => {
  const query = `
    SELECT
      av.attribute_value_id,
      av.attribute_id,
      av.value
    FROM attribute_values av
    WHERE av.attribute_value_id = $1
    LIMIT 1
  `;

  const { rows } = await client.query(query, [attributeValueId]);
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
    const baseIndex = index * 4;
    placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`);

    values.push(
      productId,
      attribute.attribute_id,
      attribute.attribute_value_id,
      attribute.value
    );
  });

  const query = `
    INSERT INTO product_attributes
      (product_id, attribute_id, attribute_value_id, value)
    VALUES ${placeholders.join(",")}
  `;

  await client.query(query, values);
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

export const getAllProductsDetailsSimple = async () => {
  const query = `
    SELECT p.product_id,p.name,p.discounted_price,p.is_active,c.name AS category_name FROM products p
    JOIN categories c ON c.category_id = p.category_id
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getAllProducts = async () => {
  const query = `
    SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name,
      CASE
        WHEN active_offer.id IS NULL THEN p.discounted_price
        WHEN active_offer.discount_type = 'percentage' THEN GREATEST(0, p.selling_price - (p.selling_price * active_offer.discount_value / 100))
        ELSE GREATEST(0, p.selling_price - active_offer.discount_value)
      END AS discounted_price,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images, '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    LEFT JOIN LATERAL (
      SELECT o.id, o.discount_type, o.discount_value
      FROM offer_products op
      JOIN offers o ON o.id = op.offer_id
      WHERE op.product_id = p.product_id
        AND o.is_active = true
        AND NOW() BETWEEN o.start_date AND o.end_date
      ORDER BY o.start_date DESC
      LIMIT 1
    ) active_offer ON true
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

export const getAllProductLimitedDetilas = async () => {
  const query = `
    SELECT
      p.product_id,
      p.name AS product_name,
      b.name AS brand_name,
      c.name AS category_name,
      p.stock_quantity,
      CASE
        WHEN p.stock_quantity <= 0 THEN 'OUT_OF_STOCK'
        WHEN p.stock_quantity <= 3 THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
      END AS stock_status,
      p.base_price,
      p.selling_price,
      CASE
        WHEN active_offer.id IS NULL THEN p.discounted_price
        WHEN active_offer.discount_type = 'percentage' THEN GREATEST(0, p.selling_price - (p.selling_price * active_offer.discount_value / 100))
        ELSE GREATEST(0, p.selling_price - active_offer.discount_value)
      END AS discounted_price,
      pi.image_url AS primary_image
    FROM products p
    LEFT JOIN brands b
      ON b.brand_id = p.brand_id
    LEFT JOIN categories c
      ON c.category_id = p.category_id
    LEFT JOIN LATERAL (
      SELECT o.id, o.discount_type, o.discount_value
      FROM offer_products op
      JOIN offers o ON o.id = op.offer_id
      WHERE op.product_id = p.product_id
        AND o.is_active = true
        AND NOW() BETWEEN o.start_date AND o.end_date
      ORDER BY o.start_date DESC
      LIMIT 1
    ) active_offer ON true
    LEFT JOIN product_images pi
      ON pi.product_id = p.product_id
      AND pi.is_primary = true
    WHERE p.is_active = true
    ORDER BY p.created_at DESC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

  export const getAllDetialsProductById = async (id) => {
    const query = `SELECT
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.base_price,
        p.selling_price,
        p.discounted_price,
        p.stock_quantity,
        CASE
          WHEN p.stock_quantity <= 0 THEN 'OUT_OF_STOCK'
          WHEN p.stock_quantity <= 3 THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status,
        p.warranty_months,
        p.product_tag,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.category_type,
        c.img_url AS category_image,
        c.is_active AS category_active,
        b.brand_id,
        b.name AS brand_name,
        b.slug AS brand_slug,
        b.logo_url,
        b.is_active AS brand_active,
        COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
        COALESCE(img_agg.images, '[]'::json) AS images
  FROM products p
  LEFT JOIN categories c
        ON c.category_id = p.category_id
  LEFT JOIN brands b
        ON b.brand_id = p.brand_id
  LEFT JOIN (
        SELECT
              pa.product_id,
              JSON_AGG(
                    JSON_BUILD_OBJECT(
                          'product_attribute_id', pa.product_attribute_id,
                          'attribute_id', pa.attribute_id,
                          'attribute_name', a.name,
                          'attribute_value_id', pa.attribute_value_id,
                          'value', pa.value
                    )
                    ORDER BY pa.product_attribute_id
              ) AS attributes
        FROM product_attributes pa
        LEFT JOIN attributes a
              ON a.attribute_id = pa.attribute_id
        GROUP BY pa.product_id
  ) attr_agg
        ON attr_agg.product_id = p.product_id
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
                    )
                    ORDER BY pi.sort_order
              ) AS images
        FROM product_images pi
        GROUP BY pi.product_id
  ) img_agg
        ON img_agg.product_id = p.product_id
  WHERE p.product_id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  };


export const getProductsByCategory = async (categoryId) => {
  const query = `SELECT
        p.*,
        c.name AS category_name,
        b.name AS brand_name,
        p.discounted_price,
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
  AND p.category_id = $1
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
    ORDER BY p.product_id DESC
    LIMIT 8;
  `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getLatestProducts = async () => {
  const query = `SELECT
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
  const query = `SELECT
        p.*,
        c.name AS category_name,
        b.name AS brand_name,
        p.discounted_price,
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
  WHERE p.product_id = $1`;
  const values = [id];
  const { rows } = await client.query(query, values);
  return rows[0];
};

export const findProductByName = async (name, client = pool) => {
  const query = `
    SELECT * FROM products WHERE name = $1 AND is_active = true
  `;
  const values = [name];
  const { rows } = await client.query(query, values);
  return rows[0];
}

export const findProductByNameForSearch = async (name, client = pool) => {
  const query = `SELECT
      p.*,
      c.name AS category_name
  FROM products p
  LEFT JOIN categories c
      ON c.category_id = p.category_id
  WHERE p.name ILIKE '%' || $1 || '%'
  LIMIT 20;`;
  const values = [name];
  const { rows } = await client.query(query, values);
  return rows;
};

export const findProductByNameAdvanced = async (name, client = pool) => {
  const query = `SELECT
      p.*,
      c.name AS category_name,
      b.name AS brand_name,
      CASE
        WHEN active_offer.id IS NULL THEN p.discounted_price
        WHEN active_offer.discount_type = 'percentage' THEN GREATEST(0, p.selling_price - (p.selling_price * active_offer.discount_value / 100))
        ELSE GREATEST(0, p.selling_price - active_offer.discount_value)
      END AS discounted_price

  FROM products p

  LEFT JOIN categories c
      ON c.category_id = p.category_id

  LEFT JOIN brands b
      ON b.brand_id = p.brand_id

  LEFT JOIN LATERAL (
      SELECT o.id, o.discount_type, o.discount_value
      FROM offer_products op
      JOIN offers o ON o.id = op.offer_id
      WHERE op.product_id = p.product_id
        AND o.is_active = true
        AND NOW() BETWEEN o.start_date AND o.end_date
      ORDER BY o.start_date DESC
      LIMIT 1
  ) active_offer ON true

  WHERE p.name ILIKE '%' || $1 || '%'

  LIMIT 20;`;
  const values = [name];
  const { rows } = await client.query(query, values);
  return rows;
};

export const updateProduct = async (id, productData, client = pool) => {
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
    product_tag,
    is_active,
    images
  } = productData;

  // -----------------------------------
  // 1. UPDATE PRODUCT FIELDS
  // -----------------------------------
  const productQuery = `
    UPDATE products
    SET
      name               = $1,
      brand_id           = $2,
      category_id        = $3,
      slug               = $4,
      description        = $5,
      base_price         = $6,
      selling_price      = $7,
      discounted_price   = $8,
      stock_quantity     = $9,
      warranty_months    = $10,
      product_tag        = $11,
      is_active          = $12,
      updated_at         = CURRENT_TIMESTAMP
    WHERE product_id = $13
    RETURNING *
  `;

  const productValues = [
    name,
    brand_id           || null,
    category_id,
    slug,
    description        || null,
    base_price         || null,
    selling_price      || null,
    discounted_price,
    stock_quantity     || 0,
    warranty_months    || null,
    product_tag        || null,
    is_active          ?? true,
    id
  ];

  const { rows } = await client.query(productQuery, productValues);
  const updatedProduct = rows[0];

  // -----------------------------------
  // 2. REPLACE IMAGE ROWS WITH FINAL MERGED SET
  //    (service layer already merged old + new,
  //     so we just wipe and reinsert the full final state)
  // -----------------------------------
  if (images && images.length > 0) {

    // Wipe existing rows for clean reinsert
    await client.query(
      `DELETE FROM product_images WHERE product_id = $1`,
      [id]
    );

    // Reinsert full final image set
    for (const [index, img] of images.entries()) {
      await client.query(
        `INSERT INTO product_images
           (product_id, image_url, product_image_id, is_primary, alt_text, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          img.image_url,
          img.product_image_id  || null,
          img.is_primary        ?? (index === 0),
          img.alt_text          || null,
          img.sort_order        ?? index
        ]
      );
    }
  }

  return updatedProduct;
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
      CASE
        WHEN active_offer.id IS NULL THEN p.discounted_price
        WHEN active_offer.discount_type = 'percentage' THEN GREATEST(0, p.selling_price - (p.selling_price * active_offer.discount_value / 100))
        ELSE GREATEST(0, p.selling_price - active_offer.discount_value)
      END AS discounted_price,
      COALESCE(attr_agg.attributes, '[]'::json) AS attributes,
      COALESCE(img_agg.images,      '[]'::json) AS images
    FROM products p
    LEFT JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b     ON b.brand_id    = p.brand_id
    LEFT JOIN LATERAL (
      SELECT o.id, o.discount_type, o.discount_value
      FROM offer_products op
      JOIN offers o ON o.id = op.offer_id
      WHERE op.product_id = p.product_id
        AND o.is_active = true
        AND NOW() BETWEEN o.start_date AND o.end_date
      ORDER BY o.start_date DESC
      LIMIT 1
    ) active_offer ON true
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

export const getImagesById = async(id) => {
  const quary = `SELECT * FROM product_images WHERE product_id = $1`;
  const { rows } = await pool.query(quary, [id]);
  return rows;
}

export const deleteImagesById = async(id) => {
  // console.log("Deleting image with ID:", id);
  const quary = `DELETE FROM product_images WHERE image_id = $1 RETURNING *`;
  const{ rows } = await pool.query(quary,[id]);
  // console.log("rows",rows)
  return rows;
}

export const updateProductFieldsOnly = async (id, productData, client = pool) => {
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
    product_tag,
    is_active,
  } = productData;

  const query = `
    UPDATE products
    SET
      name             = $1,
      brand_id         = $2,
      category_id      = $3,
      slug             = $4,
      description      = $5,
      base_price       = $6,
      selling_price    = $7,
      discounted_price = $8,
      stock_quantity   = $9,
      warranty_months  = $10,
      product_tag      = $11,
      is_active        = $12,
      updated_at       = CURRENT_TIMESTAMP
    WHERE product_id = $13
    RETURNING *
  `;

  const values = [
    name,
    brand_id        || null,
    category_id,
    slug,
    description     || null,
    base_price      || null,
    selling_price   || null,
    discounted_price,
    stock_quantity  || 0,
    warranty_months || null,
    product_tag     || null,
    is_active       ?? true,
    id,
  ];

  const { rows } = await client.query(query, values);
  return rows[0];
};

export const insertSingleImage = async (productId, image, client = pool) => {
  const query = `
    INSERT INTO product_images
      (product_id, image_url, product_image_id, is_primary, alt_text, sort_order)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [
    productId,
    image.image_url,
    image.product_image_id || null,
    image.is_primary ?? false,
    image.alt_text || null,
    image.sort_order ?? 0,
  ];
  const { rows } = await client.query(query, values);
  return rows[0];
};

export const getImageById = async (imageId, client = pool) => {
  const query = `SELECT * FROM product_images WHERE image_id = $1`;
  const { rows } = await client.query(query, [imageId]);
  return rows[0];
};

export const deleteImageById = async (imageId, client = pool) => {
  const query = `DELETE FROM product_images WHERE image_id = $1 RETURNING *`;
  const { rows } = await client.query(query, [imageId]);
  return rows[0];
};

export const updateImagesOrder = async (productId, orderedImageIds, primaryImageId, client = pool) => {
  for (const [index, imageId] of orderedImageIds.entries()) {
    await client.query(
      `UPDATE product_images
       SET sort_order = $1,
           is_primary = $2
       WHERE image_id = $3
         AND product_id = $4`,
      [index, imageId === primaryImageId, imageId, productId]
    );
  }
};