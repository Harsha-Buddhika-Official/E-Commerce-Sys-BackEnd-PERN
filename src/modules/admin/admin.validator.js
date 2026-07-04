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
        }),

    role: Joi.string().
        valid('super_admin', 'admin', 'manager').
        messages({
            "any.only": "Role must be either 'super_admin', 'admin', or 'manager'"
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

const UpdateAdminRoleSchema = Joi.object({
    body: Joi.object({
        newRole: Joi.string().
            valid('super_admin', 'admin', 'manager').
            required().
            messages({
                "any.only": "Role must be either 'super_admin', 'admin', or 'manager'",
                "string.empty": "Role is required"
            })
    }),

    params: Joi.object({
        id: Joi.string().
            required().
            messages({
                "string.empty": "Admin ID is required"
            })
    })
});

const UpdatePasswordSchema = Joi.object({
    body: Joi.object({
        passwordData: Joi.object({
            confirmPassword: Joi.string().
                min(6).
                required().
                messages({
                    "string.empty": "Confirm password is required",
                    "string.min": "Confirm password must be at least 6 characters long"
                }),
            newPassword: Joi.string().
                min(6).
                required().
                messages({
                    "string.empty": "New password is required",
                    "string.min": "New password must be at least 6 characters long"
                }),
            oldPassword: Joi.string().
                min(6).
                required().
                messages({
                    "string.empty": "Old password is required",
                    "string.min": "Old password must be at least 6 characters long"
                })
        })
    }),

    params: Joi.object({
        id: Joi.string().
            required().
            messages({
                "string.empty": "Admin ID is required"
            })
    })
});

const deleteAdminSchema = Joi.object({
    id: Joi.string().
        required().
        messages({
            "string.empty": "Admin ID is required"
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

export const validateUpdateAdminRole = (req, res, next) => {
    const { error, value } = UpdateAdminRoleSchema.validate({
        body: req.body,
        params: req.params
    }, {
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }

    req.body = value.body;
    req.params = value.params;

    next();
};

export const validateUpdatePassword = (req, res, next) => {
    const { error,value} = UpdatePasswordSchema.validate({
        body: req.body,
        params: req.params
    }, {
        abortEarly: false
    });
    
    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }

    req.body = value.body;
    req.params = value.params;

    next();
}

export const validateDeleteAdmin = (req, res, next) => {
    console.log('req.params:', req.params);
    const { error, value } = deleteAdminSchema.validate(req.params, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    req.params = value;
    next();
};  