import express from 'express';
import { createBanner, deleteBanner, getAllBanners, getBannerById, getBannerImages,getBannerVideo } from './banner.controller.js';
import { validateCreateBanner, validateBannerById } from './banner.validator.js';
import { authMiddleware } from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';
import upload from '../../middlewares/multer.js';

const router = express.Router();

router.get('/public/images', getBannerImages); 
router.get('/public/video', getBannerVideo); 

router.use(authMiddleware);

// GET
router.get('/admin',  authorize('super_admin', 'admin', 'manager'), getAllBanners); 
router.get('/admin/:id', authorize('super_admin', 'admin', 'manager'), validateBannerById, getBannerById); 

// POST
router.post('/admin', authorize('super_admin', 'admin'), upload.single('media'), validateCreateBanner, createBanner); 

// DELETE
router.delete('/admin/:id', authorize('super_admin', 'admin'), validateBannerById, deleteBanner); 

export default router;