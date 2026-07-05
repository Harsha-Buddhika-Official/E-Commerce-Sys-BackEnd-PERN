import Joi from 'joi';

const CreateCategory = Joi.object({
    name: Joi.string().
        trim().
        min(2).
        max(100).
        required().
        messages({
            "string.empty": "Category name is required",
            "string.min": "Category name must be at least 2 characters long",
            "string.max": "Category name cannot exceed 100 characters"
        }),

    category_type: Joi.string().
        valid("product", "accessory").
        required().
        messages({
            "any.only": "Category type must be either 'product' or 'accessory'",
            "string.empty": "Category type is required"
        })
});

const GetCategory = Joi.object({
    type: Joi.string().
        valid("product", "accessory").
        optional().
        messages({
            "any.only": "Category type must be either 'product' or 'accessory'"
        })
});

const CategoryId = Joi.object({
    id: Joi.number().
        integer().
        positive().
        required().
        messages({
            "number.base": "Category ID must be a number",
            "number.integer": "Category ID must be an integer",
            "number.positive": "Category ID must be a positive number",
            "any.required": "Category ID is required"
        })
});


export const validateCreateCategory = (req, res, next) => {
    const { error, value } = CreateCategory.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

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

export const validateGetCategory = (req, res, next) => {
    const { error, value } = GetCategory.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    req.query = value;

    next();
};

export const validateCategoryIdParam = (req, res, next) => {
    const { error, value } = CategoryId.validate(req.params, {
        abortEarly: false
    });

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