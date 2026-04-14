import express from 'express';
import { createCartOrder, createDirectOrder, getOrderById, getOrdersByEmail, getAllOrders, updateOrderStatus, deleteOrder } from './order.controller.js';

const router = express.Router();

router.post('/direct', createDirectOrder);
router.post('/cart', createCartOrder);
router.get('/:id', getOrderById);
router.get('/email', getOrdersByEmail);
router.get('/', getAllOrders);
router.put('/:id', updateOrderStatus);
router.delete('/:id', deleteOrder);


export default router;
