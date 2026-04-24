import db from '../../config/db.js';

export const createAttribute = async (attribute) => {
    const {name, categoryId} = attribute;
    const [result] = await db.query(
        'INSERT INTO attributes (name, category_id) VALUES ($1, $2)',
        [name, categoryId]
    );
    return result.insertId;
}

export const getAttributesByCategoryId = async (categoryId) => {
    const [rows] = await db.query(
        'SELECT * FROM attributes WHERE category_id = $1',
        [categoryId]
    );
    return rows;
}

export const getAttributeByName = async (name) => {
    const [rows] = await db.query(
        'SELECT * FROM attributes WHERE name = $1',
        [name]
    );
    return rows[0];
}

export const getAttributeById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM attributes WHERE id = $1',
        [id]
    );
    return rows[0];
}

export const deleteAttribute = async (id) => {
    await db.query(
        'DELETE FROM attributes WHERE id = $1',
        [id]
    );
}

export const updateAttribute = async (id, attribute) => {
    const {name, categoryId} = attribute;
    await db.query(
        'UPDATE attributes SET name = $1, category_id = $2 WHERE id = $3',
        [name, categoryId, id]
    );
}