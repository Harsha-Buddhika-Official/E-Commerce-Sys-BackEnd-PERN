import { createAdmin, loginAdmin, getAllAdmins,updateAdminRole,deleteAdmin,updateAdminPassword} from './admin.controller.js';
import express from 'express';
import {validateRegister, validateLogin} from './admin.validator.js';

const router = express.Router();

router.post('/register', validateRegister, createAdmin);
router.post('/login', validateLogin, loginAdmin);
router.get('/', getAllAdmins);
router.put('/updateRole', updateAdminRole);
router.delete('/delete', deleteAdmin);
router.put('/updatePassword', updateAdminPassword);

export default router;