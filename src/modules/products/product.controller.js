import * as productService from './product.service.js';

export const createProductWithoutAttributes = async (req, res, next) => {
    // console.log("Creating product without attributes with data:", { body: req.body, files: req.files || [] }); // Debug log to check incoming data
    try {
        const product = await productService.createProductWithoutAttributes({
            body: req.body,
            files: req.files || []
        });

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully without attributes'
        });
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const product = await productService.createProduct({
            body: req.body,
            files: req.files || []
        });

        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getAllProductsDetailsSimple = async (req, res, next) => {
    try {
        const products = await productService.getAllProductsDetailsSimple();
        res.status(200).json({
            success: true,
            data: products,
            message: 'Get all product limited details successfully'
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

export const getAllProductLimitedDetilas = async (req, res, next) => {
    try {
        const products = await productService.getAllProductLimitedDetilas();
        res.status(200).json({
            success: true,
            data: products,
            message: 'Get all product limited details successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getAllDetialsProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await productService.getAllDetialsProductById(id);
        res.status(200).json({
            success: true,
            data: product,
            message: 'Product detailed info retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getProductsByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const products = await productService.getProductsByCategory(categoryId);
        res.status(201).json({
            success: true,
            data: products,
            message: 'Get products by category Successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const getBestSellingProducts = async (req, res, next) => {
    try {
        const products = await productService.getBestSellingProducts();
        res.status(201).json({
            success: true,
            data: products,
            message: 'Get best selling products Successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const getLatestProducts = async (req, res, next) => {
    try {
        const products = await productService.getLatestProducts();
        res.status(201).json({
            success: true,
            data: products,
            message: 'Get latest products Successfully'
        });
    }
    catch (error) {
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

// Get product by name (query param `name`)
export const getProductByName = async (req, res, next) => {
    try {
        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Name query parameter is required' });
        }
        const product = await productService.getProductByName(name);
        res.status(200).json({
            success: true,
            data: product,
            message: 'Product retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

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

export const getFilterOptions = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const data = await productService.getFilterOptions(categoryId);
        res.status(200).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

export const getFilteredProducts = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const products = await productService.filterProducts(categoryId, req.body);
        res.status(200).json({ success: true, products });
    } catch (err) {
        next(err);
    }
};

export const updateProductDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await productService.updateProductDetails(id, req.body);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Product details updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files || [];
    const images = await productService.addProductImage(id, files);
    return res.status(201).json({
      success: true,
      data: images,
      message: files.length === 0
        ? 'No images uploaded, current images returned'
        : `${files.length} image(s) added successfully`,
    });
  } catch (error) {
    next(error);
  }
};

export const removeProductImage = async (req, res, next) => {
    // console.log(req.params); // Debug log to check incoming parameters
  try {
    const { id, imageId } = req.params;
    const result = await productService.removeProductImage(id, imageId);
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Image removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { primary_image_id, order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'order array is required',
      });
    }

    const updated = await productService.reorderProductImages(id, primary_image_id, order);
    return res.status(200).json({
      success: true,
      data: updated,
      message: 'Images reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};