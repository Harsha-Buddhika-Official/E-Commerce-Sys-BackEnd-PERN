import * as cartRepository from './cart.repository.js';
import { findOfferByProductId, findOfferByIdWhenItsActive } from '../offers/offers.repository.js';
import AppError from '../../utils/AppError.js';
import { setSessionCookie } from '../../middlewares/session.middleware.js';

// using
export const getCart = async (sessionId) => {
    // console.log("Service Layer - getCart called with sessionId:", sessionId);
    const cart = await cartRepository.findCartBySession(sessionId);

    if (!cart) {
        return { items: [], total: '0.00', item_count: 0 };
    }

    return cartRepository.getCartWithItems(cart.cart_id);
};

//using
export const addItem = async ({ sessionId, productId, quantity }) => {
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

    // pricing logic (still inside service per your current architecture)
    let finalPrice = product.discounted_price;

    const offerProduct = await findOfferByProductId(productId);
    if (offerProduct) {
        const offer = await findOfferByIdWhenItsActive(offerProduct.offer_id);

        if (offer) {
            if (offer.discount_type === 'percentage') {
                finalPrice = (finalPrice * (100 - offer.discount_value)) / 100;
            } else if (offer.discount_type === 'fixed') {
                finalPrice = Math.max(0, finalPrice - offer.discount_value);
            }
        }
    }

    let cart = await cartRepository.findCartBySession(sessionId);

    if (!cart) {
        cart = await cartRepository.createCart(sessionId);
    }

    const existingItem = await cartRepository.findCartItem(
        cart.cart_id,
        productId
    );

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > product.stock_quantity) {
            throw new AppError(
                `Cannot add ${quantity}. You already have ${existingItem.quantity}.`,
                409
            );
        }

        await cartRepository.updateItemQuantity(
            existingItem.cart_item_id,
            newQuantity
        );
    } else {
        await cartRepository.createCartItem({
            cart_id: cart.cart_id,
            product_id: productId,
            quantity,
            price_at_add: finalPrice,
        });
    }

    return cartRepository.getCartWithItems(cart.cart_id);
};

//using
export const updateQuantity = async ({ sessionId, itemId, quantity }) => {
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

//using
export const removeItem = async ({ sessionId, itemId }) => {
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

//using
export const clearCart = async (sessionId) => {
    const cart = await cartRepository.findCartBySession(sessionId);
    if (!cart) {
        throw new AppError('Cart not found', 404);
    }

    await cartRepository.deleteAllCartItems(cart.cart_id);
};