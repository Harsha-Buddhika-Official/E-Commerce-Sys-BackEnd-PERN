import * as orderService from './order.service.js';

export const createDirectOrder = async (req, res, next) => {
    try {
        const orderData = req.body;
        const order = await orderService.createDirectOrder(orderData);
        res.status(201).json({
            success: true,
            data: order,
            message: 'Direct order created successfully'
        });
    }
    catch (error) {
        next(error);
    }
};

export const createCartOrder = async (req, res, next) => {
    try {
        const orderData = req.body;
        const sessionId = req.sessionID; // Using sessionID from express-session
        orderData.sessionId = sessionId; // Pass sessionId to service layer
        const order = await orderService.createCartOrder(orderData);
        res.status(201).json({
            success: true,
            data: order,
            message: 'Cart order created successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
