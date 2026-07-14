import express from 'express';
import { getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, getStatusData, lowStockAlert, OrderStatusCount, getRecentOrders, createOrder, updatePaymentSlip, findOrderImageById } from './order.controller.js';
import { validateOrderIdParam, validateTrackingLookup, validateUpdateOrderStatus, validateCreateOrder } from './order.validator.js';
import { attachSession } from '../../middlewares/session.middleware.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import receiptUpload from '../../middlewares/multer.js';

const router = express.Router();

router.use(attachSession);

// ==================== PUBLIC ROUTES - POST ====================
router.post('/create',  validateCreateOrder, createOrder);
router.post('/tracking', validateTrackingLookup, getOrdersByTrackingCode);  
router.post('/upload-receipt/:id', receiptUpload.single('media'), updatePaymentSlip); 

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin/statuses', authorize('super_admin', 'admin', 'manager'), getStatusData); 
router.get('/admin/low-stock-alert', authorize('super_admin', 'admin', 'manager'), lowStockAlert); 
router.get('/admin/recent-orders', authorize('super_admin', 'admin', 'manager'), getRecentOrders); 
router.get('/admin/order-status-count', authorize('super_admin', 'admin', 'manager'), OrderStatusCount); 
router.get('/admin/orders', authorize('super_admin', 'admin', 'manager'), getAllOrders); 
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, getOrderById); 
router.get('/admin/receipt/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, findOrderImageById); 

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/state/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus); 

// ==================== PROTECTED ROUTES - DELETE ====================
// router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateOrderIdParam, deleteOrder); //waiting list


export default router;
