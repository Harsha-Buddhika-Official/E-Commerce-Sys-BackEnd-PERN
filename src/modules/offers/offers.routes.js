import express from 'express';
import { addOfferProduct, createOffer, deleteOffer, getActiveOffers, getAllOffers, getOfferByIdAdmin, getOfferByIdUser, getOfferProducts, getUpcomingOffers, removeOfferProduct, updateOffer, updateOfferStatus } from './offers.controller.js';
import { validateCreateOffer, validateOfferIdParam, validateOfferProductBody, validateOfferStatusBody, validateProductIdParam, validateUpdateOffer } from './offers.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';


const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/', getAllOffers);
router.get('/active', getActiveOffers);
router.get('/upcoming', getUpcomingOffers);
router.get('/user/:id', validateOfferIdParam, getOfferByIdUser);
router.get('/user/:id/products', validateOfferIdParam, getOfferProducts);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin', 'manager'),getAllOffers); //working //using
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, getOfferByIdAdmin); //working //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin/', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateCreateOffer, createOffer); //working // using
router.post('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferProductBody, addOfferProduct); //working //using

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/:id', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateOfferIdParam, validateUpdateOffer, updateOffer); //working //using
router.put('/admin/activation/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferStatusBody, updateOfferStatus);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, deleteOffer); //working //using
router.delete('/:id/products/:productId', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateProductIdParam, removeOfferProduct);

export default router;
