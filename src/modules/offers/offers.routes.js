import express from 'express';
import { addOfferProduct, createOffer, deleteOffer, getActiveOffers, getAllOffers, getOfferById, getOfferProducts, removeOfferProduct, updateOffer } from './offers.controller.js';
import { validateCreateOffer, validateOfferIdParam, validateOfferProductBody, validateProductIdParam, validateUpdateOffer } from './offers.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - GET ====================
router.get('/', getAllOffers);
router.get('/active', getActiveOffers);
router.get('/:id', validateOfferIdParam, getOfferById);
router.get('/:id/products', validateOfferIdParam, getOfferProducts);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - POST ====================
router.post('/admin/', authorize('super_admin', 'admin', 'manager'), validateCreateOffer, createOffer);
router.post('/admin/products/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateOfferProductBody, addOfferProduct);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateUpdateOffer, updateOffer);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, deleteOffer);
router.delete('/admin/:id/products/:productId', authorize('super_admin', 'admin', 'manager'), validateOfferIdParam, validateProductIdParam, removeOfferProduct);

export default router;
