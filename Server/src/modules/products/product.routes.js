import express from 'express';
import { createProduct, createProductAttribute, deleteProduct, getAllProducts, getProductByid, removeProductAttribute, restoreProduct, softDeleteProduct, updateProduct } from './product.controller.js';
import {validateCreateProductAttribute, validateProduct, validateCategoryIdParam, validateProductAttributeParams } from './product.validator.js';

const router = express.Router();

router.post('/', validateProduct, createProduct); //done testing
router.get('/', getAllProducts); //done testing
router.get('/:id', validateCategoryIdParam, getProductByid); //done testing
router.put('/:id', validateProduct, updateProduct); //done testing
router.delete('/:id', validateCategoryIdParam, deleteProduct); //done testing
router.post('/:id/attributes', validateCategoryIdParam, validateCreateProductAttribute, createProductAttribute); 
router.delete('/:id/attributes/:attributeId', validateProductAttributeParams, removeProductAttribute);
router.put('/:id/soft-delete', validateCategoryIdParam, softDeleteProduct); //done testing
router.put('/:id/restore', validateCategoryIdParam, restoreProduct); //done testing

export default router;