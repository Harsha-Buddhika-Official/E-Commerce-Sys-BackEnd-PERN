import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder } from './order.controller.js';
import { validateCreateCartOrder, validateCreateDirectOrder, validateOrderIdParam, validateTrackingLookup, validateUpdateOrderStatus } from './order.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/tracking', validateTrackingLookup, getOrdersByTrackingCode);

// ==================== PUBLIC ROUTES - POST ====================
router.post('/direct', validateCreateDirectOrder, createDirectOrder);
router.post('/cart', validateCreateCartOrder, createCartOrder);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/', authorize('super_admin', 'admin', 'manager'), getAllOrders);
router.get('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, getOrderById);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, deleteOrder);


export default router;
