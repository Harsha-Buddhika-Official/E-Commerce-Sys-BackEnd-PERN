import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder, getStatusData, lowStockAlert, OrderStatusCount, getRecentOrders } from './order.controller.js';
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
router.get('/admin/statuses', authorize('super_admin', 'admin', 'manager'), getStatusData); //using for admin side
router.get('/admin/low-stock-alert', authorize('super_admin', 'admin', 'manager'), lowStockAlert); //using for admin side
router.get('/admin/recent-orders', authorize('super_admin', 'admin', 'manager'), getRecentOrders); //using for admin side
router.get('/admin/order-status-count', authorize('super_admin', 'admin', 'manager'), OrderStatusCount); //using for admin side
router.get('/admin/orders', authorize('super_admin', 'admin', 'manager'), getAllOrders); //using for admin side
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, getOrderById); //using for admin side

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/state/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus); //using for admin side

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, deleteOrder); 


export default router;
