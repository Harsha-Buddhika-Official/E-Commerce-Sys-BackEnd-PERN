import * as cartRepository from './cart.repository.js';
import AppError from '../../utils/AppError.js';
import { setSessionCookie } from '../../middlewares/session.middleware.js';

export const getCart = async (sessionId) => {
    const cart = await cartRepository.findCartBySession(sessionId);

    if (!cart) {
        return { items: [], total: '0.00', item_count: 0 };
    }

    return cartRepository.getCartWithItems(cart.cart_id);
};

export const addItem = async (params) => {
    const { sessionId, isNewSession, productId, quantity, res } = params;

    const product = await cartRepository.findProduct(productId);
    if (!product || !product.is_active) {
        throw new AppError('Product not found or is no longer available', 404);
    }

    if (quantity > product.stock_quantity) {
        throw new AppError(
            `Only ${product.stock_quantity} unit(s) of "${product.name}" available`,
            409
        );
    }

    let cart = await cartRepository.findCartBySession(sessionId);
    if (!cart) {
        cart = await cartRepository.createCart(sessionId);
        if (isNewSession) setSessionCookie(res, sessionId);
    }

    const existingItem = await cartRepository.findCartItem(cart.cart_id, productId);

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock_quantity) {
            throw new AppError(
                `Cannot add ${quantity} more. ` +
                    `You already have ${existingItem.quantity} in your cart ` +
                    `and only ${product.stock_quantity} are in stock.`,
                409
            );
        }
        await cartRepository.updateItemQuantity(existingItem.cart_item_id, newQuantity);
    } else {
        await cartRepository.createCartItem({
            cart_id: cart.cart_id,
            product_id: productId,
            quantity,
            price_at_add: product.selling_price,
        });
    }

    return cartRepository.getCartWithItems(cart.cart_id);
};

export const updateQuantity = async (params) => {
    const { sessionId, itemId, quantity } = params;

    const cart = await cartRepository.findCartBySession(sessionId);
    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    const item = await cartRepository.findCartItemById(itemId);
    if (!item || item.cart_id !== cart.cart_id) {
        throw new AppError('Cart item not found', 404);
    }

    const product = await cartRepository.findProduct(item.product_id);
    if (product && quantity > product.stock_quantity) {
        throw new AppError(
            `Only ${product.stock_quantity} unit(s) available`,
            409
        );
    }

    await cartRepository.updateItemQuantity(itemId, quantity);
    return cartRepository.getCartWithItems(cart.cart_id);
};

export const removeItem = async (params) => {
    const { sessionId, itemId } = params;

    const cart = await cartRepository.findCartBySession(sessionId);
    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    const item = await cartRepository.findCartItemById(itemId);
    if (!item || item.cart_id !== cart.cart_id) {
        throw new AppError('Cart item not found', 404);
    }

    await cartRepository.deleteCartItem(itemId);
    return cartRepository.getCartWithItems(cart.cart_id);
};

export const clearCart = async (sessionId) => {
    const cart = await cartRepository.findCartBySession(sessionId);
    if (!cart) return;

    await cartRepository.deleteAllCartItems(cart.cart_id);
};