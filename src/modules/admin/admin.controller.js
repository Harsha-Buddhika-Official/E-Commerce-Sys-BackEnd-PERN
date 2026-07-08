import * as adminService from './admin.service.js';

//using
export const createAdmin = async (req, res, next) => {
    try {
        const newAdmin = await adminService.createAdmin(req.body);
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: newAdmin
        });
    } catch (error) {
        next(error);
    }
};

//using
export const loginAdmin = async (req, res, next) => {
    try {
        const result = await adminService.loginAdmin(req.body);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

//using
export const getAllAdmins = async (req, res, next) => {
    try {
        const admins = await adminService.getAllAdmins();

        res.status(200).json({
            success: true,
            message: 'Admins retrieved successfully',
            data: admins
        });
    } catch (error) {
        next(error);
    }
};

//using
export const updateAdminRole = async (req, res, next) => {
    try {
        const updated = await adminService.updateAdminRole(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: 'Admin role updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

//using
export const deleteAdmin = async (req, res, next) => {
    try {
        // console.log('req.body.id:', req.params);
        const deleted = await adminService.deleteAdmin(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully',
            data: deleted
        });
    } catch (error) {
        next(error);
    }
};

//using
export const updateAdminPassword = async (req, res, next) => {
    try {
        const updated = await adminService.updateAdminPassword(
            req.params.id,
            req.body.passwordData
        );

        res.status(200).json({
            success: true,
            message: 'Admin password updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};