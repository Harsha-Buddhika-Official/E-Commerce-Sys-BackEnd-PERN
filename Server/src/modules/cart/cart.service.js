import * as cartRepository from './cart.repository.js';

export const addToCart = async (sessionId, productId, quantity) => {
    let cart = await cartRepository.findCartBySessionId(sessionId);
    if (!cart) {
        cart = await cartRepository.addToCart(sessionId);
    }
    return await cartRepository.addItemToCart(cart.cart_id, productId, quantity);
}