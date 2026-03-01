import * as brandService from './brand.service.js';

export const createBrand = async (req, res, next) => {
    try {
        const newBrand = await brandService.createBrand(req.body);
        res.status(201).json({
            success: true,
            data: newBrand,
            message: 'Brand created successfully'
        });
    } catch (error) {
        next(error);
    }
};