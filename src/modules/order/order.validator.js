import joi from 'joi';

const orderStatusValues = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const directOrderSchema = joi.object({
	customer_email: joi.string()
		.trim()
		.email()
		.required()
		.messages({
			'string.email': 'Customer email must be a valid email address',
			'any.required': 'Customer email is required'
		}),
	phone_number: joi.string()
		.trim()
		.min(7)
		.max(20)
		.required()
		.messages({
			'string.empty': 'Phone number is required',
			'string.min': 'Phone number must be at least 7 characters',
			'string.max': 'Phone number must not exceed 20 characters'
		}),
	shipping_address: joi.string()
		.trim()
		.min(5)
		.max(255)
		.required()
		.messages({
			'string.empty': 'Shipping address is required'
		}),
	city: joi.string()
		.trim()
		.min(2)
		.max(100)
		.required()
		.messages({
			'string.empty': 'City is required'
		}),
	postal_code: joi.string()
		.trim()
		.min(3)
		.max(20)
		.required()
		.messages({
			'string.empty': 'Postal code is required'
		}),
	product_id: joi.number()
		.integer()
		.positive()
		.required()
		.messages({
			'number.base': 'Product ID must be a number',
			'number.integer': 'Product ID must be an integer',
			'number.positive': 'Product ID must be positive',
			'any.required': 'Product ID is required'
		}),
	quantity: joi.number()
		.integer()
		.positive()
		.required()
		.messages({
			'number.base': 'Quantity must be a number',
			'number.integer': 'Quantity must be an integer',
			'number.positive': 'Quantity must be positive',
			'any.required': 'Quantity is required'
		})
});

const cartOrderSchema = joi.object({
	customer_email: joi.string()
		.trim()
		.email()
		.required()
		.messages({
			'string.email': 'Customer email must be a valid email address',
			'any.required': 'Customer email is required'
		}),
	phone_number: joi.string()
		.trim()
		.min(7)
		.max(20)
		.required()
		.messages({
			'string.empty': 'Phone number is required',
			'string.min': 'Phone number must be at least 7 characters',
			'string.max': 'Phone number must not exceed 20 characters'
		}),
	shipping_address: joi.string()
		.trim()
		.min(5)
		.max(255)
		.required()
		.messages({
			'string.empty': 'Shipping address is required'
		}),
	city: joi.string()
		.trim()
		.min(2)
		.max(100)
		.required()
		.messages({
			'string.empty': 'City is required'
		}),
	postal_code: joi.string()
		.trim()
		.min(3)
		.max(20)
		.required()
		.messages({
			'string.empty': 'Postal code is required'
		}),
	order_status: joi.string()
		.trim()
		.lowercase()
		.valid(...orderStatusValues)
		.optional()
		.messages({
			'any.only': `Order status must be one of: ${orderStatusValues.join(', ')}`
		})
});

const trackingSchema = joi.object({
	email: joi.string()
		.trim()
		.email()
		.required()
		.messages({
			'string.email': 'Email must be a valid email address',
			'any.required': 'Email is required'
		}),
	trackingCode: joi.string()
		.trim()
		.min(6)
		.max(100)
		.required()
		.messages({
			'string.empty': 'Tracking code is required',
			'any.required': 'Tracking code is required'
		})
});

const orderIdParamSchema = joi.object({
	id: joi.number()
		.integer()
		.positive()
		.required()
		.messages({
			'number.base': 'Order ID must be a number',
			'number.integer': 'Order ID must be an integer',
			'number.positive': 'Order ID must be positive',
			'any.required': 'Order ID is required'
		})
});

const updateOrderStatusSchema = joi.object({
	newStatus: joi.string()
		.trim()
		.lowercase()
		.valid(...orderStatusValues)
		.required()
		.messages({
			'any.only': `newStatus must be one of: ${orderStatusValues.join(', ')}`,
			'any.required': 'newStatus is required'
		})
});

const buildValidationError = (error) => {
	return error.details.map((err) => ({
		field: err.path.join('.'),
		message: err.message
	}));
};

export const validateCreateDirectOrder = (req, res, next) => {
	const { error, value } = directOrderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Invalid direct order payload',
			errors: buildValidationError(error)
		});
	}

	req.body = value;
	next();
};

export const validateCreateCartOrder = (req, res, next) => {
	const { error, value } = cartOrderSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Invalid cart order payload',
			errors: buildValidationError(error)
		});
	}

	req.body = value;
	next();
};

export const validateTrackingLookup = (req, res, next) => {
	const source = {
		email: req.query.email ?? req.body?.email,
		trackingCode: req.query.trackingCode ?? req.body?.trackingCode
	};

	const { error, value } = trackingSchema.validate(source, { abortEarly: false, stripUnknown: true });
	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Invalid tracking lookup input',
			errors: buildValidationError(error)
		});
	}

	req.query = value;
	req.body = value;
	next();
};

export const validateOrderIdParam = (req, res, next) => {
	const { error, value } = orderIdParamSchema.validate(req.params, { abortEarly: false, stripUnknown: true });
	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Invalid order ID parameter',
			errors: buildValidationError(error)
		});
	}

	req.params = value;
	next();
};

export const validateUpdateOrderStatus = (req, res, next) => {
	const { error, value } = updateOrderStatusSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Invalid order status payload',
			errors: buildValidationError(error)
		});
	}

	req.body = value;
	next();
};
