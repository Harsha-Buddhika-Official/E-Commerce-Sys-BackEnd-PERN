import * as productService from './product.service.js';

// Controller functions for product routes
export const createProduct = async (req, res, next) => {
    try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Get all products
export const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts();
        res.status(201).json({
            success: true,
            data: products,
            message: 'Get all product Successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Get product by ID
export const getProductByid = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);
        res.status(201).json({
            success: true,
            data: product,
            message: 'Get product by id Successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Update product by ID
export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedProduct = await productService.updateProduct(id, req.body);
        res.status(200).json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Delete product by ID
export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await productService.deleteProduct(id);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Soft delete product by ID
export const softDeleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await productService.softDeleteProduct(id);
        res.status(200).json({
            success: true,
            message: 'Product soft deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Restore soft-deleted product by ID
export const restoreProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        await productService.restoreProduct(id);
        res.status(200).json({
            success: true,
            message: 'Product restored successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Remove one attribute from a product
export const removeProductAttribute = async (req, res, next) => {
    try {
        const { id, attributeId } = req.params;
        await productService.removeProductAttribute(id, attributeId);
        res.status(200).json({
            success: true,
            message: 'Product attribute removed successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Create one attribute mapping for a product
export const createProductAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mapped = await productService.createProductAttribute(id, req.body);
        res.status(201).json({
            success: true,
            data: mapped,
            message: 'Product attribute created successfully'
        });
    } catch (error) {
        next(error);
    }
}

// Get attributes by category ID
export const getAttributesByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const attributes = await productService.getAttributesByCategory(categoryId);
        res.status(200).json({
            success: true,
            data: attributes,
            message: 'Attributes retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
}