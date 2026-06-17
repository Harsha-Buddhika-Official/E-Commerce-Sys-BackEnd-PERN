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
router.get('/admin', authorize('super_admin', 'admin'), getAllBrands); //using //working
router.get('/admin/names', authorize('super_admin', 'admin'),  getAllBrandnames); //using //working

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin', authorize('super_admin', 'admin'), upload.single('logo'), validateCreateBrand, createBrand); //using

// ==================== PROTECTED ROUTES - PUT ====================
// router.put('/:id', authorize('super_admin', 'admin', 'manager'), upload.single('logo'), validateIdParam, validateUpdateBrand, updateBrand);
// router.put('/:id/soft-delete', authorize('super_admin', 'admin', 'manager'), validateIdParam, softDeleteBrand);
// router.put('/:id/restore', authorize('super_admin', 'admin', 'manager'), validateIdParam, restoreBrand);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin'), validateIdParam, deleteBrand); //using

export default router;