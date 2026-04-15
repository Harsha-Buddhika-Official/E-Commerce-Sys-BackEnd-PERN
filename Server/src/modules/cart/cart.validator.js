import joi from "joi";

const addToCartSchema = joi.object({
    productId: joi.number()
        .positive()
        .required(),
    quantity: joi.number()
        .positive()
        .required()
});

const updateCartItemSchema = joi.object({
    quantity: joi.number()
        .positive()
        .required()
});

const idParamSchema = joi.object({
    cartItemId: joi.number()
        .positive()
        .required()
});

const sessionIdSchema = joi.string()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
        'string.base': 'Session ID must be a string',
        'string.empty': 'Session ID is required',
        'string.guid': 'Session ID must be a valid UUIDv4',
        'any.required': 'Session ID is required'
    });


export const validateAddToCart = (req, res, next) => {
    const { error, value } = addToCartSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            errors: error.details.map((err) => err.message)
        });
    }
    req.validatedData = value;
    next();
};

export const validateUpdateCartItem = (req, res, next) => {
    const { error, value } = updateCartItemSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            errors: error.details.map((err) => err.message)
        });
    }
    req.validatedData = value;
    next();
};

export const validateIdParam = (req, res, next) => {
    const { error, value } = idParamSchema.validate(req.params, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            errors: error.details.map((err) => err.message)
        });
    }
    req.validatedData = value;
    next();
};

export const validateSessionId = (req, res, next) => {
    // Allow sessionId from body (for testing/explicit passing) or sessionID from express-session or cookies
    const sessionId = req.body.sessionId || req.sessionID || req.cookies.sessionId;
    
    // If no sessionId yet, that's okay for new sessions - skip validation but log
    if (!sessionId) {
        return next(); // Allow new sessions to proceed
    }
    
    const { error, value } = sessionIdSchema.validate(sessionId, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid session ID',
            errors: error.details.map((err) => err.message)
        });
    }
    req.validatedSessionId = value;
    next();
};