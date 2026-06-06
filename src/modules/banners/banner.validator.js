import joi from 'joi';

const createBannerSchema = joi.object({
    title: joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
            "string.empty": "Banner title is required",
            "string.min": "Banner title must be at least 2 characters",
            "string.max": "Banner title must not exceed 255 characters"
        }),

    image_url: joi.string()
        .uri()
        .required()
        .messages({
            "string.empty": "Image URL is required",
            "string.uri": "Image URL must be a valid URI"
        }),

    is_active: joi.boolean().optional()
});

const updateBannerSchema = joi.object({
    title: joi.string()
        .trim()
        .min(2)
        .max(255)
        .messages({
            "string.min": "Banner title must be at least 2 characters",
            "string.max": "Banner title must not exceed 255 characters"
        }),

    image_url: joi.string()
        .uri()
        .messages({
            "string.uri": "Image URL must be a valid URI"
        }),

    is_active: joi.boolean()
});

const idParamSchema = joi.object({
    id: joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "ID must be a number",
            "number.positive": "ID must be positive",
            "any.required": "ID is required"
        })
});

export const validateCreateBanner = (req, res, next) => {
    const { error, value } = createBannerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    req.body = value;
    next();
};

export const validateUpdateBanner = (req, res, next) => {
    const { error, value } = updateBannerSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    req.body = value;
    next();
};

export const validateIdParam = (req, res, next) => {
    const { error, value } = idParamSchema.validate(req.params, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    req.params = value;
    next();
};