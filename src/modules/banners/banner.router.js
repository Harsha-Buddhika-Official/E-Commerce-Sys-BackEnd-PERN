import express from 'express';
import { createBanner, deleteBanner, getAllBanners, getBannerById, updateBanner, getBannerImages,getBannerVideo } from './banner.controller.js';
import { validateCreateBanner, validateIdParam, validateUpdateBanner } from './banner.validator.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

router.get('/public/images', getBannerImages);
router.get('/public/video', getBannerVideo);

router.use(authMiddleware);

// GET
router.get('/admin',  authorize('super_admin', 'admin', 'manager'), getAllBanners);
router.get('/:id', authorize('super_admin', 'admin', 'manager'), validateIdParam, getBannerById);

// POST
router.post('/admin', authorize('super_admin', 'admin', 'manager'), upload.single('media'), createBanner);

// PUT
// router.put('/admin/:id', authorize('super_admin', 'admin', 'manager'), upload.single('media'), validateIdParam, validateUpdateBanner, updateBanner);

// DELETE
router.delete('/admin/:id', authorize('super_admin', 'admin'), validateIdParam, deleteBanner);

export default router;