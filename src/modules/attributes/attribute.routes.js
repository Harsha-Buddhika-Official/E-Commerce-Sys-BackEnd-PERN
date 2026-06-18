import { createAttribute, getAttributesByCategoryId, getAttributes, getAttributeById, deleteAttribute, updateAttribute, createAttributeValue, deleteAttributeValue, getAttributesGroupedByCategory, createProductAttribute } from './attribute.controller.js';
import express from 'express';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { validateProductAttributeMapping } from './attribute.validator.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
// router.get('/category', getAttributesByCategoryId);
// router.get('/:id', getAttributeById);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin'), getAttributes); //using
router.get('/admin/grouped/:categoryId', authorize('super_admin', 'admin'), getAttributesGroupedByCategory); //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin', authorize('super_admin', 'admin'), createAttribute); //using //working
router.post('/admin/:attributeId/value', authorize('super_admin', 'admin'), createAttributeValue); //using //working
router.post('/admin/products/:productId/attributes', authorize('super_admin', 'admin'), validateProductAttributeMapping, createProductAttribute); //using

// ==================== PROTECTED ROUTES - PUT ====================
// router.put('/:id', authorize('super_admin', 'admin'), updateAttribute);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin'), deleteAttribute); //using
router.delete('/admin/:attributeId/value/:valueId', authorize('super_admin', 'admin'), deleteAttributeValue); //using

export default router;