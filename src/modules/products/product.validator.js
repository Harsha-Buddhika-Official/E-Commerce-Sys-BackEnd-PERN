import Joi from 'joi';

const productSchema = Joi.object({
    body: Joi.object({
        name: Joi.string()
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
        brand_name: Joi.string()
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
        category_name: Joi.string()
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
        description: Joi.string()
            .max(1000)
            .allow(null, '')
            .messages({
                'string.base': 'Description must be a string',
                'string.max': 'Description must be at most 1000 characters'
            }),
        base_price: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Base price must be a number',
                'number.positive': 'Base price must be a positive number',
                'any.required': 'Base price is required'
            }),
        discounted_price: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Discounted price must be a number',
                'number.positive': 'Discounted price must be a positive number',
                'any.required': 'Base price is required'
            }),
        selling_price: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Selling price must be a number',
                'number.positive': 'Selling price must be a positive number',
                'any.required': 'Selling price is required'
            }),
        stock_quantity: Joi.number()
            .integer()
            .min(0)
            .messages({
                'number.base': 'Stock quantity must be a number',
                'number.integer': 'Stock quantity must be an integer',
                'number.min': 'Stock quantity cannot be negative'
            }),
        warranty_months: Joi.number()
            .integer()
            .min(0)
            .allow(null)
            .messages({
                'number.base': 'Warranty months must be a number',
                'number.integer': 'Warranty months must be an integer',
                'number.min': 'Warranty months cannot be negative'
            }),
        product_tag: Joi.string()
            .max(255)
            .allow(null, '')
            .messages({
                'string.base': 'Product tag must be a string',
                'string.max': 'Product tag must be at most 255 characters'
            }),
        images: Joi.array().items(
            Joi.object({
                image_url: Joi.string().uri().required().messages({
                    'string.base': 'Image URL must be a string',
                    'string.uri': 'Image URL must be a valid URI',
                    'any.required': 'Image URL is required'
                }),
                is_primary: Joi.boolean().optional(),
                alt_text: Joi.string().max(255).allow('', null),
                sort_order: Joi.number().integer().min(0).optional()
            })
        ).optional(),
        attributes: Joi.array().items(
            Joi.object({
                attribute_id: Joi.number().integer().positive().required().messages({
                    'number.base': 'Attribute ID must be a number',
                    'number.integer': 'Attribute ID must be an integer',
                    'number.positive': 'Attribute ID must be a positive number',
                    'any.required': 'Attribute ID is required'
                }),
                attribute_value_id: Joi.number().integer().positive().required().messages({
                    'number.base': 'Attribute value ID must be a number',
                    'number.integer': 'Attribute value ID must be an integer',
                    'number.positive': 'Attribute value ID must be a positive number',
                    'any.required': 'Attribute value ID is required'
                })
            })
        ).optional()
    })
});

const productUpdateSchema = Joi.object({
    body: Joi.object({
        product_id: Joi.number().integer().positive().optional(),
        name: Joi.string().min(3).max(255).optional(),
        slug: Joi.string().max(255).optional(),
        description: Joi.string().max(1000).allow(null, '').optional(),
        brand_name: Joi.string().min(2).max(100).optional(),
        brand_id: Joi.number().integer().positive().optional(),
        category_name: Joi.string().min(2).max(100).optional(),
        category_id: Joi.number().integer().positive().optional(),
        base_price: Joi.number().positive().optional(),
        selling_price: Joi.number().positive().optional(),
        discounted_price: Joi.number().positive().optional(),
        stock_quantity: Joi.number().integer().min(0).optional(),
        warranty_months: Joi.number().integer().min(0).allow(null).optional(),
        product_tag: Joi.string().max(255).allow(null, '').optional(),
        is_active: Joi.boolean().optional(),
        attributes: Joi.array().items(
            Joi.object({
                attribute_id: Joi.number().integer().positive().required().messages({
                    'number.base': 'Attribute ID must be a number',
                    'number.integer': 'Attribute ID must be an integer',
                    'number.positive': 'Attribute ID must be a positive number',
                    'any.required': 'Attribute ID is required'
                }),
                attribute_value_id: Joi.number().integer().positive().required().messages({
                    'number.base': 'Attribute value ID must be a number',
                    'number.integer': 'Attribute value ID must be an integer',
                    'number.positive': 'Attribute value ID must be a positive number',
                    'any.required': 'Attribute value ID is required'
                })
            })
        ).optional(),
        images: Joi.array().items(
            Joi.object({
                image_id: Joi.number().integer().positive().optional(),
                image_url: Joi.string().uri().required().messages({
                    'string.base': 'Image URL must be a string',
                    'string.uri': 'Image URL must be a valid URI',
                    'any.required': 'Image URL is required'
                }),
                is_primary: Joi.boolean().optional(),
                alt_text: Joi.string().max(255).allow('', null).optional(),
                sort_order: Joi.number().integer().min(0).optional()
            })
        ).optional()
    })
});

const productIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Product ID must be a number',
                'number.positive': 'Product ID must be a positive number',
                'any.required': 'Product ID is required'
            })
    })
});

const categoryIdParamSchema = Joi.object({
    params: Joi.object({
        categoryId: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                'number.base': 'Category ID must be a number',
                'number.integer': 'Category ID must be an integer',
                'number.positive': 'Category ID must be a positive number',
                'any.required': 'Category ID is required'
            })
    })
});

const productAttributeParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Product ID must be a number',
                'number.positive': 'Product ID must be a positive number',
                'any.required': 'Product ID is required'
            }),
        attributeId: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Attribute ID must be a number',
                'number.positive': 'Attribute ID must be a positive number',
                'any.required': 'Attribute ID is required'
            })
    })
});

const filterProductsSchema = Joi.object({
    body: Joi.object({
        filters: Joi.array().items(
            Joi.object({
                attribute_id: Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .messages({
                        'number.base': 'Attribute ID must be a number',
                        'number.integer': 'Attribute ID must be an integer',
                        'number.positive': 'Attribute ID must be a positive number',
                        'any.required': 'Attribute ID is required'
                    }),
                value: Joi.string()
                    .max(100)
                    .required()
                    .messages({
                        'string.base': 'Attribute value must be a string',
                        'string.max': 'Attribute value must be at most 100 characters',
                        'any.required': 'Attribute value is required'
                    })
            })
        ).optional()
    })
});

const productImageIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Product ID must be a number',
                'number.positive': 'Product ID must be a positive number',
                'any.required': 'Product ID is required'
            }),
        imageId: Joi.number()
            .positive()
            .required()
            .messages({
                'number.base': 'Image ID must be a number',
                'number.positive': 'Image ID must be a positive number',
                'any.required': 'Image ID is required'
            })
    })
});

export const validateProductId = (req, res, next) => {
    const { error, value } = productIdParamSchema.validate(
        { params: req.params },
        { abortEarly: false }
    );

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }

    req.params = value.params;
    next();
};

export const validateProductIdAndImageId = (req, res, next) => {
    const { error, value } = productImageIdParamSchema.validate(
        { params: req.params },
        { abortEarly: false }
    );

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }

    req.params = value.params;
    next();
};

export const validateProduct = (req, res, next) => {
    const { error, value } = productSchema.validate(
        { body: req.body },
        { abortEarly: false }
    );

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
    next();
};

export const validateFullProductUpdate = (req, res, next) => {
    try {
        const bodyToValidate = { ...req.body };

        const jsonFields = ['attributes', 'images'];

        for (const field of jsonFields) {
            if (
                typeof bodyToValidate[field] === 'string' &&
                bodyToValidate[field].trim().startsWith('[')
            ) {
                try {
                    bodyToValidate[field] = JSON.parse(bodyToValidate[field]);
                } catch (error) {
                    return res.status(400).json({
                        success: false,
                        errors: [{ field, message: `${field} contains invalid JSON` }]
                    });
                }
            }
        }

        const numericFields = [
            'product_id',
            'brand_id',
            'category_id',
            'base_price',
            'selling_price',
            'discounted_price',
            'stock_quantity',
            'warranty_months'
        ];

        numericFields.forEach((field) => {
            if (
                bodyToValidate[field] !== undefined &&
                bodyToValidate[field] !== null &&
                bodyToValidate[field] !== ''
            ) {
                bodyToValidate[field] = Number(bodyToValidate[field]);
            }
        });

        if (bodyToValidate.is_active !== undefined) {
            bodyToValidate.is_active =
                bodyToValidate.is_active === true ||
                bodyToValidate.is_active === 'true';
        }

        if (req.files?.length > 0) {
            delete bodyToValidate.images;
        }

        const { error, value } = productUpdateSchema.validate(
            { body: bodyToValidate },
            {
                abortEarly: false,
                convert: true,
                stripUnknown: true
            }
        );

        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        req.body = value.body;
        next();
    } catch (error) {
        next(error);
    }
};

export const validateCategoryIdParam = (req, res, next) => {
    const { error, value } = categoryIdParamSchema.validate(
        { params: req.params },
        { abortEarly: false }
    );

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }

    req.params = value.params;
    next();
};

export const validateProductAttributeParams = (req, res, next) => {
    const { error, value } = productAttributeParamSchema.validate(
        { params: req.params },
        { abortEarly: false }
    );

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }

    req.params = value.params;
    next();
};

export const validateFilterProducts = (req, res, next) => {
    const { error, value } = filterProductsSchema.validate(
        { body: req.body },
        { abortEarly: false }
    );

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
    next();
};