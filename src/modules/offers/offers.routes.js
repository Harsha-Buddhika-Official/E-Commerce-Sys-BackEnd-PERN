import express from 'express';
import { addOfferProduct, createOffer, deleteOffer, getAllOffers, getOfferByIdAdmin, getOfferByIdUser, getOfferProducts, removeOfferProduct, updateOffer, updateOfferStatus, getOffers } from './offers.controller.js';
import { validateCreateOffer, validateOfferIdParam, validateOfferProductBody, validateOfferStatusBody, validateProductIdParam, validateUpdateOffer } from './offers.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';


const router = express.Router();

// USER ROUTES
// ==================== PUBLIC ROUTES - GET ====================
router.get('/user', getAllOffers); //not using need to remove
router.get("/", getOffers); //working //using
router.get('/user/:id', validateOfferIdParam, getOfferByIdUser);
router.get('/user/:id/products', validateOfferIdParam, getOfferProducts);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

//ADMIN ROUTES
// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin', 'manager'),getAllOffers); //working //using
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, getOfferByIdAdmin); //working //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin/', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateCreateOffer, createOffer); //working // using
router.post('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferProductBody, addOfferProduct); //working //using

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/:id', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateOfferIdParam, validateUpdateOffer, updateOffer); //working //using
router.put('/admin/:id/toggle', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferStatusBody, updateOfferStatus); // working

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, deleteOffer); //working //using

export default router;
