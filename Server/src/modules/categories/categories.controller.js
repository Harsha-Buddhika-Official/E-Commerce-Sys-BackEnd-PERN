import * as categoryService from './categories.service.js';

//create category
export const createCategory = async (req, res, next) => {
    try {
        const newCategory = await categoryService.createCategory(req.body);
        res.status(201).json({
            success: true,
            data: newCategory,
            message: 'Category created successfully'
        });
    } catch (error) {
        next(error);
    }
};

//get all categories
export const getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json({
            success: true,
            data: categories,
            message: 'Categories retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
}

//get categories by category_type
export const getCategories = async (req, res, next) => {
    try {
        const { type } = req.query;
        const categories = await categoryService.getCategories(type);
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

//get category by id
export const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
}

//update category