import * as orderRepository from './order.repository.js';
import * as cartRepository from '../cart/cart.repository.js';
import * as productRepository from '../products/product.repository.js';
import { generateTrackingCode } from '../../utils/generateTrackingCode.js';
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary, getDownloadUrl } from "../../utils/cloudinaryUpload.js";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../../services/mail.service.js';
import pool from '../../config/db.js';

//using
export const createOrder = async (orderData, sessionId) => {
    const client = await pool.connect();

    let order;
    let items = [];

    try {
        await client.query('BEGIN');

        // ── DIRECT ORDER ──────────────────────────────────────────
        if (orderData.type === 'direct') {
            const product = await productRepository.findProductById(orderData.product_id, client);
            if (!product) throw new AppError('Product not found', 404);

            if (product.stock_quantity < orderData.quantity) {
                throw new AppError(
                    `Insufficient stock. Available: ${product.stock_quantity}, requested: ${orderData.quantity}`,
                    409
                );
            }

            items.push({
                product_id:        product.product_id,
                product_name:      product.name,
                brand_name:        product.brand_name  ?? null,
                category_name:     product.category_name ?? null,
                image_url:         product.images?.[0]?.image_url ?? null,
                quantity:          orderData.quantity,
                price_at_purchase: product.selling_price,
            });
        }

        // ── CART ORDER ────────────────────────────────────────────
        else if (orderData.type === 'cart') {
            if (!sessionId) throw new AppError('Session not found', 401);

            const cart = await cartRepository.findCartBySession(sessionId, client);
            if (!cart) throw new AppError('Cart not found', 404);

            const cartData = await cartRepository.getCartWithItems(cart.cart_id, client);
            if (!cartData.items.length) throw new AppError('Cart is empty', 400);
            
            console.log('Cart data retrieved:', cartData); // Debug log to check cart data

            for (const item of cartData.items) {
                const product = await productRepository.findProductById(item.product_id, client);

                if (!product || product.stock_quantity < item.quantity) {
                    throw new AppError(
                        `Insufficient stock for "${item.product_name ?? item.product_id}". Available: ${product?.stock_quantity ?? 0}, requested: ${item.quantity}`,
                        409
                    );
                }

                items.push({
                    product_id:        item.product_id,
                    product_name:      product.name,
                    brand_name:        product.brand_name  ?? null,
                    category_name:     product.category_name ?? null,
                    image_url:         product.images?.[0]?.image_url ?? null,
                    quantity:          item.quantity,
                    price_at_purchase: item.price_at_add,
                });
            }
        }

        else {
            throw new AppError('Invalid order type', 400);
        }

        const total_amount = items.reduce(
            (sum, item) => sum + item.quantity * item.price_at_purchase,
            0
        );

        order = await orderRepository.createOrder({
            ...orderData,
            tracking_code: generateTrackingCode(),
            order_status:  'pending_payment',
            total_amount,
            items,
        }, client);

        await client.query('COMMIT');

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

    // ── EMAIL (outside transaction) ───────────────────────────────
    try {
        await sendOrderConfirmationEmail({
            full_name:        orderData.full_name,
            email:            orderData.customer_email,
            order_id:         order.order_id,
            tracking_code:    order.tracking_code,
            total_amount:     order.total_amount,
            shipping_address: orderData.shipping_address,
            city:             orderData.city,
            postal_code:      orderData.postal_code,
            phone_number:     orderData.phone_number,
            items,
        });
    } catch (emailError) {
        console.error('Order confirmation email failed (non-fatal):', emailError);
    }

    return order;
};

//using
export const updatePaymentSlip = async (orderId, file) => {
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
//using
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
//using
export const lowStockAlert = async (client) => {
    const lowStockProducts = await orderRepository.lowStockAlert(client);
    return lowStockProducts;
}

//recent orders for admin dashboard
//using
export const getRecentOrders = async (client) => {
    return await orderRepository.findRecentOrders(client);
}

//order status count for order page
//using
export const getOrderStatusCount = async (client) =>{
    const OrderStatus = await orderRepository.getOrderStatusCount(client);
    return OrderStatus;
}

//orders for order page
//using
export const getAllOrders = async (client) => {
    return await orderRepository.findAllOrders(client);
};

//using
export const getOrderById = async (orderId, client) => {
    return await orderRepository.getOrderById(orderId, client);
};

//using
export const findOrderImageById = async (orderId, client) => {
    return await orderRepository.findOrderImageById(orderId, client);
}

// export const findOrderImageById = async (orderId, client) => {
//     const result = await orderRepository.findOrderImageById(orderId, client);
//     if (!result) return null;

//     return {
//         ...result,
//         media_url: result.media_url?.endsWith('.pdf') && result.media_url?.includes('/image/upload/')
//             ? result.media_url.replace('/image/upload/', '/raw/upload/')
//             : result.media_url,
//     };
// };

// export const findOrderImageById = async (orderId, client) => {
//     const result = await orderRepository.findOrderImageById(orderId, client);
//     if (!result) return null;

//     const isPdf = result.media_url?.endsWith('.pdf');

//     return {
//         ...result,
//         // corrected view URL
//         media_url: isPdf
//             ? result.media_url.replace('/image/upload/', '/raw/upload/')
//             : result.media_url,
//         // direct download URL built from public_id — bypasses the broken stored URL entirely
//         download_url: isPdf
//             ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/${result.media_public_id}.pdf`
//             : null,
//     };
// };

//using
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

//using
export const updateOrderStatus = async (orderId, newStatus, client) => {
    const order = await orderRepository.getOrderById(orderId, client);
    if (!order) throw new AppError('Order not found', 404);

    const updated = await orderRepository.updateOrderStatus(orderId, newStatus, client);
    try {
        await sendOrderStatusUpdateEmail({
            full_name:     order.full_name,
            email:         order.customer_email,
            order_status:  newStatus,
            order_id:      order.order_id,
            tracking_code: order.tracking_code,
            total_amount:  order.total_amount,
        });
    } catch (emailError) {
        console.error('Order status update email failed (non-fatal):', emailError);
    }

    return updated;
};

//waiting list
// export const deleteOrder = async (orderId, client) => {
//     const ImageData = await orderRepository.findOrderImageById(orderId, client);
//     await deleteFromCloudinary(ImageData.media_public_id);
//     const deletedOrder = await orderRepository.deleteOrder(orderId, client);
//     return deletedOrder;
// };





