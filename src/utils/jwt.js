import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const generateToken = (payload) => {
    const expiresIn = Math.floor(Date.now() / 1000) + 60*60; // Login time + 1 hour
    return jwt.sign({ ...payload, exp: expiresIn }, config.jwtSecret);
    // return jwt.sign(payload, config.jwtSecret,
    // { expiresIn: '1h' });
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (err) {
        throw new Error('Invalid token', { cause: err });
    }
}