import Joi from 'joi';

const registerSchema = Joi.object({
    fullname: Joi.string().
        min(3).
        required().
        messages({
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 3 characters long"
        }),

    email: Joi.string().
        email().
        required().
        messages({
            "string.empty": "Email is required",
            "string.email": "Email must be a valid email address"
        }),
    password: Joi.string().
        min(6).
        required().
        messages({
            "string.empty": "Password is required",
            "string.min": "Password must be at least 6 characters long"
        })
});

const loginSchema = Joi.object({
    email: Joi.string().
        email().
        required().
        messages({
            "string.empty": "Email is required",
            "string.email": "Email must be a valid email address"
        }),
    password: Joi.string().
        required().
        messages({
            "string.empty": "Password is required"
        })
});

export const validateRegister = (req, res, next) => {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }
    req.body = value;
    next();
};

export const validateLogin = (req, res, next) => {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }
    req.body = value;
    next();
};