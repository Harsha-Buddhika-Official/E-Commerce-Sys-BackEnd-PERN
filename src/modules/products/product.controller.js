import * as productService from './product.service.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

const uploadProductImages = async (files = []) => {
    const uploadedImages = [];
    const uploadedCloudinaryIds = [];

    for (const [index, file] of files.entries()) {
        const uploadResult = await uploadToCloudinary(
            file.buffer,
            `product-${Date.now()}-${index + 1}`,
            'ecommerce/products'
        );

        uploadedImages.push({
            image_url: uploadResult.secure_url,
            is_primary: index === 0,
            alt_text: file.originalname,
            sort_order: index
        });
        uploadedCloudinaryIds.push(uploadResult.public_id);
    }

    return { uploadedImages, uploadedCloudinaryIds };
};

export const createProductWithoutAttributes = async (req, res, next) => {
    const uploadedCloudinaryIds = [];

    try {
        const { uploadedImages, uploadedCloudinaryIds: imageIds } = await uploadProductImages(req.files || []);
        uploadedCloudinaryIds.push(...imageIds);

        const newProduct = await productService.createProductWithoutAttributes({
            ...req.body,
            images: uploadedImages
        });

        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully without attributes'
        });
    } catch (error) {
        if (uploadedCloudinaryIds.length > 0) {
            for (const publicId of uploadedCloudinaryIds) {
                try {
                    await deleteFromCloudinary(publicId);
                } catch (deleteError) {
                    console.error('Failed to delete uploaded product image from Cloudinary:', deleteError);
                }
            }
        }
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    let uploadedCloudinaryIds = [];

    try {
        const {
            uploadedImages,
            uploadedCloudinaryIds: imageIds,
        } = await uploadProductImages(req.files ?? []);

        uploadedCloudinaryIds = imageIds;

        const product =
            await productService.createProduct({
                ...req.body,
                images: uploadedImages,
            });

        return res.status(201).json({
            success: true,
            data: product,
            message: "Product created successfully",
        });

    } catch (error) {
        if (uploadedCloudinaryIds.length) {
            await Promise.all(
                uploadedCloudinaryIds.map(async (publicId) => {
                    try {
                        await deleteFromCloudinary(publicId);
                    } catch (cleanupError) {
                        console.error(
                            "Cloudinary cleanup failed:",
                            cleanupError
                        );
                    }
                })
            );
        }

        return next(error);
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

// export const updateProductDetails = async (req, res, next) => {
//     const uploadedCloudinaryIds = [];

//     try {
//         const { id } = req.params;
//         const { uploadedImages, uploadedCloudinaryIds: imageIds } = await uploadProductImages(req.files || []);
//         uploadedCloudinaryIds.push(...imageIds);

//         const updatedProduct = await productService.updateProductDetails(id, {
//             ...req.body,
//             ...(req.files && req.files.length > 0 ? { images: uploadedImages } : {})
//         });

//         res.status(200).json({
//             success: true,
//             data: updatedProduct,
//             message: 'Product details updated successfully'
//         });
//     } catch (error) {
//         if (uploadedCloudinaryIds.length > 0) {
//             for (const publicId of uploadedCloudinaryIds) {
//                 try {
//                     await deleteFromCloudinary(publicId);
//                 } catch (deleteError) {
//                     console.error('Failed to delete uploaded product image from Cloudinary:', deleteError);
//                 }
//             }
//         }
//         next(error);
//     }
// };

// export const updateProductDetails = async (req, res, next) => {

//     let uploadedCloudinaryIds = [];

//     try {
//         const { id } = req.params;
//         const files = req.files ?? [];

//         const { uploadedImages, uploadedCloudinaryIds: imageIds, } = await uploadProductImages(files);
//         uploadedCloudinaryIds = imageIds;

//         const updatePayload = { ...req.body, };

//         // if (uploadedImages.length) { updatePayload.images = uploadedImages; }
//         const existingImages = await productService.getImagesById(id);
        
//         const updatedProduct = await productService.updateProductDetails(id, updatePayload);

//         return res.status(200).json({
//             success: true,
//             data: updatedProduct,
//             message: "Product details updated successfully",
//         });

//     } catch (error) {
//         await Promise.allSettled(
//             uploadedCloudinaryIds.map((publicId) =>
//                 deleteFromCloudinary(publicId)
//             )
//         );

//         return next(error);
//     }
// };

// export const updateProductDetails = async (req, res, next) => {
//     let uploadedCloudinaryIds = [];

//     try {
//         const { id } = req.params;
//         const files = req.files ?? [];

//         const {
//             uploadedImages,
//             uploadedCloudinaryIds: imageIds,
//         } = await uploadProductImages(files);

//         uploadedCloudinaryIds = imageIds;

//         const updatePayload = {
//             ...req.body,
//         };

//         // Existing images from database
//         const existingImages = await productService.getImagesById(id);

//         // Merge existing + newly uploaded images
//         if (uploadedImages.length > 0) {
//             updatePayload.images = [
//                 ...(existingImages || []).map((image) => ({
//                     image_url: image.image_url,
//                     is_primary: Boolean(image.is_primary),
//                     alt_text: image.alt_text || "",
//                     sort_order: Number(image.sort_order ?? 0),
//                 })),
//                 ...uploadedImages.map((image, index) => ({
//                     ...image,
//                     sort_order:
//                         (existingImages?.length || 0) + index,
//                 })),
//             ];
//         }

//         const updatedProduct =
//             await productService.updateProductDetails(
//                 id,
//                 updatePayload
//             );

//         return res.status(200).json({
//             success: true,
//             data: updatedProduct,
//             message: "Product details updated successfully",
//         });

//     } catch (error) {
//         await Promise.allSettled(
//             uploadedCloudinaryIds.map((publicId) =>
//                 deleteFromCloudinary(publicId)
//             )
//         );

//         return next(error);
//     }
// };

export const updateProductDetails = async (req, res, next) => {
    let uploadedCloudinaryIds = [];

    try {
        const { id } = req.params;
        const files = req.files ?? [];

        const {
            uploadedImages,
            uploadedCloudinaryIds: imageIds,
        } = await uploadProductImages(files);

        uploadedCloudinaryIds = imageIds;

        const updatePayload = {
            ...req.body,
        };

        // Get current images
        const existingImages = await productService.getImagesById(id);

        if (uploadedImages.length > 0) {
            // Keep existing images exactly as they are
            const normalizedExistingImages = (existingImages || []).map(
                (image, index) => ({
                    image_url: image.image_url,
                    alt_text: image.alt_text || "",
                    sort_order: Number(image.sort_order ?? index),
                    is_primary: Boolean(image.is_primary),
                })
            );

            // Ensure uploaded images are NEVER primary
            const normalizedUploadedImages = uploadedImages.map(
                (image, index) => ({
                    image_url: image.image_url,
                    alt_text: image.alt_text || "",
                    sort_order:
                        normalizedExistingImages.length + index,
                    is_primary: false,
                })
            );

            const mergedImages = [
                ...normalizedExistingImages,
                ...normalizedUploadedImages,
            ];

            // Safety: allow only ONE primary image
            let primaryFound = false;

            mergedImages.forEach((image) => {
                if (image.is_primary) {
                    if (!primaryFound) {
                        primaryFound = true;
                    } else {
                        image.is_primary = false;
                    }
                }
            });

            // If somehow no primary exists, make first image primary
            if (!primaryFound && mergedImages.length > 0) {
                mergedImages[0].is_primary = true;
            }

            updatePayload.images = mergedImages;
        }

        const updatedProduct =
            await productService.updateProductDetails(
                id,
                updatePayload
            );

        return res.status(200).json({
            success: true,
            data: updatedProduct,
            message: "Product details updated successfully",
        });

    } catch (error) {
        await Promise.allSettled(
            uploadedCloudinaryIds.map((publicId) =>
                deleteFromCloudinary(publicId)
            )
        );

        return next(error);
    }
};

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
