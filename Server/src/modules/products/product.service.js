import slugify from 'slugify';
import * as productRepository from './product.repository.js';
import { findCategoryById } from '../categories/categories.repository.js';
import { findBrandById } from '../brands/brand.repository.js';
import pool from "../../config/db.js";

export const createProduct = async (productData) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (!productData.name) {
            throw new Error("Product name is required");
        }

        // Check if product with same name exists
        const existing = await productRepository.findProductByName(productData.name, client);
        if (existing) {
            throw new Error("Product with this name already exists");
        }

        // Check if category exists
        const categoryIdCheck = await findCategoryById(productData.category_id);
        if (!categoryIdCheck) {
            throw new Error("Category not found");
        }

        // Check if brand exists
        const brandIdCheck = await findBrandById(productData.brand_id);
        if (!brandIdCheck) {
            throw new Error("Brand not found");
        }

        const { images, ...productFields } = productData;
        productFields.slug = slugify(productFields.name, { lower: true, strict: true });

        // Insert product
        const product = await productRepository.createProduct(productFields, client);

        // Insert images
        if (images && images.length > 0) {
            const primaryImages = images.filter(img => img.is_primary);
            if (primaryImages.length > 1) {
                throw new Error("Only one primary image allowed");
            }
            await productRepository.insertProductImages(product.product_id, images, client);
        }

        await client.query("COMMIT");
        return product;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
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