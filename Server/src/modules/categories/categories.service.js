import slugify from "slugify";
import * as categoryRepository from "./categories.repository.js";

export const createCategory = async (categoryData) => {
    if(!categoryData.name) throw new Error('Category name is required');

    const existing = await categoryRepository.findByName(categoryData.name);
    if (existing) {
        throw new Error('Category with this name already exists');
    }

    categoryData.slug = slugify(categoryData.name, { lower: true, strict: true });

    return await categoryRepository.createCategory(categoryData);
}

