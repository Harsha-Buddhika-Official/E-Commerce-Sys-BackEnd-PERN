import joi from 'joi';

// Validation schema for creating a product
const productSchema = joi.object({
    name: joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 3 characters',
            'string.max': 'Name must be at most 255 characters',
            'any.required': 'Name is required'
        }),
    brand_name: joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.base': 'Brand name must be a string',
            'string.empty': 'Brand name is required',
            'string.min': 'Brand name must be at least 2 characters',
            'string.max': 'Brand name must be at most 100 characters',
            'any.required': 'Brand name is required'
        }),
    category_name: joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.base': 'Category name must be a string',
            'string.empty': 'Category name is required',
            'string.min': 'Category name must be at least 2 characters',
            'string.max': 'Category name must be at most 100 characters',
            'any.required': 'Category name is required'
        }),
    description: joi.string()
        .max(1000)
        .allow(null, '')
        .messages({
            'string.base': 'Description must be a string',
            'string.max': 'Description must be at most 1000 characters'
        }),
    base_price: joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Base price must be a number',
            'number.positive': 'Base price must be a positive number',
            'any.required': 'Base price is required'
        }),
    selling_price: joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Selling price must be a number',
            'number.positive': 'Selling price must be a positive number',
            'any.required': 'Selling price is required'
        }),
    stock_quantity: joi.number()
        .integer()
        .min(0)
        .messages({
            'number.base': 'Stock quantity must be a number',
            'number.integer': 'Stock quantity must be an integer',
            'number.min': 'Stock quantity cannot be negative'
        }),
    warranty_months: joi.number()
        .integer()
        .min(0)
        .allow(null)
        .messages({
            'number.base': 'Warranty months must be a number',
            'number.integer': 'Warranty months must be an integer',
            'number.min': 'Warranty months cannot be negative'
        }),
    product_tag: joi.string()
        .max(255)
        .allow(null, '')
        .messages({
            'string.base': 'Product tag must be a string',
            'string.max': 'Product tag must be at most 255 characters'
        }),
    images: joi.array().items(
        joi.object({
            image_url: joi.string().uri().required().messages({
                'string.base': 'Image URL must be a string',
                'string.uri': 'Image URL must be a valid URI',
                'any.required': 'Image URL is required'
            }),
            is_primary: joi.boolean().optional(),
            alt_text: joi.string().max(255).allow("", null),
            sort_order: joi.number().integer().min(0).optional()
        })
    ).optional(),
    attributes: joi.array().items(
        joi.object({
            attribute_id: joi.number().integer().positive().required().messages({
                'number.base': 'Attribute ID must be a number',
                'number.integer': 'Attribute ID must be an integer',
                'number.positive': 'Attribute ID must be a positive number',
                'any.required': 'Attribute ID is required'
            }),
            value: joi.string().max(100).required().messages({
                'string.base': 'Attribute value must be a string',
                'string.max': 'Attribute value must be at most 100 characters',
                'any.required': 'Attribute value is required'
            })
        })
    ).optional()
});

// Validation schema for validating product ID in params
const idParamSchema = joi.object({
    id: joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'ID must be a number',
            'number.integer': 'ID must be an integer',
            'number.positive': 'ID must be a positive number',
            'any.required': 'ID is required'
        })
})

const productAttributeParamSchema = joi.object({
    id: joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Product ID must be a number',
            'number.positive': 'Product ID must be a positive number',
            'any.required': 'Product ID is required'
        }),
    attributeId: joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Attribute ID must be a number',
            'number.positive': 'Attribute ID must be a positive number',
            'any.required': 'Attribute ID is required'
        })
});

const createProductAttributeSchema = joi.object({
    attribute_id: joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Attribute ID must be a number',
            'number.integer': 'Attribute ID must be an integer',
            'number.positive': 'Attribute ID must be a positive number',
            'any.required': 'Attribute ID is required'
        }),
    value: joi.number()
        .max(100)
        .required()
        .messages({
            'string.base': 'Attribute value must be a string',
            'string.max': 'Attribute value must be at most 100 characters',
            'any.required': 'Attribute value is required'
        })
});

// Validation middleware for product creation and update
export const validateProduct = (req, res, next) => {
    const { error, value } = productSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            succes: false,
            error: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }
    req.body = value;
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

export const validateProductAttributeParams = (req, res, next) => {
    const { error, value } = productAttributeParamSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            success: false,
            error: error.details[0].message
        })
    }
    req.params = value;
    next();
}

export const validateCreateProductAttribute = (req, res, next) => {
    const { error, value } = createProductAttributeSchema.validate(req.body, { abortEarly: false });
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