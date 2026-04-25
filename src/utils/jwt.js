import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const generateToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret,
        { expiresIn: '1h' });
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (err) {
        throw new Error('Invalid token', { cause: err });
    }
}