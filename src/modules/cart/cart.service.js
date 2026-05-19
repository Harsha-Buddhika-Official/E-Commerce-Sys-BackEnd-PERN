import AppError from '../../utils/AppError.js';
import { setSessionCookie } from '../../middlewares/session.middleware.js';
import { CartRepo } from './cart.repository.js';

export class CartService {
    constructor() {
        this.repo = new CartRepo();
    }

    async getCart(sessionId) {
        const cart = await this.repo.findCartBySession(sessionId);

        if (!cart) {
            return { items: [], total: '0.00', item_count: 0 };
        }

        return this.repo.getCartWithItems(cart.cart_id);
    }

    async addItem(params) {
        const { sessionId, isNewSession, productId, quantity, res } = params;

        const product = await this.repo.findProduct(productId);
        if (!product || !product.is_active) {
            throw new AppError('Product not found or is no longer available', 404);
        }

        if (quantity > product.stock_quantity) {
            throw new AppError(
                `Only ${product.stock_quantity} unit(s) of "${product.name}" available`,
                409
            );
        }

        let cart = await this.repo.findCartBySession(sessionId);
        if (!cart) {
            cart = await this.repo.createCart(sessionId);
            if (isNewSession) setSessionCookie(res, sessionId);
        }

        const existingItem = await this.repo.findCartItem(cart.cart_id, productId);

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
            await this.repo.updateItemQuantity(existingItem.cart_item_id, newQuantity);
        } else {
            await this.repo.createCartItem({
                cart_id: cart.cart_id,
                product_id: productId,
                quantity,
                price_at_add: product.selling_price,
            });
        }

        return this.repo.getCartWithItems(cart.cart_id);
    }

    async updateQuantity(params) {
        const { sessionId, itemId, quantity } = params;

        const cart = await this.repo.findCartBySession(sessionId);
        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        const item = await this.repo.findCartItemById(itemId);
        if (!item || item.cart_id !== cart.cart_id) {
            throw new AppError('Cart item not found', 404);
        }

        const product = await this.repo.findProduct(item.product_id);
        if (product && quantity > product.stock_quantity) {
            throw new AppError(
                `Only ${product.stock_quantity} unit(s) available`,
                409
            );
        }

        await this.repo.updateItemQuantity(itemId, quantity);
        return this.repo.getCartWithItems(cart.cart_id);
    }

    async removeItem(params) {
        const { sessionId, itemId } = params;

        const cart = await this.repo.findCartBySession(sessionId);
        if (!cart) {
            throw new AppError('Cart not found', 404);
        }

        const item = await this.repo.findCartItemById(itemId);
        if (!item || item.cart_id !== cart.cart_id) {
            throw new AppError('Cart item not found', 404);
        }

        await this.repo.deleteCartItem(itemId);
        return this.repo.getCartWithItems(cart.cart_id);
    }

    async clearCart(sessionId) {
        const cart = await this.repo.findCartBySession(sessionId);
        if (!cart) return;

        await this.repo.deleteAllCartItems(cart.cart_id);
    }
}