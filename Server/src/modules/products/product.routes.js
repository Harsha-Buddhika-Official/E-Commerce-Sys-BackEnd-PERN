import express from 'express';
import { createProduct, createProductAttribute, deleteProduct, getAllProducts, getProductByid, removeProductAttribute, restoreProduct, softDeleteProduct, updateProduct } from './product.controller.js';
import {validateCreateProductAttribute, validateProduct, validateCategoryIdParam, validateProductAttributeParams } from './product.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// Public routes for fetching products
router.get('/',  getAllProducts); 
router.get('/:id', validateCategoryIdParam, getProductByid); 

// Protected routes for product management
router.use(authMiddleware);

// Protected routes for product management
router.post('/', authorize('super_admin','admin'), validateProduct, createProduct); 
router.put('/:id', authorize('super_admin','admin'), validateProduct, updateProduct); 
router.delete('/:id', authorize('super_admin','admin'), validateCategoryIdParam, deleteProduct); 
router.post('/:id/attributes', authorize('super_admin','admin'), validateCategoryIdParam, validateCreateProductAttribute, createProductAttribute); 
router.delete('/:id/attributes/:attributeId', authorize('super_admin','admin'), validateProductAttributeParams, removeProductAttribute);
router.put('/:id/soft-delete', authorize('super_admin','admin'), validateCategoryIdParam, softDeleteProduct); 
router.put('/:id/restore', authorize('super_admin','admin'), validateCategoryIdParam, restoreProduct); 

export default router;