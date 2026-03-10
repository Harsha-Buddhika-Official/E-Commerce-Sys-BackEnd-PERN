import joi from 'joi';

// Validation schema for creating a category
const createCategorySchema = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Category name is required",
            "string.min": "Category name must be at least 2 characters",
            "string.max": "Category name must not exceed 100 characters"
        }),

    category_type: joi.string()
        .trim()
        .valid("product", "accessory")
        .required()
        .messages({
            "any.only": "Invalid category type",
            "any.required": "Category type is required"
        })
});

// Validation schema for updating a category
const updateCategorySchema = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Category name is required",
            "string.min": "Category name must be at least 2 characters",
            "string.max": "Category name must not exceed 100 characters"
        }),
    img_url: joi.string()
        .uri()
        .optional()
        .messages({
            "string.uri": "Image URL must be a valid URI"
        })
});

// Validation schema for getting categories with optional type query parameter
const getCategorysSchema = joi.object({
    type: joi.string()
        .valid("product", "accessory")
        .optional()
})

// Validation schema for validating category ID in params
const idParamSchema = joi.object({
    id: joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "ID must be a number",
            "number.integer": "ID must be an integer",
            "number.positive": "ID must be positive"
        })
})

//middleware to validate create category request
export const validateCreateCategory = (req, res, next) => {
    const { error, value } = createCategorySchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        })
    }
    req.body = value;
    next();
};

//middleware to validate update category request
export const validateUpdateCategory = (req, res, next) => {
    const { error, value } = updateCategorySchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        })
    }
    req.body = value;
    next();
}

//middleware to validate get categories request
export const validateGetCategorySchema = (req, res, next) => {
    const { error, value } = getCategorysSchema.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        })
    }
    req.query = value;
    next();
}

//middleware to validate category ID in params
export const validateCategoryIdParam = (req, res, next) => {
    const { error, value } = idParamSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        })
    }
    req.params = value;
    next();
}