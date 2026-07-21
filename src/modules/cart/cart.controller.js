import * as cartService from './cart.service.js';
import { setSessionCookie } from '../../middlewares/session.middleware.js';

export const getCart = async (req, res, next) => {
    try {
        const cart = await cartService.getCart(req.sessionId);

        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: cart,
        });
    } catch (error) {
        next(error);
    }
};

export const addItem = async (req, res, next) => {
    // console.log('body:', req.body); 
    // console.log('params:', req.params);
    try {
        const { product_id, quantity } = req.body;

        const cart = await cartService.addItem({
            sessionId: req.sessionId,
            productId: product_id,
            quantity,
        });

        if (req.isNewSession) {
            setSessionCookie(res, req.sessionId);
        }

        res.status(201).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart,
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
            message: 'Cart item updated successfully',
            data: cart,
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
            message: 'Cart item removed successfully',
            data: cart,
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
            data: null,
        });
    } catch (error) {
        next(error);
    }
};