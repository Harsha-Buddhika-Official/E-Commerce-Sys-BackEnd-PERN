import Joi from 'joi';

const CreateBanner = Joi.object({
    title: Joi.string().
        trim().
        min(2).
        max(100).
        required().
        messages({
            "string.empty": "Banner title is required",
            "string.min": "Banner title must be at least 2 characters long",
            "string.max": "Banner title cannot exceed 100 characters"
        })
});

export const validateCreateBanner = (req, res, next) => {
    const { error, value } = CreateBanner.validate(req.body, {
        abortEarly: false
    });

    const errors = [];

    if (error) {
        errors.push(...error.details.map(err => ({
            field: err.path[0],
            message: err.message
        })));
    }

    if (!req.file) {
        errors.push({
            field: "media",
            message: "Banner image is required"
        });
    }

    if (errors.length) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    req.body = value;

    next();
};

const GetBannerById = Joi.object({
    params: Joi.object({
        id: Joi.number().
            integer().
            positive().
            required().
            messages({
                "number.base": "Banner ID must be a number",
                "number.integer": "Banner ID must be an integer",
                "number.positive": "Banner ID must be a positive number",
                "any.required": "Banner ID is required"
            })
    })
});

export const validateBannerById = (req, res, next) => {
    const { error, value } = GetBannerById.validate({
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