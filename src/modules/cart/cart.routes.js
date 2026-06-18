import express from 'express';
import { getCart, addItem, updateQuantity, removeItem, clearCart } from './cart.controller.js';
import { attachSession } from '../../middlewares/session.middleware.js';
import { validateAddItem, validateUpdateItem, validateItemId } from './cart.validator.js';

const router = express.Router();

router.use(attachSession);

router.get('/', getCart); //using

router.post('/', validateAddItem, addItem); //using

router.patch('/:itemId', validateItemId, validateUpdateItem, updateQuantity); //using

router.delete('/:itemId', validateItemId, removeItem); //using

router.delete('/', clearCart); //using

export default router;