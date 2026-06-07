import slugify from 'slugify';
import * as productRepository from './product.repository.js';
import { findCategoryById, findCategoryByName } from '../categories/categories.repository.js';
import { findBrandByName, findBrandById } from '../brands/brand.repository.js';
import { applyActiveOfferPricing } from '../../utils/offerPricing.js';
import pool from "../../config/db.js";
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

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

//
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

//
// update product
// export const updateProductDetails = async (id, productData) => {
//     const client = await pool.connect();
//     let uploadedCloudinaryIds = [];

//     try {
//         await client.query('BEGIN');

//         const existing = await productRepository.findProductById(id);
//         if (!existing) throw new AppError('Product not found', 404);

//         // -----------------------------------
//         // 1. VALIDATION / ID RESOLUTION
//         // -----------------------------------
//         if (productData.product_id &&
//             Number(productData.product_id) !== Number(id)
//         ) {
//             throw new AppError('Product ID mismatch', 400);
//         }

//         if (typeof productData.attributes === "string") {
//             try { productData.attributes = JSON.parse(productData.attributes); }
//             catch { productData.attributes = []; }
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

//         await client.query('COMMIT');

//         return {
//             ...updatedProduct,
//             images: finalImages
//         };

//     } catch (error) {
//         throw error;
//     } finally {
//         client.release();
//     }
// };

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


export const updateProductDetails = async (id, productData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await productRepository.findProductById(id);
    if (!existing) throw new AppError('Product not found', 404);

    if (productData.product_id && Number(productData.product_id) !== Number(id)) {
      throw new AppError('Product ID mismatch', 400);
    }

    if (typeof productData.attributes === 'string') {
      try { productData.attributes = JSON.parse(productData.attributes); }
      catch { productData.attributes = []; }
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

    const mergedProductData = {
      ...existing,
      ...productData,
      slug: productData.name
        ? slugify(productData.name, { lower: true, strict: true })
        : existing.slug,
    };

    const updatedProduct = await productRepository.updateProductFieldsOnly(
      id,
      mergedProductData,
      client
    );

    // Handle attributes if provided
    if (Array.isArray(productData.attributes) && productData.attributes.length > 0) {
        // console.log("id ", id , ' Received attributes for update:', productData.attributes);
        await productRepository.deleteProductAttributes(id, client);

        const attributeValues = await Promise.all(
            productData.attributes.map((attr) =>{
            // console.log('Processing attribute:', attr);
            return productRepository.getAttributeValueById(attr.attribute_value_id, client);
            })
        );

        const validAttributeValues = attributeValues.filter(Boolean);
        await productRepository.insertProductAttributes(id, validAttributeValues, client);
    } else {
        // console.log("id ", id );
        await productRepository.deleteProductAttributes(id, client);
    }

    await client.query('COMMIT');
    return updatedProduct;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const addProductImage = async (productId, files) => {
  const client = await pool.connect();
  const uploadedPublicIds = [];

  try {
    await client.query('BEGIN');

    const existing = await productRepository.findProductById(productId);
    if (!existing) throw new AppError('Product not found', 404);

    // No files sent — return current images as-is
    if (!files || files.length === 0) {
      const currentImages = await productRepository.getImagesById(productId);
      return currentImages.sort((a, b) => a.sort_order - b.sort_order);
    }

    const currentImages = await productRepository.getImagesById(productId);
    const totalAfterUpload = currentImages.length + files.length;

    if (totalAfterUpload > 3) {
      throw new AppError(
        `Cannot add ${files.length} image(s). Product already has ${currentImages.length} image(s). Maximum is 3.`,
        400
      );
    }

    for (const [index, file] of files.entries()) {
      const uploadResult = await uploadToCloudinary(
        file.buffer,
        `product-${productId}-${Date.now()}-${index}`,
        'ecommerce/products'
      );
      uploadedPublicIds.push(uploadResult.public_id);

      const isFirstEver = currentImages.length === 0 && index === 0;

      const newImage = {
        image_url: uploadResult.secure_url,
        product_image_id: uploadResult.public_id,
        is_primary: isFirstEver,
        alt_text: file.originalname,
        sort_order: currentImages.length + index,
      };

      await productRepository.insertSingleImage(productId, newImage, client);
    }

    await client.query('COMMIT');

    const allImages = await productRepository.getImagesById(productId);
    return allImages.sort((a, b) => a.sort_order - b.sort_order);

  } catch (error) {
    await client.query('ROLLBACK');

    if (uploadedPublicIds.length > 0) {
      await Promise.allSettled(
        uploadedPublicIds.map((id) =>
          deleteFromCloudinary(id).catch((err) =>
            console.error('Cloudinary cleanup failed:', err)
          )
        )
      );
    }

    throw error;
  } finally {
    client.release();
  }
};

export const removeProductImage = async (productId, imageId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const image = await productRepository.getImageById(imageId);
    if (!image) throw new AppError('Image not found', 404);
    if (Number(image.product_id) !== Number(productId)) {
      throw new AppError('Image does not belong to this product', 403);
    }

    await productRepository.deleteImageById(imageId, client);

    // If deleted image was primary — promote next image
    if (image.is_primary) {
      const remaining = await productRepository.getImagesById(productId);
      if (remaining.length > 0) {
        await client.query(
          `UPDATE product_images SET is_primary = true WHERE image_id = $1`,
          [remaining[0].image_id]
        );
      }
    }

    await client.query('COMMIT');

    // Cloudinary delete after commit — non-blocking
    if (image.product_image_id) {
      deleteFromCloudinary(image.product_image_id).catch((err) =>
        console.error('Cloudinary delete failed:', image.product_image_id, err)
      );
    }

    return { deleted: true, imageId };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const reorderProductImages = async (productId, primaryImageId, orderedImageIds) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing = await productRepository.findProductById(productId);
    if (!existing) throw new AppError('Product not found', 404);

    const currentImages = await productRepository.getImagesById(productId);
    const currentImageIds = currentImages.map((img) => Number(img.image_id));

    // Validate all IDs belong to this product
    const allValid = orderedImageIds.every((id) =>
      currentImageIds.includes(Number(id))
    );
    if (!allValid) throw new AppError('Invalid image IDs provided', 400);

    if (primaryImageId && !currentImageIds.includes(Number(primaryImageId))) {
      throw new AppError('Primary image does not belong to this product', 400);
    }

    await productRepository.updateImagesOrder(
      productId,
      orderedImageIds.map(Number),
      Number(primaryImageId),
      client
    );

    await client.query('COMMIT');

    const updated = await productRepository.getImagesById(productId);
    return updated.sort((a, b) => a.sort_order - b.sort_order);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};