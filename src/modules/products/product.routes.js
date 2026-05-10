import express from 'express';
import { createProduct, createProductAttribute, deleteProduct, getAllProducts, getProductByid, removeProductAttribute, restoreProduct, softDeleteProduct, updateProduct, getAttributesByCategory, getBestSellingProducts, getLatestProducts, getProductsByCategory, getFilterOptions, getFilteredProducts } from './product.controller.js';
import { validateCreateProductAttribute, validateProduct, validateCategoryIdParam, validateProductAttributeParams, validateFilterProducts } from './product.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/', getAllProducts);
router.get('/best-selling', getBestSellingProducts);
router.get('/latest', getLatestProducts);
router.get('/products/category/:categoryId', validateCategoryIdParam, getProductsByCategory);
router.get('/attributes/by-category/:categoryId', validateCategoryIdParam, getAttributesByCategory);
router.get('/:id', validateCategoryIdParam, getProductByid);
router.get('/filter/options/:categoryId', getFilterOptions);
router.post('/filter/:categoryId', getFilteredProducts); 

// ==================== PUBLIC ROUTES - POST ====================
router.post('/', validateProduct, createProduct);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin'), validateProduct, updateProduct);
router.put('/:id/soft-delete', authorize('super_admin', 'admin'), validateCategoryIdParam, softDeleteProduct);
router.put('/:id/restore', authorize('super_admin', 'admin'), validateCategoryIdParam, restoreProduct);

// ==================== PROTECTED ROUTES - POST ====================
router.post('/:id/attributes', authorize('super_admin', 'admin'), validateCategoryIdParam, validateCreateProductAttribute, createProductAttribute);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/:id', authorize('super_admin', 'admin'), validateCategoryIdParam, deleteProduct);
router.delete('/:id/attributes/:attributeId', authorize('super_admin', 'admin'), validateProductAttributeParams, removeProductAttribute);

export default router;