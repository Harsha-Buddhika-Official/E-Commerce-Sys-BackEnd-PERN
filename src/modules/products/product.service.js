import slugify from 'slugify';
import * as productRepository from './product.repository.js';
import { findCategoryById, findCategoryByName } from '../categories/categories.repository.js';
import { findBrandByName, findBrandById } from '../brands/brand.repository.js';
import pool from "../../config/db.js";
import AppError from '../../utils/AppError.js';

// create product with transaction
export const createProduct = async (productData) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        if (!productData.name) {
            throw new AppError("Product name is required", 400);
        }

        // Check if product with same name exists
        const existing = await productRepository.findProductByName(productData.name, client);
        if (existing) {
            throw new AppError("Product with this name already exists", 400);
        }

        // Check if category exists
        const categoryNameCheck = await findCategoryByName(productData.category_name);
        if (!categoryNameCheck) {
            throw new AppError("Category not found", 404);
        }
        productData.category_id = categoryNameCheck.category_id;

        // Check if brand exists
        const brandNameCheck = await findBrandByName(productData.brand_name);
        if (!brandNameCheck) {
            throw new AppError("Brand not found", 404);
        }
        productData.brand_id = brandNameCheck.brand_id;

        const { images, attributes, ...productFields } = productData;
        productFields.slug = slugify(productFields.name, { lower: true, strict: true });

        // Insert product
        const product = await productRepository.createProduct(productFields, client);

        // Insert images
        if (images && images.length > 0) {
            const primaryImages = images.filter(img => img.is_primary);
            if (primaryImages.length > 1) {
                throw new AppError("Only one primary image allowed", 400);
            }
            await productRepository.insertProductImages(product.product_id, images, client);
        }

        // Insert product attributes mapping
        if (attributes && attributes.length > 0) {
            await productRepository.insertProductAttributes(product.product_id, attributes, client);
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
        throw new AppError('No products found', 404);
    }
    return products;
}

// get product by id
export const getProductById = async (id) => {
    const product = await productRepository.findProductById(id);
    if (!product) {
        throw new AppError('Product not found', 404);
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
            throw new AppError('Product not found', 404);
        }
        
        // Convert category name to ID if provided
        if (productData.category_name && !productData.category_id) {
            const categoryNameCheck = await findCategoryByName(productData.category_name);
            if (!categoryNameCheck) {
                throw new AppError("Category not found", 404);
            }
            productData.category_id = categoryNameCheck.category_id;
        }

        // Convert brand name to ID if provided
        if (productData.brand_name && !productData.brand_id) {
            const brandNameCheck = await findBrandByName(productData.brand_name);
            if (!brandNameCheck) {
                throw new AppError("Brand not found", 404);
            }
            productData.brand_id = brandNameCheck.brand_id;
        }
        
        if (productData.name && productData.name !== existing.name) {
            const nameExists = await productRepository.findProductByName(productData.name, client);
            if (nameExists) {
                throw new AppError('Product with this name is already exists', 400);
            }
        }

        // Check if category exists (if provided)
        if (productData.category_id && productData.category_id !== existing.category_id) {
            const categoryIdCheck = await findCategoryById(productData.category_id);
            if (!categoryIdCheck) {
                throw new AppError("Category not found", 404);
            }
        }

        // Check if brand exists (if provided)
        if (productData.brand_id && productData.brand_id !== existing.brand_id) {
            const brandIdCheck = await findBrandById(productData.brand_id);
            if (!brandIdCheck) {
                throw new AppError("Brand not found", 404);
            }
        }

        const { images, attributes, category_name, brand_name, ...productFields } = productData;
        if (productFields.name) {
            productFields.slug = slugify(productFields.name, { lower: true, strict: true });
        }
        
        // Update product
        const updatedProduct = await productRepository.updateProduct(id, productFields, client);

        // Handle images if provided
        if (images && Array.isArray(images)) {
            const primaryImages = images.filter(img => img.is_primary);
            if (primaryImages.length > 1) {
                throw new AppError("Only one primary image allowed", 400);
            }
            // Delete old images
            await productRepository.deleteProductImages(id, client);
            // Insert new images
            if (images.length > 0) {
                await productRepository.insertProductImages(id, images, client);
            }
        }

        // Replace product attributes if payload is provided
        if (attributes && Array.isArray(attributes)) {
            await productRepository.deleteProductAttributes(id, client);
            if (attributes.length > 0) {
                await productRepository.insertProductAttributes(id, attributes, client);
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
        throw new AppError('Product not found', 404);
    }
    return await productRepository.deleteProduct(id);
}

// soft delete product
export const softDeleteProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new AppError('Product not found', 404);
    }
    return await productRepository.softDeleteProduct(id);
}

// restore product
export const restoreProduct = async (id) => {
    const existing = await productRepository.findProductById(id);
    if (!existing) {
        throw new AppError('Product not found', 404);
    }
    return await productRepository.restoreProduct(id);
}

// remove one mapped attribute from a product
export const removeProductAttribute = async (productId, attributeId) => {
    const existing = await productRepository.findProductById(productId);
    if (!existing) {
        throw new AppError('Product not found', 404);
    }

    const deleted = await productRepository.removeProductAttribute(productId, attributeId);
    if (!deleted) {
        throw new AppError('Product attribute not found', 404);
    }

    return deleted;
}

// create one mapped attribute for a product
export const createProductAttribute = async (productId, attributeData) => {
    const existing = await productRepository.findProductById(productId);
    if (!existing) {
        throw new AppError('Product not found', 404);
    }

    return await productRepository.createProductAttribute(productId, attributeData);
}