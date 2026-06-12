import express from 'express';
import { getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder, getStatusData, lowStockAlert, OrderStatusCount, getRecentOrders, createOrder, updatePaymentSlip, findOrderImageById } from './order.controller.js';
import { validateCreateCartOrder, validateCreateDirectOrder, validateOrderIdParam, validateTrackingLookup, validateUpdateOrderStatus, validateCreateOrder } from './order.validator.js';
import { attachSession } from '../../middlewares/session.middleware.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

router.use(attachSession);

// ==================== PUBLIC ROUTES - POST ====================
router.post('/create',  createOrder); //validateCreateOrder, //working //using
router.post('/tracking', validateTrackingLookup, getOrdersByTrackingCode); //working using
router.post('/upload-receipt/:id', upload.single('media'), updatePaymentSlip); //working //using

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin/statuses', authorize('super_admin', 'admin', 'manager'), getStatusData); //using for admin side
router.get('/admin/low-stock-alert', authorize('super_admin', 'admin', 'manager'), lowStockAlert); //using for admin side
router.get('/admin/recent-orders', authorize('super_admin', 'admin', 'manager'), getRecentOrders); //using for admin side
router.get('/admin/order-status-count', authorize('super_admin', 'admin', 'manager'), OrderStatusCount); //using for admin side
router.get('/admin/orders', authorize('super_admin', 'admin', 'manager'), getAllOrders); //using for admin side
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, getOrderById); //using for admin side
router.get('/receipt/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, findOrderImageById); //using for admin side

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/state/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus); //using for admin side

// ==================== PROTECTED ROUTES - DELETE ====================
// router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, deleteOrder); //waiting list


export default router;
