import express from 'express';
import { addToCart, removeCartItem, getCartItems, updateCartItem } from './cart.controller.js';
import { validateAddToCart, validateUpdateCartItem, validateIdParam, validateSessionId} from './cart.validator.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes for cart management
router.post('/add', validateAddToCart, validateSessionId, addToCart); //working
router.get('/', validateSessionId, getCartItems);
router.put('/:cartItemId', validateIdParam, validateUpdateCartItem, validateSessionId, updateCartItem);
router.delete('/:cartItemId', validateIdParam, validateSessionId, removeCartItem);

export default router;