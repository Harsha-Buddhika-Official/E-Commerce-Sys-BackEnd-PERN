import Joi from 'joi';
import AppError from '../../utils/AppError.js';

// ─── Schemas ───────────────────────────────────────────────────────────────────

const addItemSchema = Joi.object({
    product_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'product_id must be a number',
            'number.integer': 'product_id must be an integer',
            'number.positive': 'product_id must be positive',
            'any.required': 'product_id is required',
        }),

    quantity: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .required()
        .messages({
            'number.base': 'quantity must be a number',
            'number.integer': 'quantity must be an integer',
            'number.min': 'quantity must be at least 1',
            'number.max': 'quantity cannot exceed 100',
            'any.required': 'quantity is required',
        }),
});

const updateItemSchema = Joi.object({
    quantity: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .required()
        .messages({
            'number.base': 'quantity must be a number',
            'number.integer': 'quantity must be an integer',
            'number.min': 'quantity must be at least 1',
            'number.max': 'quantity cannot exceed 100',
            'any.required': 'quantity is required',
        }),
});

const itemIdParamSchema = Joi.object({
    itemId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'itemId must be a number',
            'number.positive': 'itemId must be a positive integer',
        }),
});

// ─── Middleware factory ────────────────────────────────────────────────────────

const validate = (schema, target = 'body') => {
    return (req, _res, next) => {
        const data = target === 'params'
            ? { itemId: Number(req.params.itemId) }
            : req[target];

        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            return next(new AppError(JSON.stringify(messages), 400));
        }

        if (target === 'params') {
            req.params = { ...req.params, ...value };
        } else {
            req[target] = value;
        }

        next();
    };
};

// ─── Named exports used in routes ─────────────────────────────────────────────

export const validateAddItem = validate(addItemSchema, 'body');
export const validateUpdateItem = validate(updateItemSchema, 'body');
export const validateItemId = validate(itemIdParamSchema, 'params');