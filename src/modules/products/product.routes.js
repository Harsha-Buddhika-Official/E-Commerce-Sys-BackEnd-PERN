import express from 'express';
import { createProduct, createProductAttribute, deleteProduct, getAllProducts, getAllProductLimitedDetilas, getAllDetialsProductById, getProductByid, getProductByName, removeProductAttribute, restoreProduct, softDeleteProduct, updateProduct, getAttributesByCategory, getBestSellingProducts, getLatestProducts, getProductsByCategory, getFilterOptions, getFilteredProducts } from './product.controller.js';
import { validateCreateProductAttribute, validateProduct, validateCategoryIdParam, validateProductAttributeParams, validateFilterProducts, validateProductId } from './product.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/', getAllProducts);
router.get('/best-selling', getBestSellingProducts);
router.get('/latest', getLatestProducts);
router.get('/search/:name', getProductByName);
router.get('/category/:categoryId', validateCategoryIdParam, getProductsByCategory);
router.get('/attributes/by-category/:categoryId', validateCategoryIdParam, getAttributesByCategory);
router.get('/filter/options/:categoryId', validateCategoryIdParam, getFilterOptions);
router.get('/:id', validateProductId, getProductByid);

// ==================== PUBLIC ROUTES - POST ====================
router.post('/', validateProduct, createProduct);
router.post('/filter/:categoryId', validateCategoryIdParam, getFilteredProducts);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin/limited-details', authorize('super_admin', 'admin', 'manager'), getAllProductLimitedDetilas);
router.get('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateProductId, getAllDetialsProductById);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin'), validateProduct, updateProduct);
router.put('/:id/soft-delete', authorize('super_admin', 'admin'), validateCategoryIdParam, softDeleteProduct);
router.put('/:id/restore', authorize('super_admin', 'admin'), validateCategoryIdParam, restoreProduct);

// ==================== PROTECTED ROUTES - POST ====================
router.post('/:id/attributes', authorize('super_admin', 'admin'), validateCategoryIdParam, validateCreateProductAttribute, createProductAttribute);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/delete/:id', authorize('super_admin', 'admin'), validateProductId, deleteProduct);
router.delete('/:id/attributes/:attributeId', authorize('super_admin', 'admin'), validateProductAttributeParams, removeProductAttribute);

export default router;