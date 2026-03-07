import slugify from "slugify";
import * as categoryRepository from "./categories.repository.js";

//create category
export const createCategory = async (categoryData) => {
    if (!categoryData.name) throw new Error('Category name is required');

    const existing = await categoryRepository.findByName(categoryData.name);
    if (existing) {
        throw new Error('Category with this name already exists');
    }

    categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });

    return await categoryRepository.createCategory(categoryData);
}

//get all categories
export const getAllCategories = async () => {
    const categories = await categoryRepository.getAllCategories();
    return categories;
};

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
    const category = await categoryRepository.findById(id);
    if (!category) {
        throw new Error('Category not found');
    }
    return category;
}

//update category
export const updateCategory = async (id, categoryData) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
        throw new Error('Category not found');
    }
    if (categoryData.name !== existing.name) {
        const nameExists = await categoryRepository.findByName(categoryData.name);
        if (nameExists) {
            throw new Error('Category with this name already exists');
        }
    }
    return await categoryRepository.updateCategory(id, categoryData);
}

//delete category
export const deleteCategory = async (id) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
        throw new Error('Category not found');
    }
    return await categoryRepository.deleteCategory(id);
}

//soft delete category
export const softDeleteCategory = async (id) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
        throw new Error('Category not found');
    }
    return await categoryRepository.updateCategory(id, { is_active: false });
}

//restore category
export const restoreCategory = async (id) => {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
        throw new Error('Category not found');
    }
    return await categoryRepository.updateCategory(id, { is_active: true });
}