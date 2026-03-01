import pool from "../../config/db.js";

export const createBrand = async (brandData) => {
    const query = `
    INSERT INTO brands (name, slug, logo_url, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

    const values = [
        brandData.name,
        brandData.slug,
        brandData.logo_url || null,
        brandData.is_active ?? true
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const findByName = async (name) => {
    const query = 'SELECT * FROM brands WHERE name = $1';
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const findById = async (id) => {
    const query = 'SELECT * FROM brands WHERE id = $1';
    const value = [id];
    const { rows } = await pool.query(query, value);
    return rows[0];
}

export const updateBrand = async (id, brandData) => {
    const { name, slug, logo_url, is_active } = brandData;
    const query = 'UPDATE brands SET name = $1 ,slug =$2, logo_url = $3, is_active = $4 WHERE id = $5 RETURNING *';
    const values = [
        name,
        slug,
        logo_url,
        is_active,
        id
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

export const deleteBrand = async (id) => {
    const query = 'DELETE FROM brands WHERE id =$1';
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

export const softDelete = async (id) => {
    const query = `UPDATE brands
     SET is_active = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};