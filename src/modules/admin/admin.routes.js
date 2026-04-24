import { createAdmin, loginAdmin, getAllAdmins, updateAdminRole, deleteAdmin, updateAdminPassword } from './admin.controller.js';
import express from 'express';
import { validateRegister, validateLogin } from './admin.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// Public route for admin login
router.post('/login', validateLogin, loginAdmin);

// Protected routes for admin management
router.use(authMiddleware);

// protected routes for admin management
router.post('/register', authorize('super_admin'), validateRegister, createAdmin);
router.get('/', authorize('super_admin', 'admin'), getAllAdmins);
router.put('/updateRole', authorize('super_admin'), updateAdminRole);
router.delete('/delete', authorize('super_admin'), deleteAdmin);
router.put('/updatePassword', authorize('super_admin', 'admin', 'manager'), updateAdminPassword);

export default router;