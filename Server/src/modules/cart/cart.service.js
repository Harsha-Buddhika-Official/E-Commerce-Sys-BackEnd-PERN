import pool from '../../config/db.js';
import * as productRepository from '../products/product.repository.js';
import * as cartRepository from './cart.repository.js';
import { v4 as uuidv4 } from 'uuid';

export const addToCart = async (sessionId, productId, quantity) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        let cart = await cartRepository.findCartBySessionId(sessionId, client);
        let currentSessionId = sessionId;
        if (!cart) {
            currentSessionId = uuidv4(); //making the new session id for the cart if the user doesn't have one already
            cart = await cartRepository.addToCart(currentSessionId, client);
        }
        const product = await productRepository.findProductById(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.stock_quantity < quantity) {
            throw new Error("Not enough stock");
        }
        const item = await cartRepository.addItemToCart(
            cart.cart_id,
            productId,
            quantity,
            client
        );
        await client.query('COMMIT');
        return { ...item, sessionId: currentSessionId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const getCartItems = async (sessionId) => {
    const cart = await cartRepository.findCartBySessionId(sessionId);
    if (!cart) {
        return ["Cart is empty"];
    }
    return await cartRepository.getCartItems(cart.cart_id);
}

export const updateCartItem = async (cartItemId, quantity) => {
    return await cartRepository.updateCartItem(cartItemId, quantity);
}

export const removeCartItem = async (cartItemId) => {
    return await cartRepository.removeCartItem(cartItemId);
}

export const verifyCartItemOwnership = async (cartItemId, sessionId) => {
    return await cartRepository.verifyCartItemOwnership(cartItemId, sessionId);
}