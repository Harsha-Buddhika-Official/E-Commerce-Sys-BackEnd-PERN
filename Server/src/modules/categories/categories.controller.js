import * as categoryService from './categories.service.js';

export const createCategory = async (req, res, next) => {
    try {
        const newCategory = await categoryService.createCategory(req.body);
        res.status(201).json({
            success: true,
            data: newCategory,
            message: 'Category created successfully'
        });
    }  catch (error) {
        next(error);
    }
};