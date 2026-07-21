import express from 'express';
import { addOfferProduct, createOffer, deleteOffer, getAllOffers, getOfferByIdAdmin, getOfferByIdUser, getOfferProducts, updateOffer, updateOfferStatus, getOffers, getActiveOffers, getUpcomingOffers } from './offers.controller.js';
import { validateCreateOffer, validateOfferIdParam, validateOfferProductBody, validateOfferStatusBody, validateProductIdParam, validateUpdateOffer } from './offers.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

// USER ROUTES
// ==================== PUBLIC ROUTES - GET ====================
router.get('/user', getAllOffers); //check again if this route is needed or not
router.get("/", getOffers);  
router.get('/user/:id', validateOfferIdParam, getOfferByIdUser); 
router.get('/user/:id/products', validateOfferIdParam, getOfferProducts); 
router.get('/active', getActiveOffers); 
router.get('/upcoming', getUpcomingOffers); 

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

//ADMIN ROUTES
// ==================== PROTECTED ROUTES - GET ====================
router.get('/admin', authorize('super_admin', 'admin', 'manager'), getAllOffers); 
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, getOfferByIdAdmin); 

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin/', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateCreateOffer, createOffer); 
router.post('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferProductBody, addOfferProduct); 

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/:id', authorize('super_admin', 'admin', 'manager'), upload.single('banner_image'), validateOfferIdParam, validateUpdateOffer, updateOffer); 
router.put('/admin/:id/toggle', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferStatusBody, updateOfferStatus); 

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, deleteOffer); 

export default router;
