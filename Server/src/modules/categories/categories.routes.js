import express from 'express';
import { createCategory, getAllCategories, getCategories, getCategoryById, softDeleteCategory, deleteCategory, restoreCategory, updateCategory } from './categories.controller.js';

const router = express.Router();

router.post('/', createCategory); //done testing
router.get('/', getAllCategories); //done testing
router.get('/type', getCategories); //done testing
router.get('/:id', getCategoryById); //done testing
router.put('/:id', updateCategory); //done testing
router.delete('/:id', deleteCategory); //done testing
router.put('/soft/:id', softDeleteCategory); //done testing
router.put('/restore/:id', restoreCategory); //done testing

export default router;