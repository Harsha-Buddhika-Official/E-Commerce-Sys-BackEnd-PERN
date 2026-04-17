import * as adminRepository from './admin.repository.js';
import { hashPassword, comparePasswords } from '../../utils/hash.js';
import { generateToken } from '../../utils/jwt.js';
import AppError from '../../utils/AppError.js';

export const createAdmin = async (AdminData) => {
    if (!AdminData.fullname || !AdminData.email || !AdminData.password) {
        throw new AppError('All fields are required', 400);
    }
    if(!AdminData.role){
        AdminData.role = 'manager';
    }
    const exsitingAdmin = await adminRepository.getAdminByEmail(AdminData.email);
    if (exsitingAdmin) {
        throw new AppError('Admin with this email already exists', 400);
    }
    AdminData.password = await hashPassword(AdminData.password);
    return await adminRepository.createAdmin(AdminData);
}

export const loginAdmin = async (AdminData) => {
    const { email, password } = AdminData;
    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }
    const emailCheck = await adminRepository.getAdminByEmail(email);
    if (!emailCheck) {
        throw new AppError('credentials are incorrect', 401);
    }
    const passwordMatch = await comparePasswords(password, emailCheck.password_hash);
    if (!passwordMatch) {
        throw new AppError('credentials are incorrect', 401);
    }
    await adminRepository.updateLastLogin(emailCheck.admin_id);
    const token = generateToken({ adminId: emailCheck.admin_id, role: emailCheck.role });
    return { token };
}

export const getAdminByEmail = async (email) => {
    if (!email) {
        throw new AppError('Email is required', 400);
    }
    return await adminRepository.getAdminByEmail(email);
}

export const getAllAdmins = async () => {
    const admins = await adminRepository.getAllAdmins();
    return admins.map(admin => {
        const { password_hash, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
    });
}

export const updateAdminRole = async (AdminData) => {
    if (!AdminData.adminId || !AdminData.newRole) {
        throw new AppError('Admin ID and new role are required', 400);
    }
    await adminRepository.updateUpdatedAt(AdminData.adminId);
    return await adminRepository.updateAdminRole(AdminData);
}

export const deleteAdmin = async (adminEmail) => {
    if (!adminEmail) {
        throw new AppError('Admin email is required', 400);
    }
    const admin = await adminRepository.getAdminByEmail(adminEmail);
    if (!admin) {
        throw new AppError('Admin not found', 404);
    }
    return await adminRepository.deleteAdmin(admin.admin_id);
}

export const updateAdminPassword = async (AdminData) => {
    if (!AdminData.adminId || !AdminData.newPassword) {
        throw new AppError('Admin ID and new password are required', 400);
    }
    if(AdminData.newPassword !== AdminData.confirmPassword){
        throw new AppError('new password and confirm password do not match', 400);
    }
    const admin = await adminRepository.getAdminById(AdminData.adminId);
    const passwordMatch = await comparePasswords(AdminData.newPassword, admin.password_hash);
    const oldPasswordMatch = await comparePasswords(AdminData.oldPassword, admin.password_hash);
    if(!oldPasswordMatch){
        throw new AppError('old password is incorrect', 400);
    }
    if (passwordMatch) {
        throw new AppError('New password cannot be the same as the old password', 400);
    }
    AdminData.newPassword = await hashPassword(AdminData.newPassword);
    return await adminRepository.updateAdminPassword(AdminData);
}
