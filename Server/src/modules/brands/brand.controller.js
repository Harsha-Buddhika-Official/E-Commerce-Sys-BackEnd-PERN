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

export const deleteBrand = async (req, res, next) => {
    try {
        await brandService.deleteBrand(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const softDeleteBrand = async (req, res, next) => {
    try {
        await brandService.softDeleteBrand(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Brand soft deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}