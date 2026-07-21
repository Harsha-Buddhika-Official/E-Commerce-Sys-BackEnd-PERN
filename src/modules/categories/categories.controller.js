import * as categoryService from './categories.service.js';

export const createCategory = async (req, res, next) => {
    try {
        const newCategory = await categoryService.createCategory(req.body, req.file);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getCategories('product');

        res.status(200).json({
            success: true,
            message: 'Product categories retrieved successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

export const getAccessoryCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getCategories('accessory');

        res.status(200).json({
            success: true,
            message: 'Accessory categories retrieved successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (req, res, next) => {
    try {
        const { type } = req.query;

        const categories = await categoryService.getCategories(type);

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryNames = async (req, res, next) => {
    try {
        const categories = await categoryService.getCategoryNames();

        res.status(200).json({
            success: true,
            message: 'Category names retrieved successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        await categoryService.deleteCategory(id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: { id },
        });
    } catch (error) {
        next(error);
    }
};