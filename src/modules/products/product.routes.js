import express from 'express';
import { createProduct, createProductWithoutAttributes, deleteProduct, getAllProducts, getAllProductLimitedDetilas, getAllDetialsProductById, getProductById, getProductByName, updateProduct, updateProductDetails, getBestSellingProducts, getLatestProducts, getProductsByCategory, getFilterOptions, getFilteredProducts, getAllProductsDetailsSimple, addProductImage, removeProductImage, reorderProductImages, } from './product.controller.js';
import { validateProduct, validateFullProductUpdate, validateCategoryIdParam, validateProductAttributeParams, validateFilterProducts, validateProductId, validateProductIdAndImageId } from './product.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/', getAllProducts); //using
router.get('/best-selling', getBestSellingProducts); //using
router.get('/latest', getLatestProducts); //using
router.get('/search/:name', getProductByName); //using
router.get('/category/:categoryId', validateCategoryIdParam, getProductsByCategory); //using
router.get('/filter/options/:categoryId', validateCategoryIdParam, getFilterOptions); //using
router.get('/:id', validateProductId, getProductById); //using

// ==================== PUBLIC ROUTES - POST ====================
router.post('/', upload.array('images', 3), validateProduct, createProduct);
router.post('/filter/:categoryId', validateCategoryIdParam, getFilteredProducts); //using

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin/limited-details', authorize('super_admin', 'admin', 'manager'), getAllProductLimitedDetilas); //using
router.get('/admin/simple-details', authorize('super_admin', 'admin', 'manager'), getAllProductsDetailsSimple); //using
router.get('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateProductId, getAllDetialsProductById); //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin/without-attributes', upload.array('images', 3), validateProduct, createProductWithoutAttributes); //using

// ==================== PROTECTED ROUTES - PUT ====================
// router.put('/:id/soft-delete', authorize('super_admin', 'admin'), validateCategoryIdParam, softDeleteProduct); //waiting list
// router.put('/:id/restore', authorize('super_admin', 'admin'), validateCategoryIdParam, restoreProduct); //waiting list

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/delete/:id', authorize('super_admin', 'admin'), validateProductId, deleteProduct); 

// ==================== PROTECTED ROUTES - UPDATE PRODUCT DETAILS / IMAGES ====================
// 1. Product data update — pure JSON, no images
router.put('/admin/products/:id/full-update', authorize('super_admin', 'admin'), validateProductId, updateProductDetails); //using

// 2. Add images — multipart, 0 to 3 files
router.post('/admin/products/:id/images', upload.array('images', 3), authorize('super_admin', 'admin'), validateProductId, addProductImage); //using

// 3. Remove single image — DB + Cloudinary
router.delete('/admin/products/:id/images/:imageId', authorize('super_admin', 'admin'), validateProductIdAndImageId, removeProductImage); //using

// 4. Reorder / set primary — pure JSON
router.patch('/admin/products/:id/images/reorder', authorize('super_admin', 'admin'), validateProductId, reorderProductImages); //using

export default router;