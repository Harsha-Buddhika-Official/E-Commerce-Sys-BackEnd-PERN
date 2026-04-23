import express from 'express';
import { createCategory, getCategories, getCategoryById, softDeleteCategory, deleteCategory, restoreCategory, updateCategory } from './categories.controller.js';
import { validateCreateCategory, validateGetCategorySchema, validateUpdateCategory, validateCategoryIdParam } from './categories.validator.js';
import { authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authorize('super_admin','admin'), validateCreateCategory, createCategory); //done testing
router.get('/',  validateGetCategorySchema, getCategories); //done testing
router.get('/:id', validateCategoryIdParam, getCategoryById); //done testing
router.put('/:id', authorize('super_admin','admin'), validateCategoryIdParam, validateUpdateCategory, updateCategory); //done testing
router.delete('/:id', authorize('super_admin','admin'), validateCategoryIdParam, deleteCategory); //done testing
router.put('/:id/deactivate', authorize('super_admin','admin'), validateCategoryIdParam, softDeleteCategory); //done testing
router.put('/:id/restore', authorize('super_admin','admin'), validateCategoryIdParam, restoreCategory); //done testing

export default router;