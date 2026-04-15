import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder } from './order.controller.js';
import { validateCreateCartOrder, validateCreateDirectOrder, validateOrderIdParam, validateTrackingLookup, validateUpdateOrderStatus } from './order.validator.js';

const router = express.Router();

router.post('/direct', validateCreateDirectOrder, createDirectOrder);
router.post('/cart', validateCreateCartOrder, createCartOrder);
router.get('/tracking', validateTrackingLookup, getOrdersByTrackingCode);
router.get('/:id', validateOrderIdParam, getOrderById);
router.get('/', getAllOrders);
router.put('/:id', validateOrderIdParam, validateUpdateOrderStatus, updateOrderStatus);
router.delete('/:id', validateOrderIdParam, deleteOrder);


export default router;
