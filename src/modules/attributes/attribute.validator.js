import Joi from 'joi';

const productAttributeMappingSchema = Joi.object({
	productId: Joi.number()
		.integer()
		.positive()
		.required()
		.messages({
			'number.base': 'Product ID must be a number',
			'number.integer': 'Product ID must be an integer',
			'number.positive': 'Product ID must be a positive number',
			'any.required': 'Product ID is required'
		}),
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
	attribute_value_id: Joi.number()
		.integer()
		.positive()
		.required()
		.messages({
			'number.base': 'Attribute value ID must be a number',
			'number.integer': 'Attribute value ID must be an integer',
			'number.positive': 'Attribute value ID must be a positive number',
			'any.required': 'Attribute value ID is required'
		})
});

const CreateAttribute = Joi.object({
    body: Joi.object({
        name: Joi.string().
            min(2).
            max(100).
            required().
            messages({
                "string.empty": "Attribute name is required",
                "string.min": "Attribute name must be at least 2 characters long",
                "string.max": "Attribute name cannot exceed 100 characters"
            }),

        category_id: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Category ID must be a number",
                "number.integer": "Category ID must be an integer",
                "number.positive": "Category ID must be a positive number",
                "any.required": "Category ID is required"
            })
    })
});

const CreateAttributeValue = Joi.object({
    body: Joi.object({
        value: Joi.string().
            trim().
            min(1).
            max(255).
            required().
            messages({
                "string.empty": "Attribute value is required",
                "string.min": "Attribute value cannot be empty",
                "string.max": "Attribute value cannot exceed 255 characters"
            })
    }),

    params: Joi.object({
        attributeId: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Attribute ID must be a number",
                "number.integer": "Attribute ID must be an integer",
                "number.positive": "Attribute ID must be a positive number",
                "any.required": "Attribute ID is required"
            })
    })
});

const DeleteAttribute = Joi.object({
    params: Joi.object({
        id: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Attribute ID must be a number",
                "number.integer": "Attribute ID must be an integer",
                "number.positive": "Attribute ID must be a positive number",
                "any.required": "Attribute ID is required"
            })
    })
});

const DeleteAttributeValue = Joi.object({
    params: Joi.object({
        attributeId: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Attribute ID must be a number",
                "number.integer": "Attribute ID must be an integer",
                "number.positive": "Attribute ID must be a positive number",
                "any.required": "Attribute ID is required"
            }),

        valueId: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Value ID must be a number",
                "number.integer": "Value ID must be an integer",
                "number.positive": "Value ID must be a positive number",
                "any.required": "Value ID is required"
            })
    })
});

export const validateProductAttributeMapping = (req, res, next) => {
	const { error, value } = productAttributeMappingSchema.validate(
		{
			...req.params,
			...req.body,
		},
		{ abortEarly: false }
	);

	if (error) {
		return res.status(400).json({
			success: false,
			error: error.details.map(err => ({
				field: err.path[0],
				message: err.message
			}))
		});
	}

	req.params.productId = value.productId;
	req.body.attribute_id = value.attribute_id;
	req.body.attribute_value_id = value.attribute_value_id;
	next();
};

export const validateCreateAttribute = (req, res, next) => {
    const { error, value } = CreateAttribute.validate({
        body: req.body
    }, {
        abortEarly: false
    });

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

export const validateCreateAttributeValue = (req, res, next) => {
    const { error, value } = CreateAttributeValue.validate({
        body: req.body,
        params: req.params
    }, {
        abortEarly: false
    });

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
    req.params = value.params;

    next();
};

export const validateDeleteAttribute = (req, res, next) => {
    const { error, value } = DeleteAttribute.validate({
        params: req.params
    }, {
        abortEarly: false
    });

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

export const validateDeleteAttributeValue = (req, res, next) => {
    const { error, value } = DeleteAttributeValue.validate({
        params: req.params
    }, {
        abortEarly: false
    });

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