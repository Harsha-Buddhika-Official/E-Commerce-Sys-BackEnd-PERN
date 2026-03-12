import slugify from 'slugify';
import * as productRepository from './product.repository.js';
import { findCategoryById } from '../categories/categories.repository.js';
import { findBrandById } from '../brands/brand.repository.js';

export const createProduct = async (productData) => {
    if (!productData.name) throw new Error('Product name is required');

    const existing = await productRepository.findProductByName(productData.name);
    if (existing) {
        throw new Error('Product with this name already exists');
    }

    // Check if category exists
    const categoryIdCheck = await findCategoryById(productData.category_id);
    if (!categoryIdCheck) {
        throw new Error('Category not found');
    }

    // Check if brand exists
    const brandIdCheck = await findBrandById(productData.brand_id);
    if (!brandIdCheck) {
        throw new Error('Brand not found');
    }

    productData.slug = slugify(productData.name, { lower: true, strict: true });
    return await productRepository.createProduct(productData);
};

export const getAllProducts = async () => {
    const products = await productRepository.getAllProducts();
    if (products.length === 0) {
        throw new Error('No products found');
    }
    return products;
}

export const getProductById = async (id) => {
    const product = await productRepository.findProductById(id);
    if (!product) {
        throw new Error('no product found');
    }
    return product;
}

export const updateProduct = async (id, productData) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new Error('product not found');
    }
    if (productData.name && productData.name !== existing.name) {
        const nameExists = await productRepository.findProductByName(productData.name);
        if (nameExists) {
            throw new Error('Product with this name is already exists');
        }
    }
    productData.slug = slugify(productData.name, { lower: true, strict: true });
    return await productRepository.updateProduct(id, productData);
}

export const deleteProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new Error('product not found');
    }
    return await productRepository.deleteProduct(id);
}

export const softDeleteProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new Error('product not found');
    }
    return await productRepository.softDeleteProduct(id);
}

export const restoreProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new Error('product not found');
    }
    return await productRepository.restoreProduct(id);
}