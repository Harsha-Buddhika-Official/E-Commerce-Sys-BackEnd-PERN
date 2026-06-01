import pool from '../../config/db.js';

export const createOffer = async (offerData) => {
    const {
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
        is_active,
        banner_image_url,
        banner_image_public_id
    } = offerData;

    const query = `
        INSERT INTO offers
            (title, description, discount_type, discount_value, start_date, end_date, is_active, banner_image, banner_image_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    const values = [
        title,
        description || null,
        discount_type,
        discount_value,
        start_date,
        end_date,
        is_active ?? true,
        banner_image_url || null,
        banner_image_public_id || null
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const addOfferProduct = async (offerId, productId) => {
    const query = `
        INSERT INTO offer_products (offer_id, product_id)
        VALUES ($1, $2)
        RETURNING *
    `;
    const { rows } = await pool.query(query, [offerId, productId]);
    return rows[0];
};

export const getAllOffers = async () => {
    const query = `
        SELECT
            o.id,
            o.title,
            o.description,
            o.banner_image,
            o.discount_type,
            o.discount_value,
            o.start_date,
            o.end_date,
            o.is_active,
            MIN(p.product_id)::int AS product_id
        FROM offers o
        LEFT JOIN offer_products op ON op.offer_id = o.id
        LEFT JOIN products p ON p.product_id = op.product_id
        GROUP BY o.id, o.title, o.description, o.banner_image, o.discount_type, o.discount_value, o.start_date, o.end_date, o.is_active
        ORDER BY o.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
};

export const getActiveOffers = async () => {
    const query = `
        SELECT
            o.id,
            o.title,
            o.description,
            o.banner_image,
            o.discount_type,
            o.discount_value,
            o.start_date,
            o.end_date,
            o.is_active,
            MIN(p.product_id)::int AS product_id
        FROM offers o
        LEFT JOIN offer_products op ON op.offer_id = o.id
        LEFT JOIN products p ON p.product_id = op.product_id
        WHERE o.is_active = true AND NOW() BETWEEN o.start_date AND o.end_date
        GROUP BY o.id, o.title, o.description, o.banner_image, o.discount_type, o.discount_value, o.start_date, o.end_date, o.is_active
        ORDER BY o.start_date ASC
    `;

    const { rows } = await pool.query(query);
    return rows;
};

export const getUpcomingOffers = async () => {
    const query = `
        SELECT
            o.id,
            o.title,
            o.description,
            o.banner_image,
            o.discount_type,
            o.discount_value,
            o.start_date,
            o.end_date,
            o.is_active,
            MIN(p.product_id)::int AS product_id
        FROM offers o
        LEFT JOIN offer_products op ON op.offer_id = o.id
        LEFT JOIN products p ON p.product_id = op.product_id
        WHERE o.is_active = true AND o.start_date > NOW()
        GROUP BY o.id, o.title, o.description, o.banner_image, o.discount_type, o.discount_value, o.start_date, o.end_date, o.is_active
        ORDER BY o.start_date ASC
    `;

    const { rows } = await pool.query(query);
    return rows;
};

export const findOfferByIdBasic = async (id) => {
    const query = `
        SELECT * FROM offers
        WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
}

export const findOfferByIdAdmin = async (id) => {
    const query = `SELECT
        o.*,
        COALESCE(
            JSON_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                    'offer_product_id', op.id,
                    'product', JSONB_BUILD_OBJECT(
                        'product_id', p.product_id,
                        'name', p.name,
                        'slug', p.slug,
                        'description', p.description,
                        'selling_price', p.selling_price,
                        'discounted_price', p.discounted_price,
                        'stock_quantity', p.stock_quantity,
                        'is_active', p.is_active,
                            'image',
                            COALESCE(img_agg.primary_image, 'null'::json)
                    )
                )
            ) FILTER (WHERE p.product_id IS NOT NULL),
            '[]'::json
        ) AS products
    FROM offers o
    LEFT JOIN offer_products op
    ON op.offer_id = o.id
    LEFT JOIN products p
    ON p.product_id = op.product_id
    LEFT JOIN LATERAL (
            SELECT
                -- Pick the primary image if available, otherwise the first by sort_order
                COALESCE(
                    (
                        SELECT JSON_BUILD_OBJECT(
                            'image_id', pi2.image_id,
                            'image_url', pi2.image_url,
                            'is_primary', pi2.is_primary,
                            'alt_text', pi2.alt_text,
                            'sort_order', pi2.sort_order
                        )
                        FROM product_images pi2
                        WHERE pi2.product_id = p.product_id
                        ORDER BY (CASE WHEN pi2.is_primary THEN 0 ELSE 1 END), pi2.sort_order
                        LIMIT 1
                    ),
                    'null'::json
                ) AS primary_image
        FROM product_images pi
        WHERE pi.product_id = p.product_id
    ) img_agg ON TRUE
    -- attributes removed: product attributes not required for offer detail
    WHERE
        o.id = $1
    GROUP BY o.id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

//for cart service to check if the product have offer or not
export const findOfferByProductId = async (id) => {
    const query = `
        SELECT *
        FROM offer_products op
        WHERE product_id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

export const findOfferByIdWhenItsActive = async (id) => {
    const query = `
        SELECT *
        FROM offers
        WHERE id = $1
          AND is_active = true
          AND NOW() BETWEEN start_date AND end_date
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

export const updateOffer = async (id, offerData) => {
    const {
        title,
        description,
        discount_type,
        discount_value,
        start_date,
        end_date,
        is_active,
        banner_image,
        banner_image_id
    } = offerData;

    const query = `
        UPDATE offers
        SET title = $1,
            description = $2,
            discount_type = $3,
            discount_value = $4,
            start_date = $5,
            end_date = $6,
            is_active = $7,
            banner_image = $8,
            banner_image_id = $9,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
    `;

    const values = [
        title,
        description || null,
        discount_type,
        discount_value,
        start_date,
        end_date,
        is_active,
        banner_image || null,
        banner_image_id || null,
        id,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const updateOfferStatus = async (id, isActive) => {
    const query = `
        UPDATE offers
        SET is_active = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
    `;

    const { rows } = await pool.query(query, [isActive, id]);
    return rows[0];
};

export const deleteOffer = async (id) => {
    const query = `DELETE FROM offers WHERE id = $1 RETURNING *`;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
};

export const findOfferProduct = async (offerId, productId) => {
    const query = `
        SELECT *
        FROM offer_products
        WHERE offer_id = $1 AND product_id = $2
    `;
    const { rows } = await pool.query(query, [offerId, productId]);
    return rows[0];
};

export const removeOfferProduct = async (offerId, productId) => {
    const query = `
        DELETE FROM offer_products
        WHERE offer_id = $1 AND product_id = $2
        RETURNING *
    `;
    const { rows } = await pool.query(query, [offerId, productId]);
    return rows[0];
};

export const getOfferProducts = async (offerId) => {
    const query = `
        SELECT
            op.id AS offer_product_id,
            op.offer_id,
            op.product_id,
            op.created_at,
            p.name,
            p.selling_price,
            p.stock_quantity,
            p.is_active
        FROM offer_products op
        JOIN products p ON p.product_id = op.product_id
        WHERE op.offer_id = $1
        ORDER BY op.created_at ASC
    `;
    const { rows } = await pool.query(query, [offerId]);
    return rows;
};

export const findProductById = async (productId) => {
    const query = `
        SELECT product_id, name, selling_price, stock_quantity, is_active
        FROM products
        WHERE product_id = $1
    `;
    const { rows } = await pool.query(query, [productId]);
    return rows[0];
};

export const findOfferByProductIdFullOfferData = async (productId) => {
    const query = `
        SELECT o.* 
        FROM offers o
        JOIN offer_products op ON op.offer_id = o.id
        WHERE op.product_id = $1
          AND o.is_active = true
            AND NOW() BETWEEN o.start_date AND o.end_date
    `;
    const { rows } = await pool.query(query, [productId]);
    return rows[0];
}
