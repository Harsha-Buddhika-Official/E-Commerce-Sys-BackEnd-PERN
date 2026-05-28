import joi from 'joi';

const productAttributeMappingSchema = joi.object({
	productId: joi.number()
		.integer()
		.positive()
		.required()
		.messages({
			'number.base': 'Product ID must be a number',
			'number.integer': 'Product ID must be an integer',
			'number.positive': 'Product ID must be a positive number',
			'any.required': 'Product ID is required'
		}),
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
	attribute_value_id: joi.number()
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
