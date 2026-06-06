import slugify from 'slugify';
import * as productRepository from './product.repository.js';
import { findCategoryById, findCategoryByName } from '../categories/categories.repository.js';
import { findBrandByName, findBrandById } from '../brands/brand.repository.js';
import { applyActiveOfferPricing } from '../../utils/offerPricing.js';
import pool from "../../config/db.js";
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

// create product with transaction
// export const createProduct = async (productData) => {
//     const client = await pool.connect();
//     try {
//         await client.query("BEGIN");
//         if (!productData.name) {
//             throw new AppError("Product name is required", 400);
//         }

//         // Check if product with same name exists
//         const existing = await productRepository.findProductByName(productData.name, client);
//         if (existing) {
//             throw new AppError("Product with this name already exists", 409);
//         }

//         // Check if category exists
//         const categoryNameCheck = await findCategoryByName(productData.category_name);
//         if (!categoryNameCheck) {
//             throw new AppError("Category not found", 404);
//         }
//         productData.category_id = categoryNameCheck.category_id;

//         // Check if brand exists
//         const brandNameCheck = await findBrandByName(productData.brand_name);
//         if (!brandNameCheck) {
//             throw new AppError("Brand not found", 404);
//         }
//         productData.brand_id = brandNameCheck.brand_id;

//         const { images, attributes, ...productFields } = productData;
//         productFields.slug = slugify(productFields.name, { lower: true, strict: true });

//         // Insert product
//         const product = await productRepository.createProduct(productFields, client);

//         // Insert images
//         if (images && images.length > 0) {
//             const primaryImages = images.filter(img => img.is_primary);
//             if (primaryImages.length > 1) {
//                 throw new AppError("Only one primary image allowed", 400);
//             }
//             await productRepository.insertProductImages(product.product_id, images, client);
//         }

//         // Insert product attributes mapping
//         if (attributes && attributes.length > 0) {
//             await productRepository.insertProductAttributes(product.product_id, attributes, client);
//         }

//         await client.query("COMMIT");
//         return product;

//     } catch (error) {
//         await client.query("ROLLBACK");
//         throw error;
//     } finally {
//         client.release();
//     }
// };

// export const createProductWithoutAttributes = async (productData) => {
//     const client = await pool.connect();
//     try {
//         await client.query("BEGIN");
//         if (!productData.name) {
//             throw new AppError("Product name is required", 400);
//         }

//         const existing = await productRepository.findProductByName(productData.name, client);
//         if (existing) {
//             throw new AppError("Product with this name already exists", 409);
//         }

//         const categoryNameCheck = await findCategoryByName(productData.category_name);
//         if (!categoryNameCheck) {
//             throw new AppError("Category not found", 404);
//         }
//         productData.category_id = categoryNameCheck.category_id;

//         const brandNameCheck = await findBrandByName(productData.brand_name);
//         if (!brandNameCheck) {
//             throw new AppError("Brand not found", 404);
//         }
//         productData.brand_id = brandNameCheck.brand_id;

//         const { images, ...productFields } = productData;
//         productFields.slug = slugify(productFields.name, { lower: true, strict: true });

//         const product = await productRepository.createProduct(productFields, client);

//         if (images && images.length > 0) {
//             const primaryImages = images.filter(img => img.is_primary);
//             if (primaryImages.length > 1) {
//                 throw new AppError("Only one primary image allowed", 400);
//             }
//             await productRepository.insertProductImages(product.product_id, images, client);
//         }

//         await client.query("COMMIT");
//         return product;

//     } catch (error) {
//         await client.query("ROLLBACK");
//         throw error;
//     } finally {
//         client.release();
//     }
// };


// ─────────────────────────────────────────────
// CLOUDINARY UPLOAD
// ─────────────────────────────────────────────
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


// ─────────────────────────────────────────────
// CREATE PRODUCT (WITH ATTRIBUTES)
// ─────────────────────────────────────────────
export const createProduct = async ({ body, files }) => {
    const client = await pool.connect();

    let uploadedCloudinaryIds = [];

    try {
        await client.query("BEGIN");

        const { uploadedImages, uploadedCloudinaryIds: ids } =
            await uploadProductImages(files);

        uploadedCloudinaryIds = ids;

        if (!body.name) {
            throw new AppError("Product name is required", 400);
        }

        const existing = await productRepository.findProductByName(body.name, client);
        if (existing) throw new AppError("Product already exists", 409);

        const category = await findCategoryByName(body.category_name);
        if (!category) throw new AppError("Category not found", 404);

        const brand = await findBrandByName(body.brand_name);
        if (!brand) throw new AppError("Brand not found", 404);

        const { attributes, ...productFields } = body;

        productFields.category_id = category.category_id;
        productFields.brand_id = brand.brand_id;
        productFields.slug = slugify(body.name, { lower: true, strict: true });

        const product = await productRepository.createProduct(productFields, client);

        if (uploadedImages.length > 0) {
            await productRepository.insertProductImages(
                product.product_id,
                uploadedImages,
                client
            );
        }

        if (attributes?.length) {
            await productRepository.insertProductAttributes(
                product.product_id,
                attributes,
                client
            );
        }

        await client.query("COMMIT");
        return product;

    } catch (error) {
        await client.query("ROLLBACK");

        // cleanup cloudinary
        await Promise.allSettled(
            uploadedCloudinaryIds.map(id => deleteFromCloudinary(id))
        );

        throw error;
    } finally {
        client.release();
    }
};


// ─────────────────────────────────────────────
// CREATE PRODUCT (WITHOUT ATTRIBUTES)
// ─────────────────────────────────────────────
export const createProductWithoutAttributes = async ({ body, files }) => {
    const client = await pool.connect();

    let uploadedCloudinaryIds = [];

    try {
        await client.query("BEGIN");

        const { uploadedImages, uploadedCloudinaryIds: ids } =
            await uploadProductImages(files);

        uploadedCloudinaryIds = ids;

        if (!body.name) {
            throw new AppError("Product name is required", 400);
        }

        const existing = await productRepository.findProductByName(body.name, client);
        if (existing) throw new AppError("Product already exists", 409);

        const category = await findCategoryByName(body.category_name);
        if (!category) throw new AppError("Category not found", 404);

        const brand = await findBrandByName(body.brand_name);
        if (!brand) throw new AppError("Brand not found", 404);

        const { attributes, ...productFields } = body;

        productFields.category_id = category.category_id;
        productFields.brand_id = brand.brand_id;
        productFields.slug = slugify(body.name, { lower: true, strict: true });

        const product = await productRepository.createProduct(productFields, client);

        if (uploadedImages.length > 0) {
            await productRepository.insertProductImages(
                product.product_id,
                uploadedImages,
                client
            );
        }

        await client.query("COMMIT");
        return product;

    } catch (error) {
        await client.query("ROLLBACK");

        await Promise.allSettled(
            uploadedCloudinaryIds.map(id => deleteFromCloudinary(id))
        );

        throw error;
    } finally {
        client.release();
    }
};

export const getAllProductsDetailsSimple = async () => {
    const products = await productRepository.getAllProductsDetailsSimple();
    if (products.length === 0) {
        throw new AppError('No products found', 404);
    }
    return products;
};

// get all products
export const getAllProducts = async () => {
    const products = await productRepository.getAllProducts();
    if (products.length === 0) {
        throw new AppError('No products found', 404);
    }
    return products;
}

export const getAllProductLimitedDetilas = async () => {
    const products = await productRepository.getAllProductLimitedDetilas();
    if (products.length === 0) {
        throw new AppError('No products found', 404);
    }
    return products;
};

export const getAllDetialsProductById = async (id) => {
    const products = await productRepository.getAllDetialsProductById(id);
    if (!products) {
        throw new AppError('Product not found', 404);
    }
    return applyActiveOfferPricing(products)
    };

export const getProductsByCategory = async (categoryId) => {
    const products = await productRepository.getProductsByCategory(categoryId);
    if (products.length === 0) {
        throw new AppError('No products found for this category', 404);
    }

    return Promise.all(products.map((product) => applyActiveOfferPricing(product)));
}

export const getBestSellingProducts = async () => {
    const products = await productRepository.getBestSellingProducts();
    if (products.length === 0) {
        throw new AppError('No best selling products found', 404);
    }
    return Promise.all(products.map((product) => applyActiveOfferPricing(product)));
}

export const getLatestProducts = async () => {
    const products = await productRepository.getLatestProducts();
    if (products.length === 0) {
        throw new AppError('No latest products found', 404);
    }
    return Promise.all(products.map((product) => applyActiveOfferPricing(product)));
}

// get product by id
export const getProductById = async (id) => {
    const product = await productRepository.findProductById(id);
    if (!product) {
        throw new AppError('Product not found', 404);
    }
    return applyActiveOfferPricing(product);
}

export const getImagesById = async (id) => {
    const images = await productRepository.getImagesById(id);
    return images
}

// get product by name (returns minimal fields)
export const getProductByName = async (name) => {
    if (!name) {
        throw new AppError('Product name is required', 400);
    }
    const product = await productRepository.findProductByNameForSearch(name);
    if (!product) {
        throw new AppError('Product not found', 404);
    }
    return product;
};

// update product with transaction
// export const updateProduct = async (id, productData) => {
//     const client = await pool.connect();
//     try {
//         await client.query("BEGIN");

//         const existing = await productRepository.findProductById(id);
//         if (!existing) {
//             throw new AppError('Product not found', 404);
//         }

//         // Convert category name to ID if provided
//         if (productData.category_name && !productData.category_id) {
//             const categoryNameCheck = await findCategoryByName(productData.category_name);
//             if (!categoryNameCheck) {
//                 throw new AppError("Category not found", 404);
//             }
//             productData.category_id = categoryNameCheck.category_id;
//         }

//         // Convert brand name to ID if provided
//         if (productData.brand_name && !productData.brand_id) {
//             const brandNameCheck = await findBrandByName(productData.brand_name);
//             if (!brandNameCheck) {
//                 throw new AppError("Brand not found", 404);
//             }
//             productData.brand_id = brandNameCheck.brand_id;
//         }

//         if (productData.name && productData.name !== existing.name) {
//             const nameExists = await productRepository.findProductByName(productData.name, client);
//             if (nameExists) {
//                 throw new AppError('Product with this name is already exists', 409);
//             }
//         }

//         // Check if category exists (if provided)
//         if (productData.category_id && productData.category_id !== existing.category_id) {
//             const categoryIdCheck = await findCategoryById(productData.category_id);
//             if (!categoryIdCheck) {
//                 throw new AppError("Category not found", 404);
//             }
//         }

//         // Check if brand exists (if provided)
//         if (productData.brand_id && productData.brand_id !== existing.brand_id) {
//             const brandIdCheck = await findBrandById(productData.brand_id);
//             if (!brandIdCheck) {
//                 throw new AppError("Brand not found", 404);
//             }
//         }

//         const { images, attributes, category_name, brand_name, ...productFields } = productData;
//         productFields.is_active = productData.is_active ?? existing.is_active;
//         if (productFields.name) {
//             productFields.slug = slugify(productFields.name, { lower: true, strict: true });
//         }

//         // Update product
//         const updatedProduct = await productRepository.updateProduct(id, productFields, client);

//         // Handle images if provided
//         if (images && Array.isArray(images)) {
//             const primaryImages = images.filter(img => img.is_primary);
//             if (primaryImages.length > 1) {
//                 throw new AppError("Only one primary image allowed", 400);
//             }
//             // Delete old images
//             await productRepository.deleteProductImages(id, client);
//             // Insert new images
//             if (images.length > 0) {
//                 await productRepository.insertProductImages(id, images, client);
//             }
//         }

//         // Replace product attributes if payload is provided
//         if (attributes && Array.isArray(attributes)) {
//             await productRepository.deleteProductAttributes(id, client);
//             if (attributes.length > 0) {
//                 await productRepository.insertProductAttributes(id, attributes, client);
//             }
//         }

//         await client.query("COMMIT");
//         return updatedProduct;

//     } catch (error) {
//         await client.query("ROLLBACK");
//         throw error;
//     } finally {
//         client.release();
//     }
// }

// export const updateProductDetails = async (id, productData) => {
//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         const existing = await productRepository.findProductById(id);
//         if (!existing) throw new AppError('Product not found', 404);

//         // basic validations and name/ids resolution
//         if (productData.product_id && Number(productData.product_id) !== Number(id)) {
//             throw new AppError('Product ID does not match the route parameter', 400);
//         }

//         await resolveNamesToIds(productData);
//         await ensureNameUnique(id, productData.name, client, existing.name);
//         await validateProvidedIds(productData, existing);

//         const mergedProductData = mergeProductFields(existing, productData);
//         const updatedProduct = await productRepository.updateProduct(id, mergedProductData, client);

//         if (productData.images !== undefined) {
//             await replaceImages(id, productData.images, client);
//         }

//         if (productData.attributes !== undefined) {
//             const normalized = await normalizeAttributes(productData.attributes, client);
//             await replaceAttributes(id, normalized, client);
//         }

//         await client.query('COMMIT');
//         return updatedProduct;
//     } catch (error) {
//         await client.query('ROLLBACK');
//         throw error;
//     } finally {
//         client.release();
//     }
// };

// export const updateProductDetails = async (id, productData) => {
//     const client = await pool.connect();

//     try {
//         await client.query('BEGIN');

//         const existing = await productRepository.findProductById(id);
//         if (!existing) throw new AppError('Product not found', 404);
//         const imageDetails = await productRepository.getImagesById(id)
//         console.log("excisting images", imageDetails) //debuging 
//         const files = productData.files || [];
//         console.log("new images details", files) //debuging
//         // -----------------------------------
//         // 1. UPLOAD IMAGES
//         // -----------------------------------
//         let uploadedImages = [];
//         let uploadedCloudinaryIds = [];

//         if (files.length > 0) {
//             for (const [index, file] of files.entries()) {
//                 const uploadResult = await uploadToCloudinary(
//                     file.buffer,
//                     `product-${Date.now()}-${index + 1}`,
//                     'ecommerce/products'
//                 );

//                 uploadedImages.push({
//                     image_url: uploadResult.secure_url,
//                     is_primary: false,
//                     alt_text: file.originalname,
//                     sort_order: imageDetails.length + index
//                 });

//                 uploadedCloudinaryIds.push(uploadResult.public_id);
//             }
//         }

//         // -----------------------------------
//         // 2. VALIDATION / ID RESOLUTION
//         // -----------------------------------
//         if (productData.product_id &&
//             Number(productData.product_id) !== Number(id)
//         ) {
//             throw new AppError('Product ID mismatch', 400);
//         }

//         if (productData.category_name && !productData.category_id) {
//             const category = await findCategoryByName(productData.category_name);
//             if (!category) throw new AppError('Category not found', 404);
//             productData.category_id = category.category_id;
//         }

//         if (productData.brand_name && !productData.brand_id) {
//             const brand = await findBrandByName(productData.brand_name);
//             if (!brand) throw new AppError('Brand not found', 404);
//             productData.brand_id = brand.brand_id;
//         }

//         // -----------------------------------
//         // 3. MERGE EXISTING + NEW IMAGES
//         // -----------------------------------
//         let mergedImages = [...(existing.images || [])];

//         if (uploadedImages.length > 0) {
//             mergedImages = [...mergedImages, ...uploadedImages];
//         }

//         // enforce only ONE primary image
//         let primaryFound = mergedImages.some(i => i.is_primary);

//         if (!primaryFound && mergedImages.length > 0) {
//             mergedImages[0].is_primary = true;
//         }

//         // -----------------------------------
//         // 4. UPDATE PRODUCT FIELDS
//         // -----------------------------------
//         const { images, files: _, ...rest } = productData;

//         const mergedProductData = {
//             ...existing,
//             ...rest,
//             images: mergedImages,
//             slug: productData.name
//                 ? slugify(productData.name, { lower: true, strict: true })
//                 : existing.slug
//         };

//         const updatedProduct = await productRepository.updateProduct(
//             id,
//             mergedProductData,
//             client
//         );

//         await client.query('COMMIT');

//         return {
//             ...updatedProduct,
//             images: mergedImages
//         };

//     } catch (error) {
//         await client.query('ROLLBACK');

//         throw error;
//     } finally {
//         client.release();
//     }
// };

// export const updateProductDetails = async (id, productData) => {
//     const client = await pool.connect();
//     let uploadedCloudinaryIds = []; // track for rollback

//     try {
//         await client.query('BEGIN');

//         const existing = await productRepository.findProductById(id);
//         if (!existing) throw new AppError('Product not found', 404);

//         const existingImages = await productRepository.getImagesById(id);
//         const files = productData.files || [];

//         // -----------------------------------
//         // 1. VALIDATION / ID RESOLUTION
//         // -----------------------------------
//         if (productData.product_id &&
//             Number(productData.product_id) !== Number(id)
//         ) {
//             throw new AppError('Product ID mismatch', 400);
//         }

//         if (productData.category_name && !productData.category_id) {
//             const category = await findCategoryByName(productData.category_name);
//             if (!category) throw new AppError('Category not found', 404);
//             productData.category_id = category.category_id;
//         }

//         if (productData.brand_name && !productData.brand_id) {
//             const brand = await findBrandByName(productData.brand_name);
//             if (!brand) throw new AppError('Brand not found', 404);
//             productData.brand_id = brand.brand_id;
//         }

//         // -----------------------------------
//         // 2. UPLOAD NEW IMAGES (if any)
//         // -----------------------------------
//         let finalImages;

//         if (files.length > 0) {
//             // Upload new images first
//             const uploadedImages = [];

//             for (const [index, file] of files.entries()) {
//                 const uploadResult = await uploadToCloudinary(
//                     file.buffer,
//                     `product-${Date.now()}-${index + 1}`,
//                     'ecommerce/products'
//                 );

//                 uploadedCloudinaryIds.push(uploadResult.public_id);

//                 uploadedImages.push({
//                     image_url: uploadResult.secure_url,
//                     cloudinary_public_id: uploadResult.public_id,
//                     is_primary: false,
//                     alt_text: file.originalname,
//                     sort_order: index
//                 });
//             }

//             // -----------------------------------
//             // 3. DELETE OLD IMAGES FROM CLOUDINARY
//             // -----------------------------------
//             const oldPublicIds = existingImages
//                 .map(img => img.cloudinary_public_id)
//                 .filter(Boolean); // only if you store public_id in DB

//             if (oldPublicIds.length > 0) {
//                 await deleteFromCloudinary(oldPublicIds); // implement this helper
//             }

//             // New images fully replace the old ones
//             uploadedImages[0].is_primary = true; // first new image is primary
//             finalImages = uploadedImages;

//         } else {
//             // No new files — keep existing images as-is
//             finalImages = existingImages;
//         }

//         // -----------------------------------
//         // 4. UPDATE PRODUCT FIELDS + IMAGES IN DB
//         // -----------------------------------
//         const { images, files: _, ...rest } = productData;

//         const mergedProductData = {
//             ...existing,
//             ...rest,
//             images: finalImages,
//             slug: productData.name
//                 ? slugify(productData.name, { lower: true, strict: true })
//                 : existing.slug
//         };

//         // Repository must: UPDATE product fields, DELETE old image rows, INSERT new ones
//         const updatedProduct = await productRepository.updateProduct(
//             id,
//             mergedProductData,
//             client
//         );

//         await client.query('COMMIT');

//         return {
//             ...updatedProduct,
//             images: finalImages
//         };

//     } catch (error) {
//         await client.query('ROLLBACK');

//         // If DB failed AFTER uploading to Cloudinary, clean up the new uploads
//         if (uploadedCloudinaryIds.length > 0) {
//             await deleteFromCloudinary(uploadedCloudinaryIds).catch(err =>
//                 console.error('Cloudinary cleanup failed after rollback:', err)
//             );
//         }

//         throw error;
//     } finally {
//         client.release();
//     }
// };

export const updateProductDetails = async (id, productData) => {
    const client = await pool.connect();
    let uploadedCloudinaryIds = [];

    try {
        await client.query('BEGIN');

        const existing = await productRepository.findProductById(id);
        if (!existing) throw new AppError('Product not found', 404);

        const existingImages = await productRepository.getImagesById(id);
        const files = productData.files || [];

        // -----------------------------------
        // 1. VALIDATION / ID RESOLUTION
        // -----------------------------------
        if (productData.product_id &&
            Number(productData.product_id) !== Number(id)
        ) {
            throw new AppError('Product ID mismatch', 400);
        }

        if (productData.category_name && !productData.category_id) {
            const category = await findCategoryByName(productData.category_name);
            if (!category) throw new AppError('Category not found', 404);
            productData.category_id = category.category_id;
        }

        if (productData.brand_name && !productData.brand_id) {
            const brand = await findBrandByName(productData.brand_name);
            if (!brand) throw new AppError('Brand not found', 404);
            productData.brand_id = brand.brand_id;
        }

        // -----------------------------------
        // 2. UPLOAD NEW IMAGES & APPEND
        // -----------------------------------
        let finalImages = [...existingImages]; // always start with existing

        if (files.length > 0) {
            const uploadedImages = [];

            for (const [index, file] of files.entries()) {
                const uploadResult = await uploadToCloudinary(
                    file.buffer,
                    `product-${Date.now()}-${index + 1}`,
                    'ecommerce/products'
                );

                uploadedCloudinaryIds.push(uploadResult.public_id);

                uploadedImages.push({
                    image_url:        uploadResult.secure_url,
                    product_image_id: uploadResult.public_id,
                    is_primary:       false,           // will be resolved below
                    alt_text:         file.originalname,
                    sort_order:       existingImages.length + index  // append after existing
                });
            }

            // Append new images after existing ones
            finalImages = [...existingImages, ...uploadedImages];
        }

        // -----------------------------------
        // 3. ENFORCE EXACTLY ONE PRIMARY
        //    First image in the array is always primary, rest are false
        // -----------------------------------
        finalImages = finalImages.map((img, index) => ({
            ...img,
            is_primary: index === 0
        }));

        // -----------------------------------
        // 4. UPDATE PRODUCT + IMAGES IN DB
        // -----------------------------------
        const { images, files: _, ...rest } = productData;

        const mergedProductData = {
            ...existing,
            ...rest,
            images: finalImages,
            slug: productData.name
                ? slugify(productData.name, { lower: true, strict: true })
                : existing.slug
        };

        const updatedProduct = await productRepository.updateProduct(
            id,
            mergedProductData,
            client
        );

        await client.query('COMMIT');

        return {
            ...updatedProduct,
            images: finalImages
        };

    } catch (error) {
        await client.query('ROLLBACK');

        // Clean up any newly uploaded Cloudinary assets on failure
        if (uploadedCloudinaryIds.length > 0) {
            await deleteFromCloudinary(uploadedCloudinaryIds).catch(err =>
                console.error('Cloudinary cleanup failed after rollback:', err)
            );
        }

        throw error;
    } finally {
        client.release();
    }
};

// ---- Helper functions exported for clarity and testing ----
export const resolveNamesToIds = async (productData) => {
    if (productData.category_name && !productData.category_id) {
        const category = await findCategoryByName(productData.category_name);
        if (!category) throw new AppError('Category not found', 404);
        productData.category_id = category.category_id;
    }

    if (productData.brand_name && !productData.brand_id) {
        const brand = await findBrandByName(productData.brand_name);
        if (!brand) throw new AppError('Brand not found', 404);
        productData.brand_id = brand.brand_id;
    }
};

export const ensureNameUnique = async (id, name, client = pool, existingName = null) => {
    if (!name) return;
    if (name === existingName) return;
    const found = await productRepository.findProductByName(name, client);
    if (found) throw new AppError('Product with this name is already exists', 409);
};

export const validateProvidedIds = async (productData, existing) => {
    if (productData.category_id && productData.category_id !== existing.category_id) {
        const category = await findCategoryById(productData.category_id);
        if (!category) throw new AppError('Category not found', 404);
    }

    if (productData.brand_id && productData.brand_id !== existing.brand_id) {
        const brand = await findBrandById(productData.brand_id);
        if (!brand) throw new AppError('Brand not found', 404);
    }
};

export const mergeProductFields = (existing, productData) => ({
    name: productData.name ?? existing.name,
    brand_id: productData.brand_id ?? existing.brand_id,
    category_id: productData.category_id ?? existing.category_id,
    slug: productData.slug ?? slugify(productData.name ?? existing.name, { lower: true, strict: true }),
    description: productData.description ?? existing.description,
    base_price: productData.base_price ?? existing.base_price,
    selling_price: productData.selling_price ?? existing.selling_price,
    discounted_price: productData.discounted_price ?? existing.discounted_price,
    stock_quantity: productData.stock_quantity ?? existing.stock_quantity,
    warranty_months: productData.warranty_months ?? existing.warranty_months,
    product_tag: productData.product_tag ?? existing.product_tag,
    is_active: productData.is_active ?? existing.is_active,
});

export const normalizeAttributes = async (attributes, client = pool) => {
    const normalized = [];
    const list = Array.isArray(attributes) ? attributes : [];
    for (const attr of list) {
        const attributeValue = await productRepository.getAttributeValueById(attr.attribute_value_id, client);
        if (!attributeValue) throw new AppError('Attribute value not found', 404);
        if (Number(attributeValue.attribute_id) !== Number(attr.attribute_id)) {
            throw new AppError('Attribute value does not belong to the provided attribute', 400);
        }
        normalized.push({
            attribute_id: attr.attribute_id,
            attribute_value_id: attr.attribute_value_id,
            value: attributeValue.value,
        });
    }
    return normalized;
};

export const replaceImages = async (productId, images, client = pool) => {
    const imgs = Array.isArray(images) ? images : [];
    const primary = imgs.filter(i => i.is_primary);
    if (primary.length > 1) throw new AppError('Only one primary image allowed', 400);
    await productRepository.deleteProductImages(productId, client);
    if (imgs.length > 0) await productRepository.insertProductImages(productId, imgs, client);
};

export const replaceAttributes = async (productId, normalizedAttributes, client = pool) => {
    await productRepository.deleteProductAttributes(productId, client);
    if (normalizedAttributes && normalizedAttributes.length > 0) {
        await productRepository.insertProductAttributes(productId, normalizedAttributes, client);
    }
};

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

export const getFilterOptions = async (categoryId) => {
    const rows = await productRepository.getAttributesByCategory(categoryId);

    if (!rows.length) throw new AppError('No filter options found for this category', 404);

    const map = new Map();
    for (const row of rows) {
        if (!map.has(row.attribute_id)) {
            map.set(row.attribute_id, {
                attributeId: row.attribute_id,
                name: row.attribute_name,
                values: [],
            });
        }
        map.get(row.attribute_id).values.push({
            value: row.value,
            count: parseInt(row.product_count, 10),
        });
    }

    return Array.from(map.values());
};

export const getAttributesByCategory = async (categoryId) => {
    const rows = await productRepository.getAttributesByCategory(categoryId);
    if (!rows || rows.length === 0) {
        throw new AppError('No attributes found for this category', 404);
    }
    return rows;
};

export const filterProducts = async (categoryId, body) => {
    // body comes parsed from req.body — no JSON.parse needed
    const priceMin = body.priceMin !== undefined ? parseFloat(body.priceMin) : undefined;
    const priceMax = body.priceMax !== undefined ? parseFloat(body.priceMax) : undefined;

    const attributeFilters = Array.isArray(body.attributeFilters)
        ? body.attributeFilters.map(f => ({
            attributeId: Number(f.attributeId),
            values: Array.isArray(f.values) ? f.values : [f.values],
        }))
        : [];

    const products = await productRepository.getFilteredProducts({
        categoryId: parseInt(categoryId, 10),
        attributeFilters,
        priceMin,
        priceMax,
    });

    if (!products.length) throw new AppError('No products found matching the selected filters', 404);

    return products;
};
