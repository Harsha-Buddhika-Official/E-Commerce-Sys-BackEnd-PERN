import pool from '../../config/db.js';

export const findCartBySession = async (sessionId) => {
    const { rows } = await pool.query(
        `SELECT *
         FROM   carts
         WHERE  session_id = $1
             AND  expires_at > NOW()`,
        [sessionId]
    );
    return rows[0] ?? null;
};

export const createCart = async (sessionId) => {
    const { rows } = await pool.query(
        `INSERT INTO carts (session_id)
         VALUES ($1)
         RETURNING *`,
        [sessionId]
    );
    return rows[0];
};

export const findCartItem = async (cartId, productId) => {
    const { rows } = await pool.query(
        `SELECT *
         FROM   cart_items
         WHERE  cart_id    = $1
             AND  product_id = $2`,
        [cartId, productId]
    );
    return rows[0] ?? null;
};

export const findCartItemById = async (itemId) => {
    const { rows } = await pool.query(
        `SELECT *
         FROM   cart_items
         WHERE  cart_item_id = $1`,
        [itemId]
    );
    return rows[0] ?? null;
};

export const createCartItem = async (params) => {
    const { cart_id, product_id, quantity, price_at_add } = params;
    await pool.query(
        `INSERT INTO cart_items
             (cart_id, product_id, quantity, price_at_add)
         VALUES ($1, $2, $3, $4)`,
        [cart_id, product_id, quantity, price_at_add]
    );
};

export const updateItemQuantity = async (itemId, quantity) => {
    await pool.query(
        `UPDATE cart_items
         SET    quantity   = $1,
                updated_at = NOW()
         WHERE  cart_item_id = $2`,
        [quantity, itemId]
    );
};

export const deleteCartItem = async (itemId) => {
    await pool.query(
        `DELETE FROM cart_items
         WHERE  cart_item_id = $1`,
        [itemId]
    );
};

export const deleteAllCartItems = async (cartId) => {
    await pool.query(
        `DELETE FROM cart_items
         WHERE  cart_id = $1`,
        [cartId]
    );
};

export const findProduct = async (productId) => {
    const { rows } = await pool.query(
        `SELECT product_id,
                name,
                selling_price,
                stock_quantity,
                is_active
         FROM   products
         WHERE  product_id = $1`,
        [productId]
    );
    return rows[0] ?? null;
};

export const getCartWithItems = async (cartId) => {
    const { rows } = await pool.query(
        `SELECT
             ci.cart_item_id,
             ci.product_id,
             p.name                                    AS product_name,
             p.slug                                    AS product_slug,
             pi.image_url                              AS image_url,
             ci.quantity,
             ci.price_at_add::TEXT                     AS price_at_add,
             p.selling_price::TEXT                     AS current_price,
             p.stock_quantity,
             p.is_active,
             (ci.quantity * ci.price_at_add)::DECIMAL(10,2)::TEXT  AS line_total,
             ci.added_at,
             ci.updated_at
         FROM   cart_items ci
         JOIN   products   p   ON p.product_id  = ci.product_id
         LEFT   JOIN product_images pi
                            ON pi.product_id  = p.product_id
                           AND pi.is_primary  = TRUE
         WHERE  ci.cart_id = $1
         ORDER  BY ci.added_at ASC`,
        [cartId]
    );

    const total = rows
        .reduce((sum, row) => sum + parseFloat(row.line_total ?? '0'), 0)
        .toFixed(2);

    const item_count = rows
        .reduce((sum, row) => sum + row.quantity, 0);

    return { items: rows, total, item_count };
};