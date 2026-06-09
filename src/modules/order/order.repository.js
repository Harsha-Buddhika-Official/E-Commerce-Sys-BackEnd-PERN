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

    const orderQuery = `
        INSERT INTO orders (tracking_code, customer_email, phone_number, total_amount, order_status, shipping_address, city, postal_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
    `;

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
        const itemQuery = `
            INSERT INTO order_items
            (order_id, product_id, quantity, price_at_purchase)
            VALUES ($1, $2, $3, $4)
        `;

        const itemValues = [
            order.order_id,
            product_id,
            quantity,
            price_at_purchase
        ];

        await client.query(itemQuery, itemValues);
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

export const getDashboardMetrics = async (client = pool) => {
    const query = `
        SELECT
            (
                SELECT COALESCE(SUM(total_amount), 0)
                FROM orders
                WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
            ) AS "totalRevenueThisMonth",

            (
                SELECT COALESCE(SUM(total_amount), 0)
                FROM orders
                WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            ) AS "totalRevenueLastMonth",

            (
                SELECT COUNT(*)
                FROM orders
                WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
            ) AS "totalOrdersThisMonth",

            (
                SELECT COUNT(*)
                FROM orders
                WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            ) AS "totalOrdersLastMonth",

            (
                SELECT COUNT(*)
                FROM products
                WHERE is_active = true
            ) AS "activeProducts",

            (
                SELECT COUNT(*)
                FROM products
                WHERE stock_quantity = 0
                  AND is_active = true
            ) AS "lowStockProducts",

            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'pending'
            ) AS "pendingOrders",

            (
                SELECT COUNT(*)
                FROM orders
                WHERE order_status = 'shipped'
            ) AS "shippedOrders"
    `;

    const { rows } = await client.query(query);
    return rows[0];
};

export const lowStockAlert = async (threshold = 5, client = pool) => {
    const query = `
        SELECT product_id, name, stock_quantity
        FROM products
        WHERE stock_quantity <= $1
          AND is_active = true
        ORDER BY stock_quantity ASC;
    `;
    try {
        const result = await client.query(query, [threshold]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        throw error;
    }
};

export const findRecentOrders = async (client = pool) => {
    const query = `SELECT
        o.order_id,
        o.total_amount,
        o.order_status,

        p.name AS product_name,
        oi.quantity
    FROM orders o
    
    JOIN order_items oi
        ON o.order_id = oi.order_id
    
    JOIN products p
        ON oi.product_id = p.product_id

    ORDER BY o.created_at DESC
    LIMIT 10;`;
    try {
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        throw error;
    }
}

export const getOrderStatusCount = async (client = pool) => {
    const query = `
        SELECT
            COUNT(*) FILTER (WHERE order_status = 'pending') AS pending_orders,
            COUNT(*) FILTER (WHERE order_status = 'paid') AS paid_orders,
            COUNT(*) FILTER (WHERE order_status = 'processing') AS processing_orders,
            COUNT(*) FILTER (WHERE order_status = 'shipped') AS shipped_orders,
            COUNT(*) FILTER (WHERE order_status = 'cancelled') AS cancelled_orders,
            COUNT(*) FILTER (WHERE order_status = 'delivered') AS completed_orders
        FROM orders;
    `
    try {
        const result = await client.query(query);
        return {
            pendingOrders: Number(result.rows[0].pending_orders),
            paidOrders: Number(result.rows[0].paid_orders),
            processingOrders: Number(result.rows[0].processing_orders),
            shippedOrders: Number(result.rows[0].shipped_orders),
            cancelledOrders: Number(result.rows[0].cancelled_orders),
            completedOrders: Number(result.rows[0].completed_orders)
        };
    } catch (error) {
        console.error('Error fetching order status count:', error);
        throw error;
    }
}

export const findAllOrders = async (client = pool) => {
    const query = `SELECT
        o.order_id,
        o.customer_email,
        o.updated_at as date,
        o.total_amount,
        o.order_status,
        
        p.name AS product_name,
        
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase

    FROM orders o

    JOIN order_items oi
        ON o.order_id = oi.order_id

    JOIN products p
        ON oi.product_id = p.product_id

    ORDER BY o.created_at DESC;`;
    try {
        const result = await client.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching all orders:', error);
        throw error;
    }
};

export const updateOrder = async (orderId, orderData, client = pool) => {
    const {
        tracking_code,
        customer_email,
        phone_number,
        total_amount,
        order_status,
        shipping_address,
        city,
        postal_code,
        items = [],
        delete_item_ids = []
    } = orderData;

    const query = `UPDATE orders SET
    tracking_code = $1,
    customer_email = $2,
    phone_number = $3,
    total_amount = $4,
    order_status = $5,
    shipping_address = $6,
    city = $7,
    postal_code = $8,
    updated_at = NOW()
    WHERE order_id = $9 RETURNING *`;

    const values = [
        tracking_code,
        customer_email,
        phone_number,
        total_amount,
        order_status,
        shipping_address,
        city,
        postal_code,
        orderId
    ];

    const shouldManageItems = Array.isArray(items) || Array.isArray(delete_item_ids);
    const useManagedClient = client === pool;
    const db = useManagedClient ? await pool.connect() : client;

    try {
        if (useManagedClient) {
            await db.query('BEGIN');
        }

        const result = await db.query(query, values);
        const updatedOrder = result.rows[0];

        if (!updatedOrder) {
            throw new Error('Order not found');
        }

        if (shouldManageItems) {
            const itemIdsToDelete = new Set(
                (Array.isArray(delete_item_ids) ? delete_item_ids : []).map(Number).filter(Boolean)
            );

            for (const item of Array.isArray(items) ? items : []) {
                // If action=delete or delete=true is provided in items array, remove it.
                if ((item?.action === 'delete' || item?.delete === true) && item?.order_item_id) {
                    itemIdsToDelete.add(Number(item.order_item_id));
                    continue;
                }

                if (item?.order_item_id) {
                    await db.query(
                        `UPDATE order_items
                         SET product_id = $1,
                             quantity = $2,
                             price_at_purchase = $3
                         WHERE order_item_id = $4 AND order_id = $5`,
                        [
                            item.product_id,
                            item.quantity,
                            item.price_at_purchase,
                            item.order_item_id,
                            orderId
                        ]
                    );
                    continue;
                }

                await db.query(
                    `INSERT INTO order_items
                     (order_id, product_id, quantity, price_at_purchase)
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, item.product_id, item.quantity, item.price_at_purchase]
                );
            }

            if (itemIdsToDelete.size > 0) {
                const ids = Array.from(itemIdsToDelete);
                await db.query(
                    `DELETE FROM order_items
                     WHERE order_id = $1
                     AND order_item_id = ANY($2::int[])`,
                    [orderId, ids]
                );
            }
        }

        if (useManagedClient) {
            await db.query('COMMIT');
        }

        return updatedOrder;
    } catch (error) {
        if (useManagedClient) {
            await db.query('ROLLBACK');
        }
        console.error('Error updating order:', error);
        throw error;
    } finally {
        if (useManagedClient) {
            db.release();
        }
    }
};

export const getOrderById = async (orderId, client = pool) => {
    const query = `SELECT 
        o.order_id,
        o.tracking_code,
        o.full_name,
        o.customer_email,
        o.phone_number,
        o.total_amount,
        o.order_status,
        o.shipping_address,
        o.city,
        o.postal_code,
        o.created_at,
        o.updated_at,

        COALESCE(
            json_agg(
                json_build_object(
                    'order_item_id', oi.order_item_id,
                    'product_id', oi.product_id,
                    'quantity', oi.quantity,
                    'price_at_purchase', oi.price_at_purchase,

                    'product_name', p.name,
                    'product_slug', p.slug,
                    'warranty_months', p.warranty_months,

                    'brand_name', b.name,

                    'category_name', c.name
                )
            ) FILTER (WHERE oi.order_item_id IS NOT NULL),
            '[]'
        ) AS order_items

    FROM orders o

    LEFT JOIN order_items oi
        ON o.order_id = oi.order_id

    LEFT JOIN products p
        ON oi.product_id = p.product_id

    LEFT JOIN brands b
        ON p.brand_id = b.brand_id

    LEFT JOIN categories c
        ON p.category_id = c.category_id

    WHERE o.order_id = $1

    GROUP BY o.order_id;`;
    try {
        const result = await client.query(query, [orderId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        throw error;
    }
};

export const getOrdersByEmail = async (email, client = pool) => {
    const query = `SELECT o.order_id, o.tracking_code, o.customer_email, o.phone_number, o.total_amount, o.order_status, o.shipping_address, o.city, o.postal_code, oi.product_id, oi.quantity, oi.price_at_purchase FROM orders o JOIN order_items oi ON o.order_id = oi.order_id WHERE o.customer_email = $1`;
    const values = [email];
    try {
        const result = await client.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error fetching orders by email:', error);
        throw error;
    }
};

export const getOrderByTrackingCode = async (trackingCode, client = pool) => {
    const query = `SELECT o.order_id, o.tracking_code, o.customer_email, o.phone_number, o.total_amount, o.order_status, o.shipping_address, o.city, o.postal_code, oi.product_id, oi.quantity, oi.price_at_purchase FROM orders o JOIN order_items oi ON o.order_id = oi.order_id WHERE o.tracking_code = $1`;
    const values = [trackingCode];
    try {
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching order by tracking code:', error);
        throw error;
    }
};





export const updateOrderStatus = async (orderId, newStatus, client = pool) => {
    const query = `UPDATE orders
    SET 
        order_status = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = $2
    RETURNING *;`;
    const values = [newStatus, orderId];
    try {
        const result = await
            client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
};

export const deleteOrder = async (orderId, client = pool) => {
    const query = `DELETE FROM orders WHERE order_id = $1 RETURNING *`;
    const values = [orderId];
    try {
        const result = await client.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting order:', error);
        throw error;
    }
};





