import AppError from "../utils/AppError.js";

export const authorize = (...roles) => (req, res, next) => {
    if (!req.admin) {
        return next(new AppError('Unauthorized', 401));
    }
    if (!roles.includes(req.admin.role)) {
        return next(new AppError('Forbidden: Insufficient permissions', 403));
    }
    next();
};

