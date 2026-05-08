import express from 'express';
import { addToCart, removeCartItem, getCartItems, updateCartItem } from './cart.controller.js';
import { validateAddToCart, validateUpdateCartItem, validateIdParam, validateSessionId} from './cart.validator.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/', validateSessionId, getCartItems);

// ==================== PUBLIC ROUTES - POST ====================
router.post('/add', validateAddToCart, validateSessionId, addToCart);

// ==================== PUBLIC ROUTES - PUT ====================
router.put('/:cartItemId', validateIdParam, validateUpdateCartItem, validateSessionId, updateCartItem);

// ==================== PUBLIC ROUTES - DELETE ====================
router.delete('/:cartItemId', validateIdParam, validateSessionId, removeCartItem);

export default router;