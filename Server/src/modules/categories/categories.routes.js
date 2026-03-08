import express from 'express';
import { createCategory, getCategories, getCategoryById, softDeleteCategory, deleteCategory, restoreCategory, updateCategory } from './categories.controller.js';
import {validateCreateCategory} from './categories.validator.js';

const router = express.Router();

router.post('/', validateCreateCategory, createCategory); //done testing
router.get('/', getCategories); //done testing with type and without type query param
router.get('/:id', getCategoryById); //done testing
router.put('/:id', updateCategory); //done testing
router.delete('/:id', deleteCategory); //done testing
router.put('/:id/deactivate', softDeleteCategory); //done testing
router.put('/:id/restore', restoreCategory); //done testing

export default router;