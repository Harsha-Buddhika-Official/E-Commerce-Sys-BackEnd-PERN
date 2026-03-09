import express from 'express';
import { createBrand, deleteBrand, getAllBrands, getBrandById, restoreBrand, softDeleteBrand, updateBrand } from './brand.controller.js';

const router = express.Router();

router.post('/', createBrand); //done testing
router.get('/', getAllBrands); //done testing
router.get('/:id', getBrandById); //done testing
router.put('/:id', updateBrand); //done testing
router.delete('/:id', deleteBrand); //done testing
router.put('/:id/soft-delete', softDeleteBrand); //done testing
router.put('/:id/restore', restoreBrand); //done testing

export default router;