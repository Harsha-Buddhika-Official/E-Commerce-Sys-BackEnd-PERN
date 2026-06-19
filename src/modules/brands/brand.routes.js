import express from 'express';
import { createBrand, deleteBrand, getAllBrandnames, getAllBrands, getBrandById } from './brand.controller.js';
import { validateCreateBrand, validateIdParam, validateUpdateBrand } from './brand.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin'), getAllBrands); //using 
router.get('/admin/names', authorize('super_admin', 'admin'),  getAllBrandnames); //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin', authorize('super_admin', 'admin'), upload.single('logo'), validateCreateBrand, createBrand); //using

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin'), validateIdParam, deleteBrand); //using

export default router;