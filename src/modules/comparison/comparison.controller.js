import * as comparisonService from './comparison.service.js';

export const responseHandler = async (req, res, next) => {
    try {
        const { productIds } = req.body;
        const response = await comparisonService.compareProducts(productIds);
        console.log('AI Response:', response); // Log the AI response for debugging
        
        res.status(200).json({
            success: true,
            message: 'Products retrieved successfully',
            data: response,
        });
    } catch (error) {
        next(error);
    }
};