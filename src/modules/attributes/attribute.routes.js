import { createAttribute, getAttributes, getAttributeById, deleteAttribute, createAttributeValue, deleteAttributeValue, getAttributesGroupedByCategory, createProductAttribute } from './attribute.controller.js';
import express from 'express';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { validateProductAttributeMapping, validateCreateAttribute, validateCreateAttributeValue, validateDeleteAttribute,validateDeleteAttributeValue } from './attribute.validator.js';

const router = express.Router();

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin'), getAttributes); 
router.get('/admin/grouped/:categoryId', authorize('super_admin', 'admin'), getAttributesGroupedByCategory); 

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin', authorize('super_admin', 'admin'), validateCreateAttribute, createAttribute); 
router.post('/admin/:attributeId/value', authorize('super_admin', 'admin'), validateCreateAttributeValue, createAttributeValue); 
router.post('/admin/products/:productId/attributes', authorize('super_admin', 'admin'), validateProductAttributeMapping, createProductAttribute); 

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin'), validateDeleteAttribute, deleteAttribute); 
router.delete('/admin/:attributeId/value/:valueId', authorize('super_admin', 'admin'), validateDeleteAttributeValue, deleteAttributeValue); 

export default router;