import * as cartService from './cart.service.js';

export const getCart = async (req, res, next) => {
    try {
        // console.log(req.cookies.sid);
        const cart = await cartService.getCart(req.sessionId);
        res.status(200).json({
            success: true,
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

export const addItem = async (req, res, next) => {
    try {
        const { product_id, quantity } = req.body;
        const cart = await cartService.addItem({
            sessionId: req.sessionId,
            isNewSession: req.isNewSession,
            productId: product_id,
            quantity,
            res,
        });

        res.status(201).json({
            success: true,
            data: cart,
            message: 'Item added to cart successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const updateQuantity = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        const cart = await cartService.updateQuantity({
            sessionId: req.sessionId,
            itemId,
            quantity,
        });

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart item updated successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const removeItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const cart = await cartService.removeItem({
            sessionId: req.sessionId,
            itemId,
        });

        res.status(200).json({
            success: true,
            data: cart,
            message: 'Cart item removed successfully',
        });
    } catch (error) {
        next(error);
    }
};

export const clearCart = async (req, res, next) => {
    try {
        await cartService.clearCart(req.sessionId);
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
        });
    } catch (error) {
        next(error);
    }
};