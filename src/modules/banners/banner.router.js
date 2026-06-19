import express from 'express';
import { createBanner, deleteBanner, getAllBanners, getBannerById, getBannerImages,getBannerVideo } from './banner.controller.js';
import { validateCreateBanner, validateIdParam, validateUpdateBanner } from './banner.validator.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

router.get('/public/images', getBannerImages); //using
router.get('/public/video', getBannerVideo); //using

router.use(authMiddleware);

// GET
router.get('/admin',  authorize('super_admin', 'admin', 'manager'), getAllBanners); //using
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateIdParam, getBannerById); //using

// POST
router.post('/admin', authorize('super_admin', 'admin'), upload.single('media'), createBanner); //using

// DELETE
router.delete('/admin/:id', authorize('super_admin', 'admin'), validateIdParam, deleteBanner); //using

export default router;