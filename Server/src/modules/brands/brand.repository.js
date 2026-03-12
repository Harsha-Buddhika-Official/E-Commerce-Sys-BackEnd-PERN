import pool from "../../config/db.js";

//create brand
export const createBrand = async (brandData) => {
    const { name, slug, logo_url } = brandData;
    const query = `
    INSERT INTO brands (name, slug, logo_url)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

    const values = [
        name,
        slug,
        logo_url || null,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

//get all brands
export const getAllBrands = async () => {
    const query = 'SELECT * FROM brands';
    const { rows } = await pool.query(query);
    return rows;
};

//find brand by name
export const findBrandByName = async (name) => {
    const query = 'SELECT * FROM brands WHERE name = $1';
    const values = [name];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//find brand by id
export const findBrandById = async (id) => {
    const query = 'SELECT * FROM brands WHERE brand_id = $1';
    const value = [id];
    const { rows } = await pool.query(query, value);
    return rows[0];
};

//update brand
export const updateBrand = async (id, brandData) => {
    const { name, slug, logo_url } = brandData;
    const query = 'UPDATE brands SET name = $1 ,slug =$2, logo_url = $3 WHERE brand_id = $4 RETURNING *';
    const values = [
        name,
        slug,
        logo_url,
        id
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//delete brand
export const deleteBrand = async (id) => {
    const query = 'DELETE FROM brands WHERE brand_id =$1';
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//soft delete brand
export const softDelete = async (id) => {
    const query = `UPDATE brands
     SET is_active = false,
         updated_at = CURRENT_TIMESTAMP
     WHERE brand_id = $1
     RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

//restore brand
export const restoreBrand = async (id) => {
    const query = `UPDATE brands
        SET is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE brand_id = $1
        RETURNING *`;
    const values = [id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}