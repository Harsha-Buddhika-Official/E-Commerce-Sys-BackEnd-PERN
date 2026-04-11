import * as cartService from './cart.service.js';

export const addToCart = async (req, res, next) => {
    try{
        const { productId, quantity } = req.body;
        const sessionId = req.sessionID;
        const cartItem = await cartService.addToCart(sessionId, productId, quantity);
        
        // Set the sessionId as a cookie if it's a new session
        if (cartItem.sessionId && cartItem.sessionId !== sessionId) {
            res.cookie('sessionId', cartItem.sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure flag in production
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
        }
        
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
        // const sessionId = req.sessionID; // Using sessionID from express-session
        const sessionId = req.body.sessionId || req.sessionID; // Try to get sessionId from body first, then fallback to sessionID
        console.log("Session ID:", sessionId); // Debugging line to check session ID
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

        const cartItem = await cartService.verifyCartItemOwnership(cartItemId, req.sessionID);
        if (!cartItem) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this cart item'
            });
        }

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
        const cartItem = await cartService.verifyCartItemOwnership(cartItemId, req.sessionID);
        if (!cartItem) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this cart item'
            });
        }
        await cartService.removeCartItem(cartItemId);
        res.status(200).json({
            success: true,
            message: 'Cart item removed successfully'
        });
    } catch (error) {
        next(error);
    }
};