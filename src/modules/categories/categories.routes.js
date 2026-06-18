import express from 'express';
import { createCategory, getCategories, getCategoryById, softDeleteCategory, deleteCategory, restoreCategory, updateCategory, getProductCategories, getAccessoryCategories, getCategoryNames } from './categories.controller.js';
import { validateCreateCategory, validateGetCategorySchema, validateUpdateCategory, validateCategoryIdParam } from './categories.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/products', validateGetCategorySchema, getProductCategories);
router.get('/accessories', validateGetCategorySchema, getAccessoryCategories);
// router.get('/:id', validateCategoryIdParam, getCategoryById);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin'), getCategories); //using
router.get('/admin/names', authorize('super_admin', 'admin'), getCategoryNames); //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/', authorize('super_admin', 'admin'), upload.single('media'), createCategory); //using

// ==================== PROTECTED ROUTES - PUT ====================
// router.put('/:id', authorize('super_admin', 'admin'), validateCategoryIdParam, validateUpdateCategory, updateCategory);
// router.put('/:id/deactivate', authorize('super_admin', 'admin'), validateCategoryIdParam, softDeleteCategory);
// router.put('/:id/restore', authorize('super_admin', 'admin'), validateCategoryIdParam, restoreCategory);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin'), validateCategoryIdParam, deleteCategory); //using

export default router;