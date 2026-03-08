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
})

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