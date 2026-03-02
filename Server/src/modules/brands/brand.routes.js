import express from 'express';
import { createBrand, deleteBrand, softDeleteBrand } from './brand.controller.js';

const router = express.Router();

router.post('/', createBrand);
router.delete('/:id', deleteBrand);
router.put('/:id', softDeleteBrand);

export default router;