import joi from 'joi';

// Validation schema for creating a brand
const createBrandSchema = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            "string.empty": "Brand name is required",
            "string.min": "Brand name must be at least 2 characters",
            "string.max": "Brand name must not exceed 100 characters"
        }),

    logo_url: joi.string()
        .uri()
        .optional()
        .messages({
            "string.uri": "Logo URL must be a valid URI"
        })
});

const updateBrandSchema = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .messages({
            "string.empty": "Brand name is required",
            "string.min": "Brand name must be at least 2 characters",
            "string.max": "Brand name must not exceed 100 characters"
        }),
    logo_url: joi.string()
        .uri()
        .optional()
});

const idParamSchema = joi.object({
    id: joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "ID must be a number",
            "number.integer": "ID must be an integer",
            "number.positive": "ID must be positive"
        })
});

//middleware to validate create brand request
export const validateCreateBrand = (req, res, next) => {
    const { error, value } = createBrandSchema.validate(req.body, { abortEarly: false });
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

//middleware to validate update brand request
export const validateUpdateBrand = (req, res, next) => {
    const { error, value } = updateBrandSchema.validate(req.body, { abortEarly: false });
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

//middleware to validate id param
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