import * as adminRepository from './admin.repository.js';
import { hashPassword, comparePasswords } from '../../utils/hash.js';
import { generateToken } from '../../utils/jwt.js';
import AppError from '../../utils/AppError.js';

export const createAdmin = async (adminData) => {
    if (!adminData.fullname || !adminData.email || !adminData.password) {
        throw new AppError('All fields are required', 400);
    }

    adminData.role = adminData.role || 'manager';

    const existingAdmin = await adminRepository.getAdminByEmail(adminData.email);
    if (existingAdmin) {
        throw new AppError('Admin with this email already exists', 409);
    }

    adminData.password = await hashPassword(adminData.password);

    const created = await adminRepository.createAdmin(adminData);

    // remove password before returning
    const { password_hash, ...safe } = created;
    return safe;
};

export const loginAdmin = async (adminData) => {
    const { email, password } = adminData;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const admin = await adminRepository.getAdminByEmail(email);
    if (!admin) {
        throw new AppError('credentials are incorrect', 401);
    }

    const passwordMatch = await comparePasswords(password, admin.password_hash);
    if (!passwordMatch) {
        throw new AppError('credentials are incorrect', 401);
    }

    await adminRepository.updateLastLogin(admin.admin_id);

    const token = generateToken({
        adminId: admin.admin_id,
        role: admin.role
    });

    const { password_hash, ...safeAdmin } = admin;

    return { token, admin: safeAdmin };
};

export const getAllAdmins = async () => {
    const admins = await adminRepository.getAllAdmins();

    return admins.map(({ password_hash, ...rest }) => rest);
};

export const updateAdminRole = async (adminId, adminData) => {
    if (!adminId || !adminData.newRole) {
        throw new AppError('Admin ID and new role are required', 400);
    }

    await adminRepository.updateUpdatedAt(adminId);

    const updated = await adminRepository.updateAdminRole(adminId, adminData);

    const { password_hash, ...safe } = updated;
    return safe;
};

export const deleteAdmin = async (adminId) => {
    if (!adminId) {
        throw new AppError('Admin ID is required', 400);
    }

    const admin = await adminRepository.getAdminById(adminId);
    if (!admin) {
        throw new AppError('Admin not found', 404);
    }

    await adminRepository.deleteAdmin(adminId);

    const { password_hash, ...safe } = admin;
    return safe;
};

export const updateAdminPassword = async (adminId, adminData) => {
    if (!adminId) throw new AppError('Admin ID is required', 400);

    const { oldPassword, newPassword, confirmPassword } = adminData;

    if (!oldPassword || !newPassword || !confirmPassword) {
        throw new AppError('All password fields are required', 400);
    }

    if (newPassword !== confirmPassword) {
        throw new AppError('Passwords do not match', 422);
    }

    const admin = await adminRepository.getAdminById(adminId);

    const oldMatch = await comparePasswords(oldPassword, admin.password_hash);
    if (!oldMatch) {
        throw new AppError('Old password is incorrect', 401);
    }

    const sameAsOld = await comparePasswords(newPassword, admin.password_hash);
    if (sameAsOld) {
        throw new AppError('New password cannot be same as old password', 409);
    }

    const hashed = await hashPassword(newPassword);

    const updated = await adminRepository.updateAdminPassword(
        { newPassword: hashed },
        adminId
    );

    const { password_hash, ...safe } = updated;
    return safe;
};