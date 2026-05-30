import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder, getStatusData, lowStockAlert, OrderStatusCount } from './order.controller.js';
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
router.get('/admin/statuses', authorize('super_admin', 'admin', 'manager'), getStatusData); //using 
router.get('/admin/low-stock-alert', authorize('super_admin', 'admin', 'manager'), lowStockAlert); //using 
router.get('/admin/order-status-count', authorize('super_admin', 'admin', 'manager'), OrderStatusCount);
router.get('/admin/all', authorize('super_admin', 'admin', 'manager'), getAllOrders);
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, getOrderById);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/state/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, deleteOrder);


export default router;
