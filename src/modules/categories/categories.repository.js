import pool from "../../config/db.js";

//using
export const createCategory = async ({ name, slug, category_type, img_url, media_public_id }) => {
    const query = `
        INSERT INTO categories (
            name,
            slug,
            category_type,
            img_url,
            media_public_id
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        name,
        slug,
        category_type,
        img_url || null,
        media_public_id || null
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

//using
export const getAllCategories = async () => {
    const query = `
        SELECT *
        FROM categories
        WHERE is_active = true
        ORDER BY name
    `;

    const { rows } = await pool.query(query);
    return rows;
};

//using
export const getCategoriesByType = async (type) => {
    const query = `
        SELECT *
        FROM categories
        WHERE category_type = $1
          AND is_active = true
        ORDER BY name
    `;

    const { rows } = await pool.query(query, [type]);
    return rows;
};

//using
export const getCategoryNames = async () => {
    const query = `
        SELECT
            category_id,
            name
        FROM categories
        WHERE is_active = true
        ORDER BY name
    `;

    const { rows } = await pool.query(query);
    return rows;
};

//using
export const findCategoryById = async (id) => {
    const query = `
        SELECT *
        FROM categories
        WHERE category_id = $1
    `;

    const values = [id];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

//using
export const findCategoryByName = async (name) => {
    const query = `
        SELECT *
        FROM categories
        WHERE name = $1
    `;

    const values = [name];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const updateCategory = async (id, {
    name,
    slug,
    img_url,
    media_public_id
}) => {
    const query = `
        UPDATE categories
        SET name = $1,
            slug = $2,
            img_url = $3,
            media_public_id = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = $5
        RETURNING *
    `;

    const values = [
        name,
        slug,
        img_url,
        media_public_id,
        id
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

//using
export const deleteCategory = async (id) => {
    const query = `
        DELETE FROM categories
        WHERE category_id = $1
        RETURNING *
    `;

    const values = [id];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const softDeleteCategory = async (id) => {
    const query = `
        UPDATE categories
        SET is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = $1
        RETURNING *
    `;

    const values = [id];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const restoreCategory = async (id) => {
    const query = `
        UPDATE categories
        SET is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = $1
        RETURNING *
    `;

    const values = [id];

    const { rows } = await pool.query(query, values);
    return rows[0];
};