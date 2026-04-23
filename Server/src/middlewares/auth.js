import { verifyToken } from "../utils/jwt.js";
import AppError from "../utils/AppError.js";

export const authMiddleware = (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return next(new AppError('Authorization header missing or malformed', 401));
    }
    const token = auth.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        req.admin = decoded; 
        next();
    } catch (err) {
        return next(new AppError('Invalid or expired token', 401));
    }
}