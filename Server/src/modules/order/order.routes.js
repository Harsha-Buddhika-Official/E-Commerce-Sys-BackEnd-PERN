import express from 'express';
import { createCartOrder, createDirectOrder } from './order.controller.js';

const router = express.Router();

router.post('/direct', createDirectOrder);
router.post('/cart', createCartOrder);

export default router;
