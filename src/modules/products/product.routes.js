import express from 'express';
import { createProduct, createProductWithoutAttributes, deleteProduct, getAllProducts, getAllProductLimitedDetilas, getAllDetialsProductById, getProductByid, getProductByName, removeProductAttribute, restoreProduct, softDeleteProduct, updateProduct, updateProductDetails, getAttributesByCategory, getBestSellingProducts, getLatestProducts, getProductsByCategory, getFilterOptions, getFilteredProducts, getAllProductsDetailsSimple, addProductImage, removeProductImage, reorderProductImages, } from './product.controller.js';
import { validateProduct, validateFullProductUpdate, validateCategoryIdParam, validateProductAttributeParams, validateFilterProducts, validateProductId } from './product.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';

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
router.post('/', upload.array('images', 3), validateProduct, createProduct);
router.post('/admin/without-attributes', upload.array('images', 3), validateProduct, createProductWithoutAttributes); //using //working
router.post('/filter/:categoryId', validateCategoryIdParam, getFilteredProducts);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin/limited-details', authorize('super_admin', 'admin', 'manager'), getAllProductLimitedDetilas); //using //working
router.get('/admin/simple-details', authorize('super_admin', 'admin', 'manager'), getAllProductsDetailsSimple); //using //working
router.get('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateProductId, getAllDetialsProductById);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/:id', authorize('super_admin', 'admin'), validateProduct, updateProduct);
router.put('/:id/soft-delete', authorize('super_admin', 'admin'), validateCategoryIdParam, softDeleteProduct);
router.put('/:id/restore', authorize('super_admin', 'admin'), validateCategoryIdParam, restoreProduct);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/delete/:id', authorize('super_admin', 'admin'), validateProductId, deleteProduct); //using //working
router.delete('/:id/attributes/:attributeId', authorize('super_admin', 'admin'), validateProductAttributeParams, removeProductAttribute);


// ==================== PROTECTED ROUTES - UPDATE PRODUCT DETAILS / IMAGES ====================
// 1. Product data update — pure JSON, no images
router.put('/admin/products/:id/full-update', authorize('super_admin', 'admin'), validateProductId, updateProductDetails); //using //working

// 2. Add images — multipart, 0 to 3 files
router.post('/admin/products/:id/images', upload.array('images', 3), authorize('super_admin', 'admin'), validateProductId, addProductImage); //using // working

// 3. Remove single image — DB + Cloudinary
router.delete('/admin/products/:id/images/:imageId', authorize('super_admin', 'admin'), validateProductId, removeProductImage); //using //working

// 4. Reorder / set primary — pure JSON
router.patch('/admin/products/:id/images/reorder', authorize('super_admin', 'admin'), validateProductId, reorderProductImages); //using //working

export default router;