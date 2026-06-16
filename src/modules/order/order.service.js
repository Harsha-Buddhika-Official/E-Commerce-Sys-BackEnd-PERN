import * as orderRepository from './order.repository.js';
import * as cartRepository from '../cart/cart.repository.js';
import * as productRepository from '../products/product.repository.js';
import { generateTrackingCode } from '../../utils/generateTrackingCode.js';
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../../services/mail.service.js';
import pool from '../../config/db.js';


// export const createOrder = async (orderData, sessionId) => {
//     // console.log('Received order data in service:', orderData);
//     let items = [];

//     if (orderData.type === 'direct') {

//         const product = await productRepository.findProductById(
//             orderData.product_id
//         );

//         if (!product) {
//             throw new AppError('Product not found', 404);
//         }

//         items.push({
//             product_id: product.product_id,
//             quantity: orderData.quantity,
//             price_at_purchase: product.selling_price
//         });

//     } else if (orderData.type === 'cart') {

//         if (!sessionId) {
//             throw new AppError('Session not found', 401);
//         }

//         const cart = await cartRepository.findCartBySession(sessionId);
//         if (!cart) {
//             throw new AppError('Cart not found', 404);
//         }
//         // console.log('Cart found for session:', cart);

//         const cartItems = await cartRepository.getCartWithItems(cart.cart_id);
//         if (!cartItems.items.length) {
//             throw new AppError('Cart is empty', 400);
//         }
//         // console.log('Cart items:', cartItems.items);

//         items = cartItems.items.map(item => ({
//             product_id: item.product_id,
//             quantity: item.quantity,
//             price_at_purchase: item.price_at_add
//         }));

//     } else {
//         throw new AppError('Invalid order type', 400);
//     }

//     const total_amount = items.reduce(
//         (sum, item) =>
//             sum + item.quantity * item.price_at_purchase,
//         0
//     );

//     return await orderRepository.createOrder({
//         ...orderData,
//         tracking_code: generateTrackingCode(),
//         order_status: 'pending_payment',
//         total_amount,
//         items
//     });
// };


export const createOrder = async (orderData, sessionId) => {
    const client = await pool.connect();

    let order;

    try {
        await client.query('BEGIN');

        let items = [];

        // ---------------------------
        // DIRECT ORDER
        // ---------------------------
        if (orderData.type === 'direct') {

            const product = await productRepository.findProductById(
                orderData.product_id,
                client
            );

            if (!product) throw new AppError('Product not found', 404);

            items.push({
                product_id: product.product_id,
                quantity: orderData.quantity,
                price_at_purchase: product.selling_price
            });

        }

        // ---------------------------
        // CART ORDER
        // ---------------------------
        else if (orderData.type === 'cart') {

            if (!sessionId) throw new AppError('Session not found', 401);

            const cart = await cartRepository.findCartBySession(sessionId, client);
            if (!cart) throw new AppError('Cart not found', 404);

            const cartItems = await cartRepository.getCartWithItems(cart.cart_id, client);
            if (!cartItems.items.length) throw new AppError('Cart is empty', 400);

            items = cartItems.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: item.price_at_add
            }));
        }

        else {
            throw new AppError('Invalid order type', 400);
        }

        const total_amount = items.reduce(
            (sum, item) => sum + item.quantity * item.price_at_purchase,
            0
        );

        // ---------------------------
        // CREATE ORDER
        // ---------------------------
        order = await orderRepository.createOrder({
            ...orderData,
            tracking_code: generateTrackingCode(),
            order_status: 'pending_payment',
            total_amount,
            items
        }, client);

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    // ---------------------------
    // EMAIL AFTER COMMIT
    // ---------------------------

    await sendOrderConfirmationEmail({
        full_name: orderData.full_name,
        email: orderData.customer_email,
        order_id: order.order_id,
        tracking_code: order.tracking_code,
        total_amount: order.total_amount,
    });

    return order;
};

export const UpdatePaymentSlip = async (orderId, file) => {
    try{
        let media_url, media_public_id;
        const uploadResult = await uploadToCloudinary(
            file.buffer,
            `offer-orders-${Date.now()}`,
            'ecommerce/orders'
        );
        media_url = uploadResult.secure_url;
        media_public_id = uploadResult.public_id;
        const result = await orderRepository.importPaymentSlipData({orderId,media_url,media_public_id});
        await orderRepository.changeOrderStatus(orderId, 'paid');
        return result;
    } catch (error) {
        throw new AppError('Failed to upload payment slip', 500);
    }
}

//status bar data for admin dashboard
export const getStatusData = async (client) => {
    const {
        totalRevenueThisMonth,
        totalRevenueLastMonth,
        totalOrdersThisMonth,
        totalOrdersLastMonth,
        activeProducts,
        lowStockProducts,
        pendingOrders,
        shippedOrders
    } = await orderRepository.getDashboardMetrics(client);

    const comparedRevenuePercentage = totalRevenueLastMonth
        ? (((totalRevenueThisMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100).toFixed(2)
        : null;

    const comparedOrdersPercentage = totalOrdersLastMonth
        ? (((totalOrdersThisMonth - totalOrdersLastMonth) / totalOrdersLastMonth) * 100).toFixed(2)
        : null;

    return {
        totalRevenueThisMonth,
        comparedRevenuePercentage,
        totalOrdersThisMonth,
        comparedOrdersPercentage,
        activeProducts,
        lowStockProducts,
        pendingOrders,
        shippedOrders
    };
};

//low stock alert for admin dashboard
export const lowStockAlert = async (client) => {
    const lowStockProducts = await orderRepository.lowStockAlert(client);
    return lowStockProducts;
}

//recent orders for admin dashboard
export const getRecentOrders = async (client) => {
    return await orderRepository.findRecentOrders(client);
}

//order status count for order page
export const getOrderStatusCount = async (client) =>{
    const OrderStatus = await orderRepository.getOrderStatusCount(client);
    return OrderStatus;
}

//orders for order page
export const getAllOrders = async (client) => {
    return await orderRepository.findAllOrders(client);
};

export const getOrderById = async (orderId, client) => {
    return await orderRepository.getOrderById(orderId, client);
};

export const findOrderImageById = async (orderId, client) => {
    return await orderRepository.findOrderImageById(orderId, client);
}

export const getOrdersByTrackingCode = async (trackingCode, email, client) => {
    const emailCheck = await orderRepository.getOrdersByEmail(email, client);
    if (!emailCheck || emailCheck.length === 0) {
        throw new AppError('No orders found for this email', 404);
    }
    if(!trackingCode) {
        throw new AppError('Tracking code is required', 400);
    }  
    const TrackingCodeCheck = await orderRepository.getOrderByTrackingCode(trackingCode, client);
    if (!TrackingCodeCheck) {
        throw new AppError('No order found for this tracking code', 404);
    }
    if (TrackingCodeCheck.customer_email !== email) {
        throw new AppError('Tracking code does not match the provided email', 400);
    }
    return TrackingCodeCheck;
};

export const updateOrderStatus = async (orderId, newStatus, client) => {
    const order = await orderRepository.getOrderById(orderId, client);
    console.log('Current order:', order);
    await sendOrderStatusUpdateEmail({
        full_name: order.full_name,
        email: order.customer_email,
        order_id: order.order_id,
        tracking_code: order.tracking_code,
        total_amount: order.total_amount,
    });
    return await orderRepository.updateOrderStatus(orderId, newStatus, client);
};

export const deleteOrder = async (orderId, client) => {
    const ImageData = await orderRepository.findOrderImageById(orderId, client);
    await deleteFromCloudinary(ImageData.media_public_id);
    const deletedOrder = await orderRepository.deleteOrder(orderId, client);
    return deletedOrder;
};





