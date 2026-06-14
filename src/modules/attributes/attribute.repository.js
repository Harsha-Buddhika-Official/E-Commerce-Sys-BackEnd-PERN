import pool from '../../config/db.js';

//using
export const createAttribute = async ({ name, category_id }) => {

    const query = `
        INSERT INTO attributes (name, category_id)
        VALUES ($1, $2)
        RETURNING *
    `;
    
    const { rows } = await pool.query(query, [name, category_id]);
    return rows[0];
}

export const createProductAttribute = async (productId, attributeData) => {
    const query = `
        INSERT INTO product_attributes (
            product_id,
            attribute_id,
            attribute_value_id,
            value
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const values = [
        productId,
        attributeData.attribute_id,
        attributeData.attribute_value_id,
        attributeData.value,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getAttributeValueById = async (attributeValueId) => {
    const query = `
        SELECT
            av.attribute_value_id,
            av.attribute_id,
            av.value
        FROM attribute_values av
        WHERE av.attribute_value_id = $1
        LIMIT 1
    `;
    const { rows } = await pool.query(query, [attributeValueId]);
    return rows[0];
};

//using
export const insertAttributeValue = async ({ attribute_id, value }) => {
    const query = `
        INSERT INTO attribute_values (attribute_id, value)
        VALUES ($1, $2)
        RETURNING *
    `;
    const { rows } = await pool.query(query, [attribute_id, value]);
    return rows[0];
}

//using
export const getAttributeCatalog = async () => {
    const categoriesQuery = `
        SELECT category_id, name
        FROM categories
        ORDER BY category_id ASC
    `;

    const attributesQuery = `
        SELECT
            a.attribute_id,
            a.name,
            a.category_id,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'attribute_value_id', av.attribute_value_id,
                        'value', av.value
                    )
                    ORDER BY av.attribute_value_id
                ) FILTER (WHERE av.attribute_value_id IS NOT NULL),
                '[]'::json
            ) AS values
        FROM attributes a
        LEFT JOIN attribute_values av ON av.attribute_id = a.attribute_id
        GROUP BY a.attribute_id, a.name, a.category_id
        ORDER BY a.category_id ASC, a.attribute_id ASC
    `;

    const [categoriesResult, attributesResult] = await Promise.all([
        pool.query(categoriesQuery),
        pool.query(attributesQuery),
    ]);

    return {
        categories: categoriesResult.rows,
        attributes: attributesResult.rows,
    };
}

export const getAttributeById = async (id) => {
    const query = `SELECT * FROM attributes WHERE attribute_id = $1`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export const getAttributesByCategoryId = async (categoryId) => {
    const query = `
        SELECT *
        FROM attributes
        WHERE category_id = $1
        ORDER BY attribute_id ASC
    `;
    const { rows } = await pool.query(query, [categoryId]);
    return rows;
}

//using
export const getAttributesByCategory = async (categoryId) => {
    const query = `
        SELECT
            a.attribute_id,
            a.name,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'attribute_value_id', av.attribute_value_id,
                        'value', av.value
                    )
                    ORDER BY av.attribute_value_id
                ) FILTER (WHERE av.attribute_value_id IS NOT NULL),
                '[]'::json
            ) AS values
        FROM attributes a
        LEFT JOIN attribute_values av
            ON av.attribute_id = a.attribute_id
        WHERE a.category_id = $1
        GROUP BY a.attribute_id, a.name
        ORDER BY a.attribute_id;
    `;

    const { rows } = await pool.query(query, [categoryId]);
    return rows;
};

export const updateAttributeById = async (id, {name, category_id}) => {
    const query = `
        UPDATE attributes
        SET name = $1, category_id = $2
        WHERE attribute_id = $3 
        RETURNING *
    `;
    const { rows } = await pool.query(query, [name, category_id, id]);
    return rows[0];
}

//using
export const deleteAttributeById = async (id) => {
    const query = `DELETE FROM attributes WHERE attribute_id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

//using
export const deleteAttributeValueById = async (attributeId, valueId) => {
    const query = `
        DELETE FROM attribute_values
        WHERE attribute_id = $1 AND attribute_value_id = $2
        RETURNING *
    `;
    const values = [attributeId, valueId];
    const { rows } = await pool.query(query, values);
    return rows[0];
}
