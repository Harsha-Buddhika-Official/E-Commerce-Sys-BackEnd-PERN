import Joi from 'joi';

const ORDER_STATUS = ["pending_payment", "pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const ORDER_TYPES = ["direct", "cart"];

export const CreateOrder = Joi.object({
    order_type: Joi.string()
        .valid(...ORDER_TYPES)
        .required()
        .messages({
            "any.only": "Order type must be either 'direct' or 'cart'",
            "string.empty": "Order type is required"
        }),

    full_name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Full name is required",
            "string.min": "Full name must be at least 2 characters long"
        }),

    customer_email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.email": "Customer email must be a valid email address",
            "string.empty": "Customer email is required"
        }),

    phone_number: Joi.string()
        .trim()
        .min(7)
        .max(20)
        .required()
        .messages({
            "string.empty": "Phone number is required",
            "string.min": "Phone number must be at least 7 characters long",
            "string.max": "Phone number cannot exceed 20 characters"
        }),

    shipping_address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .required()
        .messages({
            "string.empty": "Shipping address is required",
            "string.min": "Shipping address must be at least 5 characters long"
        }),

    city: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "City is required",
            "string.min": "City must be at least 2 characters long"
        }),

    postal_code: Joi.string()
        .trim()
        .min(3)
        .max(20)
        .required()
        .messages({
            "string.empty": "Postal code is required",
            "string.min": "Postal code must be at least 3 characters long"
        }),

    order_status: Joi.string()
        .valid(...ORDER_STATUS)
        .default('pending_payment')
        .messages({
            "any.only": `Order status must be one of: ${ORDER_STATUS.join(', ')}`
        }),

    product_id: Joi.when('order_type', {
        is: 'direct',
        then: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "number.base": "Product ID must be a number",
                "number.integer": "Product ID must be an integer",
                "number.positive": "Product ID must be a positive number",
                "any.required": "Product ID is required for direct orders"
            }),
        otherwise: Joi.forbidden()
    }),

    quantity: Joi.when('order_type', {
        is: 'direct',
        then: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "number.base": "Quantity must be a number",
                "number.integer": "Quantity must be an integer",
                "number.positive": "Quantity must be a positive number",
                "any.required": "Quantity is required for direct orders"
            }),
        otherwise: Joi.forbidden()
    })
});

const TrackingLookup = Joi.object({
    email: Joi.string()
        .trim()
        .email()
        .required()
        .messages({
            "string.email": "Email must be a valid email address",
            "string.empty": "Email is required"
        }),

    trackingCode: Joi.string()
        .trim()
        .min(6)
        .max(100)
        .required()
        .messages({
            "string.empty": "Tracking code is required",
            "string.min": "Tracking code must be at least 6 characters long"
        })
});

const OrderId = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "Order ID must be a number",
            "number.integer": "Order ID must be an integer",
            "number.positive": "Order ID must be a positive number",
            "any.required": "Order ID is required"
        })
});

const UpdateOrderStatus = Joi.object({
    newStatus: Joi.string()
        .trim()
        .lowercase()
        .valid(...ORDER_STATUS)
        .required()
        .messages({
            "any.only": `Order status must be one of: ${ORDER_STATUS.join(', ')}`,
            "string.empty": "Order status is required"
        })
});

const UploadPaymentSlip = Joi.object({
    params: Joi.object({
        id: Joi.number()
            .integer()
            .positive()
            .required()
            .messages({
                "number.base": "Order ID must be a number",
                "number.integer": "Order ID must be an integer",
                "number.positive": "Order ID must be a positive number",
                "any.required": "Order ID is required"
            })
    })
});

const buildValidationError = (error) => {
    return error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message
    }));
};

export const validateCreateOrder = (req, res, next) => {
    const { error, value } = CreateOrder.validate(req.body , {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
		console.error('Validation error:', error); // Debug log to check validation error
        return res.status(400).json({
            success: false,
            errors: buildValidationError(error)
        });
    }

    req.body = value;
    next();
};

export const validateTrackingLookup = (req, res, next) => {
    const { error, value } = TrackingLookup.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: buildValidationError(error)
        });
    }

    req.body = value;
    next();
};

export const validateOrderIdParam = (req, res, next) => {
    const { error, value } = OrderId.validate(req.params, {
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: buildValidationError(error)
        });
    }

    req.params = value;
    next();
};

export const validateUpdateOrderStatus = (req, res, next) => {
    const { error, value } = UpdateOrderStatus.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: buildValidationError(error)
        });
    }

    req.body = value;
    next();
};

export const validateUploadPaymentSlip = (req, res, next) => {
    const { error, value } = UploadPaymentSlip.validate({
        params: req.params
    }, {
        abortEarly: false
    });

    const errors = error ? buildValidationError(error) : [];

    if (!req.file) {
        errors.push({
            field: "media",
            message: "Payment receipt is required"
        });
    }

    if (errors.length) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    req.params = value.params;
    next();
};