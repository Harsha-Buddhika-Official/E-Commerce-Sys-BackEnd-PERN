import * as orderRepository from './order.repository.js';
import * as cartRepository from '../cart/cart.repository.js';

export const createDirectOrder = async (orderData, client) => {
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

    const items = cartItems.map((item, index) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase
    }));

    return await orderRepository.createCartOrder({ ...orderData, items }, client);
};