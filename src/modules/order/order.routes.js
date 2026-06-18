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
router.post('/create',  createOrder); //validateCreateOrder,  //using
router.post('/tracking', validateTrackingLookup, getOrdersByTrackingCode);  //using
router.post('/upload-receipt/:id', upload.single('media'), updatePaymentSlip); //using

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin/statuses', authorize('super_admin', 'admin', 'manager'), getStatusData); 
router.get('/admin/low-stock-alert', authorize('super_admin', 'admin', 'manager'), lowStockAlert); 
router.get('/admin/recent-orders', authorize('super_admin', 'admin', 'manager'), getRecentOrders); //using
router.get('/admin/order-status-count', authorize('super_admin', 'admin', 'manager'), OrderStatusCount); //using
router.get('/admin/orders', authorize('super_admin', 'admin', 'manager'), getAllOrders); //using
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, getOrderById); //using
router.get('/admin/receipt/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, findOrderImageById); //using

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/state/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus); //using

// ==================== PROTECTED ROUTES - DELETE ====================
// router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, deleteOrder); //waiting list


export default router;
