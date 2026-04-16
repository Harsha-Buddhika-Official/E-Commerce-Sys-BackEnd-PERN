import * as adminRepository from './admin.repository.js';
import { hashPassword, comparePasswords } from '../../utils/hash.js';
import { generateToken } from '../../utils/jwt.js';

export const createAdmin = async (AdminData) => {
    if (!AdminData.fullname || !AdminData.email || !AdminData.password) {
        throw new Error('All fields are required');
    }
    if(!AdminData.role){
        AdminData.role = 'manager';
    }
    const exsitingAdmin = await adminRepository.getAdminByEmail(AdminData.email);
    if (exsitingAdmin) {
        throw new Error('Admin with this email already exists');
    }
    AdminData.password = await hashPassword(AdminData.password);
    return await adminRepository.createAdmin(AdminData);
}

export const loginAdmin = async (AdminData) => {
    const { email, password } = AdminData;
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    const emailCheck = await adminRepository.getAdminByEmail(email);
    if (!emailCheck) {
        throw new Error('credentials are incorrect');
    }
    const passwordMatch = await comparePasswords(password, emailCheck.password_hash);
    if (!passwordMatch) {
        throw new Error('credentials are incorrect');
    }
    await adminRepository.updateLastLogin(emailCheck.admin_id);
    const token = generateToken({ adminId: emailCheck.admin_id, role: emailCheck.role });
    return { token };
}

export const getAdminByEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
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
        throw new Error('Admin ID and new role are required');
    }
    await adminRepository.updateUpdatedAt(AdminData.adminId);
    return await adminRepository.updateAdminRole(AdminData);
}

export const deleteAdmin = async (adminEmail) => {
    if (!adminEmail) {
        throw new Error('Admin email is required');
    }
    const admin = await adminRepository.getAdminByEmail(adminEmail);
    if (!admin) {
        throw new Error('Admin not found');
    }
    return await adminRepository.deleteAdmin(admin.admin_id);
}

export const updateAdminPassword = async (AdminData) => {
    if (!AdminData.adminId || !AdminData.newPassword) {
        throw new Error('Admin ID and new password are required');
    }
    if(AdminData.newPassword !== AdminData.confirmPassword){
        throw new Error('new password and confirm password do not match');
    }
    const admin = await adminRepository.getAdminById(AdminData.adminId);
    const passwordMatch = await comparePasswords(AdminData.newPassword, admin.password_hash);
    const oldPasswordMatch = await comparePasswords(AdminData.oldPassword, admin.password_hash);
    if(!oldPasswordMatch){
        throw new Error('old password is incorrect');
    }
    if (passwordMatch) {
        throw new Error('New password cannot be the same as the old password');
    }
    AdminData.newPassword = await hashPassword(AdminData.newPassword);
    return await adminRepository.updateAdminPassword(AdminData);
}
