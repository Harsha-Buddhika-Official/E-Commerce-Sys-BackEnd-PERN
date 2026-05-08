import express from 'express';
import { createBrand, deleteBrand, getAllBrands, getBrandById, restoreBrand, softDeleteBrand, updateBrand } from './brand.controller.js';
import { validateCreateBrand, validateIdParam, validateUpdateBrand } from './brand.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/', getAllBrands);
router.get('/:id', validateIdParam, getBrandById);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - POST ====================
router.post('/', authorize('super_admin', 'admin', 'manager'), validateCreateBrand, createBrand);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validateIdParam, validateUpdateBrand, updateBrand);
router.put('/:id/soft-delete', authorize('super_admin', 'admin', 'manager'), validateIdParam, softDeleteBrand);
router.put('/:id/restore', authorize('super_admin', 'admin', 'manager'), validateIdParam, restoreBrand);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateIdParam, deleteBrand);

export default router;