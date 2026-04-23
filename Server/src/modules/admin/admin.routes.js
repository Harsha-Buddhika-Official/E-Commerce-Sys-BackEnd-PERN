import { createAdmin, loginAdmin, getAllAdmins, updateAdminRole, deleteAdmin, updateAdminPassword } from './admin.controller.js';
import express from 'express';
import { validateRegister, validateLogin } from './admin.validator.js';
import { authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', authorize('super_admin'), validateRegister, createAdmin);
router.post('/login', authorize('super_admin', 'admin', 'manager'), validateLogin, loginAdmin);
router.get('/', authorize('super_admin', 'admin'), getAllAdmins);
router.put('/updateRole', authorize('super_admin'), updateAdminRole);
router.delete('/delete', authorize('super_admin'), deleteAdmin);
router.put('/updatePassword', authorize('super_admin', 'admin', 'manager'), updateAdminPassword);

export default router;