import db from '../../config/db.js';

export const createAttribute = async (attribute) => {
    const { name, categoryId } = attribute;

    const query = `
        INSERT INTO attributes (name, category_id)
        VALUES ($1, $2)
        RETURNING *
    `;
    const values = [name, categoryId];
    
    const { rows } = await db.query(query, values);
    return rows[0];
}

export const getAttributesByCategoryId = async (categoryId) => {
    const query = `
        SELECT *
        FROM attributes
        WHERE category_id = $1
        ORDER BY attribute_id ASC
    `;
    const { rows } = await db.query(query, [categoryId]);
    return rows;
}

export const getAttributeByName = async (name) => {
    const query = `
        SELECT * FROM attributes 
        WHERE name = $1 
        LIMIT 1`;
    const { rows } = await db.query(query, [name]);
    return rows[0];
}

export const getAttributeById = async (id) => {
    const query = `SELECT * FROM attributes WHERE id = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
}

export const deleteAttribute = async (id) => {
    const query = `DELETE FROM attributes WHERE id = $1 RETURNING *`;
    const { rows } = await db.query(query, [id]);
    return rows[0];
}

export const updateAttribute = async (id, attribute) => {
    const query = `
        UPDATE attributes
        SET name = $1, category_id = $2
        WHERE id = $3 
        RETURNING *
    `;
    const { name, categoryId } = attribute;
    const values = [name, categoryId, id];
    const { rows } = await db.query(query, values);
    return rows[0];
}