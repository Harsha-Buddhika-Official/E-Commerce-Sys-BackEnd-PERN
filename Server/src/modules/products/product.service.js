import slugify from 'slugify';
import * as productRepository from './product.repository.js';
import { findCategoryById, findCategoryByName } from '../categories/categories.repository.js';
import { findBrandByName, findBrandById } from '../brands/brand.repository.js';
import pool from "../../config/db.js";

// create product with transaction
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
        const categoryNameCheck = await findCategoryByName(productData.category_name);
        if (!categoryNameCheck) {
            throw new Error("Category not found");
        }
        productData.category_id = categoryNameCheck.category_id;

        // Check if brand exists
        const brandNameCheck = await findBrandByName(productData.brand_name);
        if (!brandNameCheck) {
            throw new Error("Brand not found");
        }
        productData.brand_id = brandNameCheck.brand_id;

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

// get all products
export const getAllProducts = async () => {
    const products = await productRepository.getAllProducts();
    if (products.length === 0) {
        throw new Error('No products found');
    }
    return products;
}

// get product by id
export const getProductById = async (id) => {
    const product = await productRepository.findProductById(id);
    if (!product) {
        throw new Error('no product found');
    }
    return product;
}

// update product with transaction
export const updateProduct = async (id, productData) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        
        const existing = await productRepository.findProductById(id);
        if (!existing) {
            throw new Error('product not found');
        }
        
        // Convert category name to ID if provided
        if (productData.category_name && !productData.category_id) {
            const categoryNameCheck = await findCategoryByName(productData.category_name);
            if (!categoryNameCheck) {
                throw new Error("Category not found");
            }
            productData.category_id = categoryNameCheck.category_id;
        }

        // Convert brand name to ID if provided
        if (productData.brand_name && !productData.brand_id) {
            const brandNameCheck = await findBrandByName(productData.brand_name);
            if (!brandNameCheck) {
                throw new Error("Brand not found");
            }
            productData.brand_id = brandNameCheck.brand_id;
        }
        
        if (productData.name && productData.name !== existing.name) {
            const nameExists = await productRepository.findProductByName(productData.name, client);
            if (nameExists) {
                throw new Error('Product with this name is already exists');
            }
        }

        // Check if category exists (if provided)
        if (productData.category_id && productData.category_id !== existing.category_id) {
            const categoryIdCheck = await findCategoryById(productData.category_id);
            if (!categoryIdCheck) {
                throw new Error("Category not found");
            }
        }

        // Check if brand exists (if provided)
        if (productData.brand_id && productData.brand_id !== existing.brand_id) {
            const brandIdCheck = await findBrandById(productData.brand_id);
            if (!brandIdCheck) {
                throw new Error("Brand not found");
            }
        }

        const { images, category_name, brand_name, ...productFields } = productData;
        if (productFields.name) {
            productFields.slug = slugify(productFields.name, { lower: true, strict: true });
        }
        
        // Update product
        const updatedProduct = await productRepository.updateProduct(id, productFields, client);

        // Handle images if provided
        if (images && Array.isArray(images)) {
            const primaryImages = images.filter(img => img.is_primary);
            if (primaryImages.length > 1) {
                throw new Error("Only one primary image allowed");
            }
            // Delete old images
            await productRepository.deleteProductImages(id, client);
            // Insert new images
            if (images.length > 0) {
                await productRepository.insertProductImages(id, images, client);
            }
        }

        await client.query("COMMIT");
        return updatedProduct;

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

// delete product
export const deleteProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new Error('product not found');
    }
    return await productRepository.deleteProduct(id);
}

// soft delete product
export const softDeleteProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new Error('product not found');
    }
    return await productRepository.softDeleteProduct(id);
}

// restore product
export const restoreProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new Error('product not found');
    }
    return await productRepository.restoreProduct(id);
}