import express from 'express';
import { addOfferProduct, createOffer, deleteOffer, getAllOffers, getOfferByIdAdmin, getOfferByIdUser, getOfferProducts, updateOffer, updateOfferStatus, getOffers, getActiveOffers, getUpcomingOffers } from './offers.controller.js';
import { validateCreateOffer, validateOfferIdParam, validateOfferProductBody, validateOfferStatusBody, validateProductIdParam, validateUpdateOffer } from './offers.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';


const router = express.Router();

// USER ROUTES
// ==================== PUBLIC ROUTES - GET ====================
router.get('/user', getAllOffers); 
router.get("/", getOffers);  //using
router.get('/user/:id', validateOfferIdParam, getOfferByIdUser); //using
router.get('/user/:id/products', validateOfferIdParam, getOfferProducts); //using
router.get('/active', getActiveOffers); //using
router.get('/upcoming', getUpcomingOffers); //using

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

//ADMIN ROUTES
// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin', 'manager'), getAllOffers); //using
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, getOfferByIdAdmin); //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin/', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateCreateOffer, createOffer); //using
router.post('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferProductBody, addOfferProduct); //using

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/:id', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateOfferIdParam, validateUpdateOffer, updateOffer); //using
router.put('/admin/:id/toggle', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferStatusBody, updateOfferStatus); //using

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, deleteOffer); //using

export default router;
