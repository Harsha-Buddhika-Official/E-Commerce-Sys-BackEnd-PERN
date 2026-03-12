import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getProductByid, restoreProduct, softDeleteProduct, updateProduct } from './product.controller.js';
import {validateProduct, validateCategoryIdParam } from './product.validator.js';

const router = express.Router();

router.post('/', validateProduct, createProduct); //done tesing
router.get('/', getAllProducts);    //done testing
router.get('/:id', validateCategoryIdParam, getProductByid); //done testing
router.put('/:id', validateProduct, updateProduct); //done tesing
router.delete('/:id', validateCategoryIdParam, deleteProduct); //done tesing
router.put('/:id/soft-delete', validateCategoryIdParam, softDeleteProduct); //done testing
router.put('/:id/restore', validateCategoryIdParam, restoreProduct); //done testing

export default router;