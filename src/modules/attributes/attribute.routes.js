import { createAttribute, getAttributesByCategoryId, getAttributeById, deleteAttribute, updateAttribute } from './attribute.controller.js';
import express from 'express';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes for fetching attributes
router.get('/category', getAttributesByCategoryId);
router.get('/:id', getAttributeById);

// Protected routes for attribute management
router.use(authMiddleware);

// Protected routes for attribute management
router.post('/', authorize('super_admin', 'admin'), createAttribute);
router.delete('/', authorize('super_admin', 'admin'), deleteAttribute);
router.put('/:id', authorize('super_admin', 'admin'), updateAttribute);

export default router;