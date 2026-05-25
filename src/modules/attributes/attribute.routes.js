import { createAttribute, getAttributesByCategoryId, getAttributeCatalog, getAttributeById, deleteAttribute, updateAttribute, createAttributeValue, deleteAttributeValue } from './attribute.controller.js';
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
router.post('/:attributeId/value', authorize('super_admin', 'admin'), createAttributeValue);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin'), updateAttribute);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin'), deleteAttribute);
router.delete('/:attributeId/value/:valueId', authorize('super_admin', 'admin'), deleteAttributeValue);

export default router;