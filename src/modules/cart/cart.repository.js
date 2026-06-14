import pool from '../../config/db.js';

// using
export const findCartBySession = async (sessionId) => {
    const query = `
        SELECT *
        FROM carts
        WHERE session_id = $1
          AND expires_at > NOW()
    `;

    const { rows } = await pool.query(query, [sessionId]);
    return rows[0] ?? null;
};

// using
export const createCart = async (sessionId) => {
    const query = `
        INSERT INTO carts (session_id)
        VALUES ($1)
        RETURNING *
    `;

    const { rows } = await pool.query(query, [sessionId]);
    return rows[0];
};

// using
export const findCartItem = async (cartId, productId) => {
    const query = `
        SELECT *
        FROM cart_items
        WHERE cart_id = $1
          AND product_id = $2
    `;

    const { rows } = await pool.query(query, [cartId, productId]);
    return rows[0] ?? null;
};

export const findCartItemById = async (itemId) => {
    const query = `
        SELECT *
        FROM cart_items
        WHERE cart_item_id = $1
    `;

    const { rows } = await pool.query(query, [itemId]);
    return rows[0] ?? null;
};

// using
export const createCartItem = async ({ cart_id, product_id, quantity, price_at_add }) => {
    const query = `
        INSERT INTO cart_items (
            cart_id,
            product_id,
            quantity,
            price_at_add
        )
        VALUES ($1, $2, $3, $4)
    `;

    await pool.query(query, [cart_id, product_id, quantity, price_at_add]);
};

// using
export const updateItemQuantity = async (itemId, quantity) => {
    const query = `
        UPDATE cart_items
        SET quantity = $1,
            updated_at = NOW()
        WHERE cart_item_id = $2
    `;

    await pool.query(query, [quantity, itemId]);
};

// using
export const deleteCartItem = async (itemId) => {
    const query = `
        DELETE FROM cart_items
        WHERE cart_item_id = $1
    `;

    await pool.query(query, [itemId]);
};

// using
export const deleteAllCartItems = async (cartId) => {
    const query = `
        DELETE FROM cart_items
        WHERE cart_id = $1
    `;

    await pool.query(query, [cartId]);
};

// using
export const findProduct = async (productId) => {
    const query = `
        SELECT product_id,
               name,
               discounted_price,
               stock_quantity,
               is_active
        FROM products
        WHERE product_id = $1
    `;

    const { rows } = await pool.query(query, [productId]);
    return rows[0] ?? null;
};

// using
export const getCartWithItems = async (cartId) => {
    const query = `
        SELECT
            ci.cart_item_id,
            ci.product_id,
            p.name AS product_name,
            p.slug AS product_slug,
            pi.image_url AS image_url,
            ci.quantity,
            ci.price_at_add::TEXT AS price_at_add,
            p.discounted_price::TEXT AS current_price,
            p.stock_quantity,
            p.is_active,
            (ci.quantity * ci.price_at_add)::DECIMAL(10,2)::TEXT AS line_total,
            ci.added_at,
            ci.updated_at
        FROM cart_items ci
        JOIN products p ON p.product_id = ci.product_id
        LEFT JOIN product_images pi
            ON pi.product_id = p.product_id
           AND pi.is_primary = TRUE
        WHERE ci.cart_id = $1
        ORDER BY ci.added_at ASC
    `;

    const { rows } = await pool.query(query, [cartId]);

    const total = rows
        .reduce((sum, row) => sum + parseFloat(row.line_total ?? '0'), 0)
        .toFixed(2);

    const item_count = rows
        .reduce((sum, row) => sum + row.quantity, 0);

    return {
        items: rows,
        total,
        item_count
    };
};