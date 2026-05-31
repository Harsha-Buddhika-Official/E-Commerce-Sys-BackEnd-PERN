import pool from "../../config/db.js";

export const createBrand = async (brandData) => {
    const { name, slug, logo_url, logo_public_id } = brandData;
    const query = `
        INSERT INTO brands (name, slug, logo_url, logo_public_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const values = [name, slug, logo_url || null, logo_public_id || null];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getAllBrands = async () => {
    const query = `SELECT brand_id,name,slug,logo_url,is_active,updated_at,created_at FROM brands`;
    const { rows } = await pool.query(query);
    return rows;
};

export const getAllBrandNames = async () => {
    const query = `SELECT brand_id, name FROM brands WHERE is_active = true`;
    const { rows } = await pool.query(query);
    return rows;
};

export const findBrandByName = async (name) => {
    const query = `SELECT * FROM brands WHERE name = $1`;
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const findBrandById = async (id) => {
    const query = `SELECT * FROM brands WHERE brand_id = $1`;
    const value = [id];
    const { rows } = await pool.query(query, value);
    return rows[0];
};

export const updateBrand = async (id, brandData) => {
    const { name, slug, logo_url, logo_public_id } = brandData;
    const query = `
        UPDATE brands
        SET name = $1, slug = $2, logo_url = $3, logo_public_id = $4, updated_at = CURRENT_TIMESTAMP
        WHERE brand_id = $5
        RETURNING *
    `;
    const values = [name, slug, logo_url || null, logo_public_id || null, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const deleteBrand = async (id) => {
    const query = `DELETE FROM brands WHERE brand_id =$1 RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const softDelete = async (id) => {
    const query = `
        UPDATE brands
        SET is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE brand_id = $1
        RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const restoreBrand = async (id) => {
    const query = `
        UPDATE brands
        SET is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE brand_id = $1
        RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};
