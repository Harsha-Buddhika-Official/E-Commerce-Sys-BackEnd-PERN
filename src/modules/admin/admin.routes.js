import { createAdmin, loginAdmin, getAllAdmins, updateAdminRole, deleteAdmin, updateAdminPassword } from './admin.controller.js';
import express from 'express';
import { validateRegister, validateLogin } from './admin.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - POST ====================
router.post('/login', validateLogin, loginAdmin);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/', authorize('super_admin', 'admin'), getAllAdmins);

// ==================== PROTECTED ROUTES - POST ====================
router.post('/register', authorize('super_admin'), validateRegister, createAdmin);

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/updateRole/:id', authorize('super_admin'), updateAdminRole);
router.put('/settings/updatePassword/:id', authorize('super_admin', 'admin', 'manager'), updateAdminPassword);

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/delete', authorize('super_admin'), deleteAdmin);

export default router;