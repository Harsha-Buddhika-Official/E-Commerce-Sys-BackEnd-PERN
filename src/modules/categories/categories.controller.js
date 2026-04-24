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

//get categories by category_type / get all categories if no type provided
export const getCategories = async (req, res, next) => {
    try {
        const { type } = req.query;
        let categories;
        if(type) {
            categories = await categoryService.getCategories(type);
        } else {
            categories = await categoryService.getCategories();
        }
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
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedCategory = await categoryService.updateCategory(id, req.body);
        res.status(200).json({
            success: true,
            data: updatedCategory,
            message: 'Category updated successfully'
        });
    } catch (error) {
        next(error);
    }
}

//delete category
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await categoryService.deleteCategory(id);
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

//soft delete category
export const softDeleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await categoryService.softDeleteCategory(id);
        res.status(200).json({
            success: true,
            message: 'Category soft deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

//restore category
export const restoreCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        await categoryService.restoreCategory(id);
        res.status(200).json({
            success: true,
            message: 'Category restored successfully'
        });
    } catch (error) {
        next(error);
    }
}