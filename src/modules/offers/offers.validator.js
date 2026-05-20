import joi from 'joi';

const createOfferSchema = joi.object({
    title: joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
            "string.empty": "Title is required",
            "string.min": "Title must be at least 2 characters",
            "string.max": "Title must not exceed 255 characters"
        }),
    description: joi.string()
        .allow('', null)
        .optional(),
    discount_type: joi.string()
        .valid('percentage', 'fixed')
        .required()
        .messages({
            "any.only": "Discount type must be percentage or fixed",
            "string.empty": "Discount type is required"
        }),
    discount_value: joi.number()
        .positive()
        .precision(2)
        .required()
        .when('discount_type', {
            is: 'percentage',
            then: joi.number().max(100).messages({
                "number.max": "Percentage discount cannot exceed 100"
            })
        })
        .messages({
            "number.base": "Discount value must be a number",
            "number.positive": "Discount value must be positive",
            "any.required": "Discount value is required"
        }),
    start_date: joi.date()
        .required()
        .messages({
            "date.base": "Start date must be a valid date",
            "any.required": "Start date is required"
        }),
    end_date: joi.date()
        .required()
        .messages({
            "date.base": "End date must be a valid date",
            "any.required": "End date is required"
        }),
    is_active: joi.boolean().optional(),
    banner_image: joi.string().allow('', null).optional()
});

const updateOfferSchema = joi.object({
    title: joi.string()
        .trim()
        .min(2)
        .max(255)
        .optional(),
    description: joi.string()
        .allow('', null)
        .optional(),
    discount_type: joi.string()
        .valid('percentage', 'fixed')
        .optional(),
    discount_value: joi.number()
        .positive()
        .precision(2)
        .when('discount_type', {
            is: 'percentage',
            then: joi.number().max(100).messages({
                "number.max": "Percentage discount cannot exceed 100"
            })
        })
        .optional(),
    start_date: joi.date().optional(),
    end_date: joi.date().optional(),
    is_active: joi.boolean().optional(),
    banner_image: joi.string().allow('', null).optional()
});

const idParamSchema = joi.object({
    id: joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "ID must be a number",
            "number.positive": "ID must be positive"
        })
});

const productIdParamSchema = joi.object({
    productId: joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "Product ID must be a number",
            "number.positive": "Product ID must be positive"
        })
});

const offerProductBodySchema = joi.object({
    product_id: joi.number()
        .positive()
        .required()
        .messages({
            "number.base": "product_id must be a number",
            "number.positive": "product_id must be positive",
            "any.required": "product_id is required"
        })
});

export const validateCreateOffer = (req, res, next) => {
    const { error, value } = createOfferSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
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

export const validateUpdateOffer = (req, res, next) => {
    const { error, value } = updateOfferSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
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

export const validateOfferIdParam = (req, res, next) => {
    const { error, value } = idParamSchema.validate(req.params, { abortEarly: false, stripUnknown: true });
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

export const validateProductIdParam = (req, res, next) => {
    const { error, value } = productIdParamSchema.validate(req.params, { abortEarly: false, stripUnknown: true });
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

export const validateOfferProductBody = (req, res, next) => {
    const { error, value } = offerProductBodySchema.validate(req.body, { abortEarly: false, stripUnknown: true });
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
