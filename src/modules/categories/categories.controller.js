import * as categoryService from './categories.service.js';

// Create category
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

// Get product categories
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

// Get accessory categories
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

// Get categories by type or all categories
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

// Get all categories
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();

        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

// Get category names and ids only
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

// Get category by id
export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const category = await categoryService.getCategoryById(id);

        res.status(200).json({
            success: true,
            message: 'Category retrieved successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

// Update category
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatedCategory = await categoryService.updateCategory(id, req.body);

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

// Delete category
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        await categoryService.deleteCategory(id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// Soft delete category
export const softDeleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        await categoryService.softDeleteCategory(id);

        res.status(200).json({
            success: true,
            message: 'Category soft deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// Restore category
export const restoreCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        await categoryService.restoreCategory(id);

        res.status(200).json({
            success: true,
            message: 'Category restored successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};