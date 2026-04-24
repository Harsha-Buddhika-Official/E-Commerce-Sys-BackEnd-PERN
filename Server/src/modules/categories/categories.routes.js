import express from 'express';
import { createCategory, getCategories, getCategoryById, softDeleteCategory, deleteCategory, restoreCategory, updateCategory } from './categories.controller.js';
import { validateCreateCategory, validateGetCategorySchema, validateUpdateCategory, validateCategoryIdParam } from './categories.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';


const router = express.Router();

// Public routes for fetching categories
router.get('/',  validateGetCategorySchema, getCategories); 
router.get('/:id', validateCategoryIdParam, getCategoryById);

// Protected routes for category management
router.use(authMiddleware);

// Protected routes for category management 
router.post('/', authorize('super_admin','admin'), validateCreateCategory, createCategory); 
router.put('/:id', authorize('super_admin','admin'), validateCategoryIdParam, validateUpdateCategory, updateCategory); 
router.delete('/:id', authorize('super_admin','admin'), validateCategoryIdParam, deleteCategory); 
router.put('/:id/deactivate', authorize('super_admin','admin'), validateCategoryIdParam, softDeleteCategory); 
router.put('/:id/restore', authorize('super_admin','admin'), validateCategoryIdParam, restoreCategory); 

export default router;