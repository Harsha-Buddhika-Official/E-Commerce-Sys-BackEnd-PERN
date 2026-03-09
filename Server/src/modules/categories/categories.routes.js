import express from 'express';
import { createCategory, getCategories, getCategoryById, softDeleteCategory, deleteCategory, restoreCategory, updateCategory } from './categories.controller.js';
import { validateCreateCategory, validateGetCategorySchema, validateUpdateCategory, validateCategoryIdParam } from './categories.validator.js';

const router = express.Router();

router.post('/', validateCreateCategory, createCategory); //done testing
router.get('/', validateGetCategorySchema, getCategories); //done testing
router.get('/:id', validateCategoryIdParam, getCategoryById); //done testing
router.put('/:id', validateCategoryIdParam, validateUpdateCategory, updateCategory); //done testing
router.delete('/:id', validateCategoryIdParam, deleteCategory); //done testing
router.put('/:id/deactivate', validateCategoryIdParam, softDeleteCategory); //done testing
router.put('/:id/restore', validateCategoryIdParam, restoreCategory); //done testing

export default router;