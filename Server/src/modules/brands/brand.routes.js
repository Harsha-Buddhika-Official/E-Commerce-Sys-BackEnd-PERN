import express from 'express';
import { createBrand, deleteBrand, getAllBrands, getBrandById, restoreBrand, softDeleteBrand, updateBrand } from './brand.controller.js';
import { validateCreateBrand, validateIdParam, validateUpdateBrand } from './brand.validator.js';

const router = express.Router();

router.post('/', validateCreateBrand, createBrand); //done testing
router.get('/', getAllBrands); //done testing
router.get('/:id', validateIdParam, getBrandById); //done testing
router.put('/:id', validateIdParam, validateUpdateBrand, updateBrand); //done testing
router.delete('/:id', validateIdParam, deleteBrand); //done testing
router.put('/:id/soft-delete', validateIdParam, softDeleteBrand); //done testing
router.put('/:id/restore', validateIdParam, restoreBrand); //done testing

export default router;