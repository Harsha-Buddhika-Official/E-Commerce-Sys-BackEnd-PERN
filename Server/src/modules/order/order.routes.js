import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByTrackingCode, getAllOrders, updateOrderStatus, deleteOrder } from './order.controller.js';

const router = express.Router();

router.post('/direct', createDirectOrder);
router.post('/cart', createCartOrder);
router.get('/tracking', getOrdersByTrackingCode);
router.get('/:id', getOrderById);
router.get('/', getAllOrders);
router.put('/:id', updateOrderStatus);
router.delete('/:id', deleteOrder);


export default router;
