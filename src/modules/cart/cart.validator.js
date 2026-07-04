import Joi from 'joi';

const AddItem = Joi.object({
    product_id: Joi.number().
        integer().
        positive().
        required().
        messages({
            "number.base": "Product ID must be a number",
            "number.integer": "Product ID must be an integer",
            "number.positive": "Product ID must be a positive number",
            "any.required": "Product ID is required"
        }),

    quantity: Joi.number().
        integer().
        min(1).
        max(100).
        required().
        messages({
            "number.base": "Quantity must be a number",
            "number.integer": "Quantity must be an integer",
            "number.min": "Quantity must be at least 1",
            "number.max": "Quantity cannot exceed 100",
            "any.required": "Quantity is required"
        })
});

const UpdateItem = Joi.object({
    body: Joi.object({
        quantity: Joi.number().
            integer().
            min(1).
            max(100).
            required().
            messages({
                "number.base": "Quantity must be a number",
                "number.integer": "Quantity must be an integer",
                "number.min": "Quantity must be at least 1",
                "number.max": "Quantity cannot exceed 100",
                "any.required": "Quantity is required"
            })
    }),

    params: Joi.object({
        itemId: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Item ID must be a number",
                "number.integer": "Item ID must be an integer",
                "number.positive": "Item ID must be a positive number",
                "any.required": "Item ID is required"
            })
    })
});

const ItemId = Joi.object({
    params: Joi.object({
        itemId: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Item ID must be a number",
                "number.integer": "Item ID must be an integer",
                "number.positive": "Item ID must be a positive number",
                "any.required": "Item ID is required"
            })
    })
});

export const validateAddItem = (req, res, next) => {
    const { error, value } = AddItem.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        return res.status(400).json({
            success: false,
            errors: error.details.map(err => ({
                field: err.path[0],
                message: err.message
            }))
        });
    }

    req.body = value;

    next();
};

export const validateUpdateItem = (req, res, next) => {
    const { error, value } = UpdateItem.validate({
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

export const validateItemId = (req, res, next) => {
    const { error, value } = ItemId.validate({
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