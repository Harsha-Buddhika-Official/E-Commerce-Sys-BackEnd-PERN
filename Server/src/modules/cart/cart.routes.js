import express from 'express';
import { addToCart, removeCartItem, getCartItems, updateCartItem } from './cart.controller.js';
// import { validateAddToCart, validateDeleteCartItem, validateGetCartItems, validateUpdateCartItem } from './cart.validator.js';

const router = express.Router();

router.post('/add', addToCart);
router.get('/', getCartItems);
router.put('/:cartItemId', updateCartItem);
router.delete('/:cartItemId', removeCartItem);

export default router;