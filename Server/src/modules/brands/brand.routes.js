import express from 'express';
import { createBrand, deleteBrand, getAllBrands, getBrandById, restoreBrand, softDeleteBrand, updateBrand } from './brand.controller.js';
import { validateCreateBrand, validateIdParam, validateUpdateBrand } from './brand.validator.js';
import { authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authorize('super_admin', 'admin', 'manager'), validateCreateBrand, createBrand);
router.get('/', getAllBrands);
router.get('/:id', validateIdParam, getBrandById);
router.put('/:id', authorize('super_admin', 'admin', 'manager'), validateIdParam, validateUpdateBrand, updateBrand);
router.delete('/:id', authorize('super_admin', 'admin', 'manager'), validateIdParam, deleteBrand);
router.put('/:id/soft-delete', authorize('super_admin', 'admin', 'manager'), validateIdParam, softDeleteBrand);
router.put('/:id/restore', authorize('super_admin', 'admin', 'manager'), validateIdParam, restoreBrand);

export default router;