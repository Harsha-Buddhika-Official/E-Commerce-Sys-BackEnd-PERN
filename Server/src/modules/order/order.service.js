import * as orderRepository from './order.repository.js';
import * as cartRepository from '../cart/cart.repository.js';
import { generateTrackingCode } from '../../utils/generateTrackingCode.js';

export const createDirectOrder = async (orderData, client) => {

    let total_amount = 0;
    total_amount += orderData.quantity * orderData.price_at_purchase;
    orderData.total_amount = total_amount;

    orderData.tracking_code = generateTrackingCode();

    if (!orderData.order_status) {
        orderData.order_status = 'pending';
    }

    return await orderRepository.createDirectOrder(orderData, client);
};

export const createCartOrder = async (orderData, client) => {
    const { sessionId } = orderData;

    if (!sessionId) {
        throw new Error('sessionId is required to create a cart order');
    }

    const cart = await cartRepository.findCartBySessionId(sessionId, client);
    if (!cart) {
        throw new Error('Cart not found for this session');
    }

    const cartItems = await cartRepository.getCartItems(cart.cart_id, client);
    if (!cartItems || cartItems.length === 0) {
        throw new Error('Cannot create order from an empty cart');
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
        throw new Error('No orders found for this email');
    }
    if(!trackingCode) {
        throw new Error('Tracking code is required');
    }
    return await orderRepository.getOrderByTrackingCode(trackingCode, client);
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