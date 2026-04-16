import * as adminService from './admin.service.js';

export const createAdmin = async (req, res) => {
    try {
        const adminData = req.body;
        const newAdmin = await adminService.createAdmin(adminData);
        const { password_hash, ...safeAdmin } = newAdmin;
        res.status(201).json(safeAdmin);
    } catch (error) {
        res.status(400).json({ 
            message: error.message
         });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const adminData = req.body;
        const { token, admin } = await adminService.loginAdmin(adminData);
        res.status(200).json({ token });
    } catch (error) {
        res.status(401).json({ 
            message: error.message
         });
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        const admins = await adminService.getAllAdmins();
        res.status(200).json(admins);
    } catch (error) {
        res.status(400).json({ 
            message: error.message
         });
    }
};

export const updateAdminRole = async (req, res) => {
    try {
        const adminData = req.body;
        const updatedAdmin = await adminService.updateAdminRole(adminData);
        const { password_hash, ...safeAdmin } = updatedAdmin;
        res.status(200).json(safeAdmin);
    } catch (error) {
        res.status(400).json({ 
            message: error.message
         });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        const deletedAdmin = await adminService.deleteAdmin(email);
        const { password_hash, ...safeAdmin } = deletedAdmin;
        res.status(200).json(safeAdmin);
    } catch (error) {
        res.status(400).json({ 
            message: error.message
         });
    }
};

export const updateAdminPassword = async (req, res) => {
    try {
        const adminData = req.body;
        const updatedAdmin = await adminService.updateAdminPassword(adminData);
        const { password_hash, ...safeAdmin } = updatedAdmin;
        res.status(200).json(safeAdmin);
    } catch (error) {
        res.status(400).json({ 
            message: error.message
         });
    }
};

// export const getAdminByEmail = async (req, res) => {
//     try {
//         const { email } = req.body;
//         const admin = await adminService.getAdminByEmail(email);
//         res.status(200).json(admin);
//     } catch (error) {
//         res.status(404).json({ 
//             message: error.message
//          });
//     }  
// };