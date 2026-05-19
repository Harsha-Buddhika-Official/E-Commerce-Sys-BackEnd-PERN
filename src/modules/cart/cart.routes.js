import { Router } from 'express';
import { CartController } from './cart.controller.js';
import { attachSession } from '../../middlewares/session.middleware.js';
import { validateAddItem, validateUpdateItem, validateItemId } from './cart.validator.js';

const router = Router();
const ctrl = new CartController();

// Every cart route needs a session attached
router.use(attachSession);

// GET    /api/cart              → get full cart
// POST   /api/cart              → add item
// PATCH  /api/cart/:itemId      → update quantity
// DELETE /api/cart/:itemId      → remove single item
// DELETE /api/cart              → clear entire cart

router.get('/', ctrl.getCart);
router.post('/', validateAddItem, ctrl.addItem);
router.patch('/:itemId', validateItemId, validateUpdateItem, ctrl.updateQuantity);
router.delete('/:itemId', validateItemId, ctrl.removeItem);
router.delete('/', ctrl.clearCart);

export default router;