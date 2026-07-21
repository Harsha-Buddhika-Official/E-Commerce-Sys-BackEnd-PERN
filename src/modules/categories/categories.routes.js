import express from 'express';
import { createCategory, getCategories,deleteCategory, getProductCategories, getAccessoryCategories, getCategoryNames } from './categories.controller.js';
import { validateCreateCategory, validateGetCategory, validateCategoryIdParam } from './categories.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/products', validateGetCategory, getProductCategories); 
router.get('/accessories', validateGetCategory, getAccessoryCategories); 
// router.get('/:id', validateCategoryIdParam, getCategoryById);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin'), getCategories); 
router.get('/admin/names', authorize('super_admin', 'admin'), getCategoryNames); 

// ==================== PROTECTED ROUTES - POST ====================
router.post('/', authorize('super_admin', 'admin'), upload.single('media'), validateCreateCategory, createCategory); 

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin'), validateCategoryIdParam, deleteCategory); 

export default router;