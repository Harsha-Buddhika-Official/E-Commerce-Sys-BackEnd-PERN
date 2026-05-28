import { createAttribute, getAttributesByCategoryId, getAttributeCatalog, getAttributeById, deleteAttribute, updateAttribute, createAttributeValue, deleteAttributeValue, getAttributesGroupedByCategory, createProductAttribute } from './attribute.controller.js';
import express from 'express';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { validateProductAttributeMapping } from './attribute.validator.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/category', getAttributesByCategoryId);
router.get('/:id', getAttributeById);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/', authorize('super_admin', 'admin'), getAttributeCatalog);
router.get('/grouped/:categoryId', authorize('super_admin', 'admin'), getAttributesGroupedByCategory);

// ==================== PROTECTED ROUTES - POST ====================
router.post('/', authorize('super_admin', 'admin'), createAttribute);
router.post('/:attributeId/value', authorize('super_admin', 'admin'), createAttributeValue);
router.post('/products/:productId/attributes', authorize('super_admin', 'admin'), validateProductAttributeMapping, createProductAttribute);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin'), updateAttribute);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin'), deleteAttribute);
router.delete('/:attributeId/value/:valueId', authorize('super_admin', 'admin'), deleteAttributeValue);

export default router;