import pool from '../../config/db.js';

export const createDirectOrder = async (orderData, client = pool) => {
    const {
        tracking_code,
        customer_email,
        phone_number,
        total_amount,
        order_status,
        shipping_address,
        city,
        postal_code,
        product_id,
        quantity,
        price_at_purchase
    } = orderData;

    const orderQuery = `INSERT INTO orders
    (tracking_code, customer_email, phone_number, total_amount, order_status, shipping_address, city, postal_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

    const orderValues = [
        tracking_code,
        customer_email,
        phone_number,
        total_amount,
        order_status,
        shipping_address,
        city,
        postal_code
    ];

    try {
        // Create the order
        const orderResult = await client.query(orderQuery, orderValues);
        const order = orderResult.rows[0];

        // Insert the single direct-purchase item from the product page
        const itemQuery = `INSERT INTO order_items
        (order_id, product_id, quantity, price_at_purchase)
        VALUES ($1, $2, $3, $4)`;

        await client.query(itemQuery, [
            order.order_id,
            product_id,
            quantity,
            price_at_purchase
        ]);

        return order;
    } catch (error) {
        console.error('Error creating direct order:', error);
        throw error;
    }
};

export const createCartOrder = async (orderData, client = pool) => {
    const {
        tracking_code,
        customer_email,
        phone_number,
        total_amount,
        order_status,
        shipping_address,
        city,
        postal_code,
        items // Array of items: [{product_id, quantity, price_at_purchase}, ...]
    } = orderData;

    const orderQuery = `INSERT INTO orders
    (tracking_code, customer_email, phone_number, total_amount, order_status, shipping_address, city, postal_code)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;

    const orderValues = [
        tracking_code,
        customer_email,
        phone_number,
        total_amount,
        order_status,
        shipping_address,
        city,
        postal_code
    ];

    try {
        // Create the order
        const orderResult = await client.query(orderQuery, orderValues);
        const order = orderResult.rows[0];

        // Insert order items from cart
        if (items && items.length > 0) {
            const itemQuery = `INSERT INTO order_items
            (order_id, product_id, quantity, price_at_purchase)
            VALUES ($1, $2, $3, $4)`;

            for (const item of items) {
                await client.query(itemQuery, [
                    order.order_id,
                    item.product_id,
                    item.quantity,
                    item.price_at_purchase
                ]);
            }
        }

        return order;
    } catch (error) {
        console.error('Error creating cart order:', error);
        throw error;
    }
};