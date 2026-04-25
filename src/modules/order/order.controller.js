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
        //const sessionId = req.body.sessionId; // temparary for testing, will be removed later when we integrate with frontend
        const sessionId = req.cookies.sessionId; // Using sessionId from cookies
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

export const getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const order = await orderService.getOrderById(orderId);
        res.status(200).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        next(error);
    }
};

export const getOrdersByTrackingCode = async (req, res, next) => {
    try {
        const { email, trackingCode } = req.body;
        const orders = await orderService.getOrdersByTrackingCode(trackingCode, email);
        res.status(200).json({
            success: true,
            data: orders
        });
    }
    catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json({
            success: true,
            data: orders
        });
    }
    catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { newStatus } = req.body;
        const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
        res.status(200).json({
            success: true,
            data: updatedOrder,
            message: 'Order status updated successfully'
        });
    }
    catch (error) {
        next(error);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        await orderService.deleteOrder(orderId);
        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
