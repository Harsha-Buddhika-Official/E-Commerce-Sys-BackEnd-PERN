import * as cartService from './cart.service.js';

export const addToCart = async (req, res, next) => {
    try{
        const { productId, quantity } = req.body;
        const sessionId = req.sessionID;
        const cartItem = await cartService.addToCart(sessionId, productId, quantity);
        res.status(200).json({
            success: true,
            data: cartItem,
            message: 'Item added to cart successfully'
        });
    } catch (error) {
        next(error);

    }
}

export const getCartItems = async (req, res, next) => {
    try {
        const sessionId = req.sessionID;
        const cartItems = await cartService.getCartItems(sessionId);
        res.status(200).json({
            success: true,
            data: cartItems
        });
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (req, res, next) => {
    try {
        const { cartItemId } = req.params;
        const { quantity } = req.body;
        const updatedItem = await cartService.updateCartItem(cartItemId, quantity);
        res.status(200).json({
            success: true,
            data: updatedItem,
            message: 'Cart item updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const removeCartItem = async (req, res, next) => {
    try {
        const { cartItemId } = req.params;
        await cartService.removeCartItem(cartItemId);
        res.status(200).json({
            success: true,
            message: 'Cart item removed successfully'
        });
    } catch (error) {
        next(error);
    }
};