import slugify from "slugify";
import * as categoryRepository from "./categories.repository.js";
import AppError from "../../utils/AppError.js";

//create category
export const createCategory = async (categoryData) => {
    if (!categoryData.name) throw new AppError('Category name is required', 400);
    if (!categoryData.category_type) throw new AppError('Category type is required', 400);

    const existing = await categoryRepository.findCategoryByName(categoryData.name);
    if (existing) {
        throw new AppError('Category with this name already exists', 409);
    }

    categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });

    return await categoryRepository.createCategory(categoryData);
}

//get categories by category_type
export const getCategories = async (type) => {
    let categories;
    if (type) {
        categories = await categoryRepository.getCategoriesByType(type);
    } else {
       categories = await categoryRepository.getAllCategories();
    }
    return categories;
};

//get category by id
export const getCategoryById = async (id) => {
    const category = await categoryRepository.findCategoryById(id);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    return category;
}

//update category
export const updateCategory = async (id, categoryData) => {
    const existing = await categoryRepository.findCategoryById(id);
    if (!existing) {
        throw new AppError('Category not found', 404);
    }
    if (categoryData.name && categoryData.name !== existing.name) {
        const nameExists = await categoryRepository.findCategoryByName(categoryData.name);
        if (nameExists) {
            throw new AppError('Category with this name already exists', 409);
        }
    }
    categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });
    return await categoryRepository.updateCategory(id, categoryData);
}

//delete category
export const deleteCategory = async (id) => {
    const existing = await categoryRepository.findCategoryById(id);
    if (!existing) {
        throw new AppError('Category not found', 404);
    }
    return await categoryRepository.deleteCategory(id);
}

//soft delete category
export const softDeleteCategory = async (id) => {
    const existing = await categoryRepository.findCategoryById(id);
    if (!existing) {
        throw new AppError('Category not found', 404);
    }
    return await categoryRepository.softDeleteCategory(id);
}

//restore category
export const restoreCategory = async (id) => {
    const existing = await categoryRepository.findCategoryById(id);
    if (!existing) {
        throw new AppError('Category not found', 404);
    }
    return await categoryRepository.restoreCategory(id);
}