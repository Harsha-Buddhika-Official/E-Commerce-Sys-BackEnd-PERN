import { createAdmin, loginAdmin, getAllAdmins, updateAdminRole, deleteAdmin, updateAdminPassword } from './admin.controller.js';
import express from 'express';
import { validateRegister, validateLogin, validateUpdateAdminRole, validateUpdatePassword, validateDeleteAdmin } from './admin.validator.js';
import { authorize } from '../../middlewares/authorize.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES - POST ====================
router.post('/login', validateLogin, loginAdmin); //using

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);

// ==================== PROTECTED ROUTES - GET ====================
router.get('/', authorize('super_admin'), getAllAdmins); //using

// ==================== PROTECTED ROUTES - POST ====================
router.post('/register', authorize('super_admin'), validateRegister, createAdmin); //using

// ==================== PROTECTED ROUTES - PUT ====================
router.put('/updateRole/:id', authorize('super_admin'), validateUpdateAdminRole, updateAdminRole); //using
router.put('/settings/updatePassword/:id', authorize('super_admin', 'admin', 'manager'), validateUpdatePassword, updateAdminPassword); //using

// ==================== PROTECTED ROUTES - DELETE ====================
router.delete('/delete/:id', authorize('super_admin'), validateDeleteAdmin, deleteAdmin); //using

export default router;