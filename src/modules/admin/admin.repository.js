import pool from '../../config/db.js';

export const createAdmin = async (AdminData) => {
    const { fullname, email, password, role } = AdminData;
    const query = 'INSERT INTO admins (full_name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *';
    const { rows } = await pool.query(query, [fullname, email, password, role]);
    return rows[0];
}

export const getAdminByEmail = async (email) => {
    const query = 'SELECT * FROM admins WHERE email = $1 LIMIT 1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
}

export const getAllAdmins = async () => {
    const query = 'SELECT * FROM admins';
    const { rows } = await pool.query(query);
    return rows;
}

export const updateAdminRole = async (AdminData) => {
    const { adminId, newRole } = AdminData;
    const query = 'UPDATE admins SET role = $1 WHERE admin_id = $2 RETURNING *';
    const { rows } = await pool.query(query, [newRole, adminId]);
    return rows[0];
}

export const deleteAdmin = async (adminId) => {
    const query = 'DELETE FROM admins WHERE admin_id = $1 RETURNING *';
    const { rows } = await pool.query(query, [adminId]);
    return rows[0];
}

export const getAdminById = async (adminId) => {
    const query = 'SELECT * FROM admins WHERE admin_id = $1 LIMIT 1';
    const { rows } = await pool.query(query, [adminId]);
    return rows[0];
}

export const updateAdminPassword = async (AdminData) => {
    const { adminId, newPassword } = AdminData;
    const query = 'UPDATE admins SET password_hash = $1 WHERE admin_id = $2 RETURNING *';
    const { rows } = await pool.query(query, [newPassword, adminId]);
    return rows[0];
}

export const updateLastLogin = async (adminId) => {
    const query = 'UPDATE admins SET last_login = NOW() WHERE admin_id = $1 RETURNING *';
    const { rows } = await pool.query(query, [adminId]);
    return rows[0];
}

export const updateUpdatedAt = async (adminId) => {
    const query = 'UPDATE admins SET updated_at = NOW() WHERE admin_id = $1 RETURNING *';
    const { rows } = await pool.query(query, [adminId]);
    return rows[0];
}