import * as orderService from './order.service.js';

export const createOrder = async (req, res, next) => {
    // console.log('Received request body in controller:', req.body);
    const sessionId = req.cookies.sid
    
    try {
        const order = await orderService.createOrder(
            req.body,
            sessionId
        );

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updatePaymentSlip = async (req, res, next) => {
    try {
        // console.log('Received file in controller:', req.file); // Debug log to check received file
        const orderId = req.params.id;
        const slipUrl = await orderService.UpdatePaymentSlip(orderId, req.file);
        res.status(200).json({
            success: true,
            data: { slipUrl },
            message: 'Payment slip URL retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
}

//status data for admin dashboard
//using
export const getStatusData = async (req, res, next) => {
    try {
        const statusData = await orderService.getStatusData();
        res.status(200).json({
            success: true,
            data: statusData
        });
    }
    catch (error) {
        next(error);
    }
};

//low stock alert for admin dashboard
//using
export const lowStockAlert = async (req, res, next) => {
    try {
        const lowStockProducts = await orderService.lowStockAlert();
        res.status(200).json({
            success: true,
            data: lowStockProducts
        });
    }
    catch (error) {
        next(error);
    }
};

//recent orders for admin dashboard
//using
export const getRecentOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getRecentOrders();

        res.status(200).json({
            success: true,
            data: orders,
            message: 'Recent orders retrieved successfully'
        });

    } catch (error) {
        next(error);
    }
};

//order status count for order page
//using
export const OrderStatusCount = async (req, res, next) => {
    try {
        const OrderStatus = await orderService.getOrderStatusCount();
        res.status(200).json({
            success: true,
            data: OrderStatus,
            message: 'Order status count retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

//orders for order page
//using
export const getAllOrders = async (req, res, next) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json({
            success: true,
            data: orders,
            message: 'All orders retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

//using
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
        // console.log('Received request body in controller:', req.body); // Debug log to check request body
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

//using
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

//waiting list
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

//using
export const findOrderImageById = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const imageData = await orderService.findOrderImageById(orderId);
        res.status(200).json({
            success: true,
            data: imageData,
            message: 'Order image data retrieved successfully'
        });
    }
    catch (error) {
        next(error);
    }
};






