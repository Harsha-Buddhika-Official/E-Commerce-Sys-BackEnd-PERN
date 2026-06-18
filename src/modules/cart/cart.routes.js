import express from 'express';
import { getCart, addItem, updateQuantity, removeItem, clearCart } from './cart.controller.js';
import { attachSession } from '../../middlewares/session.middleware.js';
import { validateAddItem, validateUpdateItem, validateItemId } from './cart.validator.js';

const router = express.Router();

router.use(attachSession);

router.get('/', getCart);

router.post('/', validateAddItem, addItem);

router.patch('/:itemId', validateItemId, validateUpdateItem, updateQuantity);

router.delete('/:itemId', validateItemId, removeItem);

router.delete('/', clearCart);

export default router;