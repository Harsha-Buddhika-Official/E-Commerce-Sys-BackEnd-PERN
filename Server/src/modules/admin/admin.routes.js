import { createAdmin, loginAdmin, getAllAdmins,updateAdminRole,deleteAdmin,updateAdminPassword} from './admin.controller.js';
import express from 'express';

const router = express.Router();

router.post('/register', createAdmin);
router.post('/login', loginAdmin);
router.get('/', getAllAdmins);
router.put('/updateRole', updateAdminRole);
router.delete('/delete', deleteAdmin);
router.put('/updatePassword', updateAdminPassword);

export default router;