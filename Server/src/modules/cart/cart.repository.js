import pool from '../../config/database.js';

export const addToCart = async (sessionId, client = pool) => {
    const query = `INSERT INTO carts (session_id) VALUES ($1) RETURNING *`;
    const values = [sessionId];
    const { rows } = await client.query(query, values);
    return rows[0];
}

export const findCartBySessionId = async (sessionId, client = pool) => {
    const query = `SELECT * FROM carts WHERE session_id = $1`;
    const values = [sessionId];
    const { rows } = await client.query(query, values);
    return rows[0];
}

export const addItemToCart = async (cartId, productId, quantity, client = pool) => {
    const query = `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *
    ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity RETURNING *`;
    const values = [cartId, productId, quantity];
    const { rows } = await client.query(query, values);
    return rows[0];
}

export const getCartItems = async (cartId, client = pool) => {
    const query = `
        SELECT 
            ci.cart_item_id,
            ci.quantity,
            p.product_id,
            p.name,
            p.selling_price
        FROM cart_items ci
        JOIN products p ON p.product_id = ci.product_id
        WHERE ci.cart_id = $1
    `;
    const { rows } = await client.query(query, [cartId]);
    return rows;
};

export const updateCartItem = async (cartItemId, quantity, client = pool) => {
    const query = `
        UPDATE cart_items
        SET quantity = $1
        WHERE cart_item_id = $2
        RETURNING *
    `;
    const { rows } = await client.query(query, [quantity, cartItemId]);
    return rows[0];
};

export const removeCartItem = async (cartItemId, client = pool) => {
    const query = `
        DELETE FROM cart_items
        WHERE cart_item_id = $1
    `;
    await client.query(query, [cartItemId]);
};