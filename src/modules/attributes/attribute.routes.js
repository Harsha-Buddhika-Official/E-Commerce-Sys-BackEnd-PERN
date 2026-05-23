import { createAttribute, getAttributesByCategoryId, getAttributeCatalog, getAttributeById, deleteAttribute, updateAttribute } from './attribute.controller.js';
import express from 'express';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/category', getAttributesByCategoryId);
router.get('/:id', getAttributeById);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/', authorize('super_admin', 'admin'), getAttributeCatalog);

// ==================== PROTECTED ROUTES - POST ====================
router.post('/', authorize('super_admin', 'admin'), createAttribute);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin'), updateAttribute);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin'), deleteAttribute);

export default router;