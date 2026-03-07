import pool from "../../config/db.js";

//create category
export const createCategory = async (categoryData) => {
    const { name, slug, category_type } = categoryData;
    const query = `
        INSERT INTO categories (name, slug, category_type)
        VALUES ($1, $2, $3)
        RETURNING *
    `;
    const values = [name, slug, category_type];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//get all categories
export const getAllCategories = async () => {
    const query = `SELECT * FROM categories WHERE is_active = true ORDER BY name`;
    const { rows } = await pool.query(query);
    return rows;
};

//get categories by category_type
export const getCategoriesByType = async (type) => {
    const query = `
        SELECT * FROM categories
        WHERE category_type = $1
        AND is_active = true
        ORDER BY name
    `;
    const { rows } = await pool.query(query, [type]);
    return rows;
};

//find category by id
export const findById = async (id) => {
    const query = `SELECT * FROM categories WHERE category_id = $1`;
    const value = [id];
    const { rows } = await pool.query(query, value);
    return rows[0];
};

//find category by name
export const findByName = async (name) => {
    const query = `SELECT * FROM categories WHERE name = $1`;
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//update category
export const updateCategory = async (id, categoryData) => {
    const { name, slug } = categoryData;
    const query = `UPDATE categories SET name = $1 ,slug =$2, updated_at = CURRENT_TIMESTAMP WHERE category_id = $3 RETURNING *`;
    const values = [
        name,
        slug,
        id
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//delete category
export const deleteCategory = async (id) => {
    const query = `DELETE FROM categories WHERE category_id = $1 RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

//soft delete category
export const softDelete = async (id) => {
    const query = `UPDATE categories
        SET is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = $1
        RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//restore category
export const restoreCategory = async (id) => {
    const query = `UPDATE categories
        SET is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE category_id = $1
        RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};