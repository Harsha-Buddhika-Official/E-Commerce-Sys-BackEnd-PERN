import slugify from 'slugify';
import * as productRepository from './product.repository.js';

export const createProduct = async (productData) => {
    if (!productData.name) throw new Error('Product name is required');

    const existing = await productRepository.findByName(productData.name);
    if (existing) {
        throw new Error('Product with this name already exists');
    }

    productData.slug = slugify(productData.name, { lower: true, strict: true });

    return await productRepository.createProduct(productData);
};