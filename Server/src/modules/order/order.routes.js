import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder } from './order.controller.js';
import { validateCreateCartOrder, validateCreateDirectOrder, validateOrderIdParam, validateTrackingLookup, validateUpdateOrderStatus } from './order.validator.js';
import { authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/direct', validateCreateDirectOrder, createDirectOrder);
router.post('/cart', validateCreateCartOrder, createCartOrder);
router.get('/tracking', validateTrackingLookup, getOrdersByTrackingCode);
router.get('/:id', validateOrderIdParam, getOrderById);
router.get('/', authorize('super_admin','admin','manager'), getAllOrders);
router.put('/:id', authorize('super_admin','admin','manager'), validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus);
router.delete('/:id', authorize('super_admin','admin','manager'), validateOrderIdParam, deleteOrder);


export default router;
