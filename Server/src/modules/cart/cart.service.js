import pool from '../../config/db.js';
import * as productRepository from '../products/product.repository.js';
import * as cartRepository from './cart.repository.js';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../../utils/AppError.js';

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
            throw new AppError("Product not found", 404);
        }
        if (product.stock_quantity < quantity) {
            throw new AppError("Not enough stock", 400);
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
    if (!sessionId) {
        throw new AppError("Session ID is required to retrieve cart items", 400);
    }
    const cart = await cartRepository.findCartBySessionId(sessionId);
    if (!cart) {
        throw new AppError("Cart is empty", 404);
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