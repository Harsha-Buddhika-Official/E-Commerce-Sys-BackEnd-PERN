import express from 'express';
import { createProduct, createProductAttribute, deleteProduct, getAllProducts, getProductByid, removeProductAttribute, restoreProduct, softDeleteProduct, updateProduct } from './product.controller.js';
import {validateCreateProductAttribute, validateProduct, validateCategoryIdParam, validateProductAttributeParams } from './product.validator.js';
import { authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authorize('super_admin','admin'), validateProduct, createProduct); //done testing
router.get('/',  getAllProducts); //done testing
router.get('/:id', validateCategoryIdParam, getProductByid); //done testing
router.put('/:id', authorize('super_admin','admin'), validateProduct, updateProduct); //done testing
router.delete('/:id', authorize('super_admin','admin'), validateCategoryIdParam, deleteProduct); //done testing
router.post('/:id/attributes', authorize('super_admin','admin'), validateCategoryIdParam, validateCreateProductAttribute, createProductAttribute); 
router.delete('/:id/attributes/:attributeId', authorize('super_admin','admin'), validateProductAttributeParams, removeProductAttribute);
router.put('/:id/soft-delete', authorize('super_admin','admin'), validateCategoryIdParam, softDeleteProduct); //done testing
router.put('/:id/restore', authorize('super_admin','admin'), validateCategoryIdParam, restoreProduct); //done testing

export default router;