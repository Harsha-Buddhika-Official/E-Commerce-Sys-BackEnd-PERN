import pool from "../../config/db.js";

// --- In-memory cache for catalog meta (categories/brands/attributes rarely change) ---
let catalogMetaCache = null;
let catalogMetaCachedAt = 0;
const CATALOG_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches a compact "menu" of what filterable data exists:
 * category names, brand names, and attribute names (grouped by category).
 * This is small (names only, not values) so it's cheap to send to the AI
 * every time, and lets the AI map free-text questions to real DB fields
 * even as admins add new categories/brands/attributes later.
 */
export async function getCatalogMeta() {
  const now = Date.now();
  if (catalogMetaCache && now - catalogMetaCachedAt < CATALOG_CACHE_TTL_MS) {
    return catalogMetaCache;
  }

  const [categoriesRes, brandsRes, attributesRes] = await Promise.all([
    pool.query(`SELECT name FROM categories WHERE is_active = true ORDER BY name`),
    pool.query(`SELECT name FROM brands WHERE is_active = true ORDER BY name`),
    pool.query(`
      SELECT DISTINCT a.name AS attribute_name, c.name AS category_name
      FROM attributes a
      JOIN categories c ON c.category_id = a.category_id
      ORDER BY c.name, a.name
    `),
  ]);

  const attributesByCategory = {};
  for (const row of attributesRes.rows) {
    if (!attributesByCategory[row.category_name]) attributesByCategory[row.category_name] = [];
    attributesByCategory[row.category_name].push(row.attribute_name);
  }

  catalogMetaCache = {
    categories: categoriesRes.rows.map((r) => r.name),
    brands: brandsRes.rows.map((r) => r.name),
    attributesByCategory,
  };
  catalogMetaCachedAt = now;

  return catalogMetaCache;
}

/**
 * Dynamically builds a SAFE, parameterized SQL query from AI-extracted filters.
 * The AI never writes SQL - it only returns structured filter values,
 * which are inserted here via placeholders ($1, $2, ...), never string concatenation.
 */
// src/modules/chat/chat.repository.js - searchProducts function එකේ මේ කොටස වෙනස් කරන්න
export async function searchProducts(filters) {
  const {
    categories = [],
    brands = [],
    maxPrice = null,
    minPrice = null,
    attributeFilters = [],
    keywords = [],
    limit = 12,
  } = filters;

  const conditions = ["p.is_active = true"];
  const params = [];
  let paramIndex = 1;

  if (categories.length > 0) {
    conditions.push(`c.name = ANY($${paramIndex}::text[])`);
    params.push(categories);
    paramIndex++;
  }

  if (brands.length > 0) {
    conditions.push(`b.name = ANY($${paramIndex}::text[])`);
    params.push(brands);
    paramIndex++;
  }

  if (maxPrice) {
    conditions.push(`COALESCE(p.discounted_price, p.selling_price) <= $${paramIndex}`);
    params.push(maxPrice);
    paramIndex++;
  }

  if (minPrice) {
    conditions.push(`COALESCE(p.discounted_price, p.selling_price) >= $${paramIndex}`);
    params.push(minPrice);
    paramIndex++;
  }

  // Only apply keyword text-matching if NO category was matched
  // (keywords are a fallback for vague queries, not an extra AND filter on top of a category match)
  if (keywords.length > 0 && categories.length === 0) {
    const keywordConditions = keywords.map(() => {
      const cond = `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      paramIndex++;
      return cond;
    });
    keywords.forEach((kw) => params.push(`%${kw}%`));
    conditions.push(`(${keywordConditions.join(" OR ")})`);
  }

  let attributeJoins = "";
  attributeFilters.forEach((af, i) => {
    const alias = `pa${i}`;
    const attrParam = paramIndex++;
    const valueParam = paramIndex++;
    params.push(af.attribute, `%${af.value}%`);

    attributeJoins += `
      AND EXISTS (
        SELECT 1 FROM product_attributes ${alias}
        JOIN attributes attr${i} ON attr${i}.attribute_id = ${alias}.attribute_id
        WHERE ${alias}.product_id = p.product_id
          AND attr${i}.name = $${attrParam}
          AND ${alias}.value ILIKE $${valueParam}
      )
    `;
  });

  params.push(limit);

  const query = `
    SELECT
      p.product_id,
      p.name,
      COALESCE(p.discounted_price, p.selling_price) AS price,
      p.stock_quantity,
      c.name AS category_name,
      b.name AS brand_name
    FROM products p
    JOIN categories c ON c.category_id = p.category_id
    LEFT JOIN brands b ON b.brand_id = p.brand_id
    WHERE ${conditions.join(" AND ")}
    ${attributeJoins}
    ORDER BY COALESCE(p.discounted_price, p.selling_price) ASC
    LIMIT $${paramIndex}
  `;

  const { rows } = await pool.query(query, params);
  return rows;
}