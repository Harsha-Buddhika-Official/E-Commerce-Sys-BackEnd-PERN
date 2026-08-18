import pool from '../../config/db.js';

export async function getProductsByIds(productIds) {
  const query = `
    SELECT
      p.name,
      p.brand_id,
      p.category_id,
      p.slug,
      p.description,
      p.selling_price,
      p.discounted_price,
      p.stock_quantity,
      p.warranty_months,
      p.is_active,
      p.created_at,
      p.updated_at,
      p.product_tag,
      p.base_price,

      (
        SELECT json_build_object(
          'brand_id', b.brand_id,
          'name', b.name
        )
        FROM brands b
        WHERE b.brand_id = p.brand_id
      ) AS brand,

      (
        SELECT json_build_object(
          'category_id', c.category_id,
          'name', c.name
        )
        FROM categories c
        WHERE c.category_id = p.category_id
      ) AS category,

      COALESCE(
        (
          SELECT json_object_agg(
            a.name,
            pav.attribute_data
          )
          FROM product_attributes pa
          JOIN attributes a
            ON a.attribute_id = pa.attribute_id
          LEFT JOIN LATERAL (
            SELECT json_build_object(
              'value', pa.value,
              'attribute_value_id', av.attribute_value_id,
              'attribute_value', av.value,
              'slug', av.slug
            ) AS attribute_data
            FROM attribute_values av
            WHERE av.attribute_value_id = pa.attribute_value_id
          ) pav ON true
          WHERE pa.product_id = p.product_id
        ),
        '{}'::json
      ) AS attributes

    FROM products p
    WHERE p.product_id = ANY($1::int[])
  `;

  const { rows } = await pool.query(query, [productIds]);

  return rows;
}