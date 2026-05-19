import { CartService } from './cart.service.js';

export class CartController {
    constructor() {
        this.service = new CartService();
    }

    getCart = async (req, res, next) => {
        try {
            const cart = await this.service.getCart(req.sessionId);
            res.status(200).json({
                success: true,
                data: cart,
            });
        } catch (error) {
            next(error);
        }
    };

    addItem = async (req, res, next) => {
        try {
            const { product_id, quantity } = req.body;
            const cart = await this.service.addItem({
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

    updateQuantity = async (req, res, next) => {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            const cart = await this.service.updateQuantity({
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

    removeItem = async (req, res, next) => {
        try {
            const { itemId } = req.params;
            const cart = await this.service.removeItem({
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

    clearCart = async (req, res, next) => {
        try {
            await this.service.clearCart(req.sessionId);
            res.status(200).json({
                success: true,
                message: 'Cart cleared successfully',
            });
        } catch (error) {
            next(error);
        }
    };
}