import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder } from './order.controller.js';
import { validateCreateCartOrder, validateCreateDirectOrder, validateOrderIdParam, validateTrackingLookup, validateUpdateOrderStatus } from './order.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes for order creation and tracking
router.post('/direct', validateCreateDirectOrder, createDirectOrder);
router.post('/cart', validateCreateCartOrder, createCartOrder);
router.get('/tracking', validateTrackingLookup, getOrdersByTrackingCode);

// Protected routes for order management
router.use(authMiddleware);

// Protected routes for order management
router.get('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, getOrderById);
router.get('/', authorize('super_admin', 'admin', 'manager'), getAllOrders);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus);
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, deleteOrder);


export default router;
