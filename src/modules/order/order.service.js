import * as orderRepository from './order.repository.js';
import * as cartRepository from '../cart/cart.repository.js';
import * as productRepository from '../products/product.repository.js';
import { generateTrackingCode } from '../../utils/generateTrackingCode.js';
import AppError from '../../utils/AppError.js';

export const createDirectOrder = async (orderData, client) => {
    const productData = await productRepository.findProductById(orderData.product_id);
    if (!productData) {
        throw new AppError('Product not found', 404);
    }
    let total_amount = 0;
    total_amount += orderData.quantity * productData.selling_price;
    orderData.total_amount = total_amount;

    orderData.price_at_purchase = productData.selling_price;

    orderData.tracking_code = generateTrackingCode();

    orderData.order_status = 'pending';

    return await orderRepository.createDirectOrder(orderData, client);
};

export const createCartOrder = async (orderData, client) => {
    const { sessionId } = orderData;

    if (!sessionId) {
        throw new AppError('sessionId is required to create a cart order', 401);
    }

    const cart = await cartRepository.findCartBySessionId(sessionId, client);
    if (!cart) {
        throw new AppError('Cart not found for this session', 404);
    }

    const cartItems = await cartRepository.getCartItems(cart.cart_id, client);
    if (!cartItems || cartItems.length === 0) {
        throw new AppError('Cannot create order from an empty cart', 400);
    }

    let total_amount = 0;
    for (const item of cartItems) {
        total_amount += item.quantity * item.price_at_purchase;
    }

    orderData.total_amount = total_amount;

    orderData.tracking_code = generateTrackingCode();

    if (!orderData.order_status) {
        orderData.order_status = 'pending';
    }

    const items = cartItems.map((item, index) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase
    }));

    return await orderRepository.createCartOrder({ ...orderData, items }, client);
};

export const getOrderById = async (orderId, client) => {
    return await orderRepository.getOrderById(orderId, client);
};

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

export const getAllOrders = async (client) => {
    return await orderRepository.getAllOrders(client);
};

export const updateOrderStatus = async (orderId, newStatus, client) => {
    return await orderRepository.updateOrderStatus(orderId, newStatus, client);
};

export const deleteOrder = async (orderId, client) => {
    return await orderRepository.deleteOrder(orderId, client);
};