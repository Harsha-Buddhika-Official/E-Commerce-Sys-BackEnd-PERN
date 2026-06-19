import slugify from 'slugify';
import * as categoryRepository from './categories.repository.js';
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

// Create category
//using
export const createCategory = async (categoryData, file) => {
    const { name, category_type } = categoryData;

    if (!name?.trim()) {
        throw new AppError('Category name is required', 400);
    }

    if (!category_type) {
        throw new AppError('Category type is required', 400);
    }

    if (!file) {
        throw new AppError('Category image is required', 400);
    }

    const existing = await categoryRepository.findCategoryByName(name.trim());

    if (existing) {
        throw new AppError('Category with this name already exists', 409);
    }

    const uploadResult = await uploadToCloudinary(
        file.buffer,
        `category-${Date.now()}`,
        'ecommerce/categories'
    );

    const payload = {
        ...categoryData,
        name: name.trim(),
        slug: slugify(name, {
            lower: true,
            strict: true,
        }),
        img_url: uploadResult.secure_url,
        media_public_id: uploadResult.public_id,
    };

    return await categoryRepository.createCategory(payload);
};

// Get categories by type or all
//using
export const getCategories = async (type) => {
    if (type) {
        return await categoryRepository.getCategoriesByType(type);
    }

    return await categoryRepository.getAllCategories();
};

// Get category names and ids
//using
export const getCategoryNames = async () => {
    const categories = await categoryRepository.getCategoryNames();

    if (!categories.length) {
        throw new AppError('No categories found', 404);
    }

    return categories;
};

// Delete category
//using
export const deleteCategory = async (id) => {
    const existingCategory = await categoryRepository.findCategoryById(id);
      await deleteFromCloudinary(
        existingCategory.media_public_id
      );

    if (!existingCategory) {
        throw new AppError('Category not found', 404);
    }

    return await categoryRepository.deleteCategory(id);
};