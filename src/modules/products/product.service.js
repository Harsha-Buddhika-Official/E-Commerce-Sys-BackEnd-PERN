import slugify from 'slugify';
import * as productRepository from './product.repository.js';
import { findCategoryById, findCategoryByName } from '../categories/categories.repository.js';
import { findBrandByName } from '../brands/brand.repository.js';
import { applyOfferToProduct, applyOffersToProducts } from '../../utils/offerPricing.js';
import pool from '../../config/db.js';
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

/* =========================================================
   CLOUDINARY HELPERS
========================================================= */

//using
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

/* =========================================================
   CREATE PRODUCT (WITH ATTRIBUTES)
========================================================= */

export const createProduct = async ({ body, files }) => {
  const client = await pool.connect();
  let uploadedCloudinaryIds = [];

  try {
    await client.query('BEGIN');

    const { uploadedImages, uploadedCloudinaryIds: ids } =
      await uploadProductImages(files);

    uploadedCloudinaryIds = ids;

    if (!body.name) throw new AppError('Product name is required', 400);

    const existing = await productRepository.findProductByName(body.name, client);
    if (existing) throw new AppError('Product already exists', 409);

    const category = await findCategoryByName(body.category_name);
    if (!category) throw new AppError('Category not found', 404);

    const brand = await findBrandByName(body.brand_name);
    if (!brand) throw new AppError('Brand not found', 404);

    const { attributes, ...productFields } = body;

    productFields.category_id = category.category_id;
    productFields.brand_id = brand.brand_id;
    productFields.slug = slugify(body.name, { lower: true, strict: true });

    const product = await productRepository.createProduct(productFields, client);

    if (uploadedImages.length) {
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

    await client.query('COMMIT');
    return product;

  } catch (error) {
    await client.query('ROLLBACK');
    await Promise.allSettled(
      uploadedCloudinaryIds.map(id => deleteFromCloudinary(id))
    );
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   CREATE PRODUCT (WITHOUT ATTRIBUTES)
========================================================= */

//using
export const createProductWithoutAttributes = async ({ body, files }) => {
  const client = await pool.connect();
  let uploadedCloudinaryIds = [];

  try {
    await client.query('BEGIN');

    const { uploadedImages, uploadedCloudinaryIds: ids } =
      await uploadProductImages(files);

    uploadedCloudinaryIds = ids;

    if (!body.name) throw new AppError('Product name is required', 400);

    const existing = await productRepository.findProductByName(body.name, client);
    if (existing) throw new AppError('Product already exists', 409);

    const category = await findCategoryByName(body.category_name);
    if (!category) throw new AppError('Category not found', 404);

    const brand = await findBrandByName(body.brand_name);
    if (!brand) throw new AppError('Brand not found', 404);

    const { attributes, ...productFields } = body;

    productFields.category_id = category.category_id;
    productFields.brand_id = brand.brand_id;
    productFields.slug = slugify(body.name, { lower: true, strict: true });

    const product = await productRepository.createProduct(productFields, client);

    if (uploadedImages.length) {
      await productRepository.insertProductImages(
        product.product_id,
        uploadedImages,
        client
      );
    }

    await client.query('COMMIT');
    return product;

  } catch (error) {
    await client.query('ROLLBACK');
    await Promise.allSettled(
      uploadedCloudinaryIds.map(id => deleteFromCloudinary(id))
    );
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   GET PRODUCTS
========================================================= */

//using
export const getAllProducts = async () => {
  const products = await productRepository.getAllProducts();
  if (!products.length) throw new AppError('No products found', 404);
  return products;
};

//using
export const getAllProductsDetailsSimple = async () => {
  const products = await productRepository.getAllProductsDetailsSimple();
  if (!products.length) throw new AppError('No products found', 404);
  return products;
};

//using
export const getAllProductLimitedDetilas = async () => {
  const products = await productRepository.getAllProductLimitedDetilas();
  if (!products.length) throw new AppError('No products found', 404);
  return products;
};

//using
export const getAllDetialsProductById = async (id) => {
  const product = await productRepository.getAllDetialsProductById(id);
  if (!product) throw new AppError('Product not found', 404);
  return applyOfferToProduct(product);
};

//using
export const getProductById = async (id) => {
  const product = await productRepository.findProductById(id);
  if (!product) throw new AppError('Product not found', 404);
  return applyOfferToProduct(product);
};

//using
export const getProductByName = async (name) => {
  if (!name) throw new AppError('Product name is required', 400);

  const product =
    await productRepository.findProductByNameForSearch(name);

  if (!product) throw new AppError('Product not found', 404);

  return product;
};

/* =========================================================
   FILTER / CATEGORY / SPECIAL LISTS
========================================================= */

//using
export const getProductsByCategory = async (categoryId) => {
  const products = await productRepository.getProductsByCategory(categoryId);
  if (!products.length) throw new AppError('No products found', 404);

  return applyOffersToProducts(products);
};

//using
export const getBestSellingProducts = async () => {
  const products = await productRepository.getBestSellingProducts();
  if (!products.length) throw new AppError('No products found', 404);

  return applyOffersToProducts(products);
};

//using
export const getLatestProducts = async () => {
  const products = await productRepository.getLatestProducts();
  if (!products.length) throw new AppError('No products found', 404);

  return applyOffersToProducts(products);
};

/* =========================================================
   PRODUCT DELETE / RESTORE
========================================================= */

//using
export const deleteProduct = async (id) => {
  const existing = await productRepository.findProductById(id);
  if (!existing) throw new AppError('Product not found', 404);

  return productRepository.deleteProduct(id);
};

/* =========================================================
   ATTRIBUTES
========================================================= */

export const removeProductAttribute = async (productId, attributeId) => {
  const existing = await productRepository.findProductById(productId);
  if (!existing) throw new AppError('Product not found', 404);

  const deleted =
    await productRepository.removeProductAttribute(productId, attributeId);

  if (!deleted)
    throw new AppError('Product attribute not found', 404);

  return deleted;
};

export const getAttributesByCategory = async (categoryId) => {
  const rows =
    await productRepository.getAttributesByCategory(categoryId);

  if (!rows.length)
    throw new AppError('No attributes found', 404);

  return rows;
};

//using
export const getFilterOptions = async (categoryId) => {
  const rows =
    await productRepository.getAttributesByCategory(categoryId);

  if (!rows.length)
    throw new AppError('No filter options found', 404);

  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.attribute_id)) {
      map.set(row.attribute_id, {
        attributeId: row.attribute_id,
        name: row.attribute_name,
        values: []
      });
    }

    map.get(row.attribute_id).values.push({
      value: row.value,
      count: parseInt(row.product_count, 10)
    });
  }

  return Array.from(map.values());
};

//using
export const filterProducts = async (categoryId, body) => {
  const priceMin = body.priceMin ? parseFloat(body.priceMin) : undefined;
  const priceMax = body.priceMax ? parseFloat(body.priceMax) : undefined;

  const attributeFilters = Array.isArray(body.attributeFilters)
    ? body.attributeFilters.map(f => ({
      attributeId: Number(f.attributeId),
      values: Array.isArray(f.values) ? f.values : [f.values]
    }))
    : [];

  const products =
    await productRepository.getFilteredProducts({
      categoryId: parseInt(categoryId, 10),
      attributeFilters,
      priceMin,
      priceMax
    });

  if (!products.length)
    throw new AppError('No products found', 404);

  return products;
};

/* =========================================================
   UPDATE PRODUCT (CORE FIXED VERSION)
========================================================= */

//using
export const updateProductDetails = async (id, productData) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existing =
      await productRepository.findProductById(id);

    if (!existing)
      throw new AppError('Product not found', 404);

    if (
      productData.product_id &&
      Number(productData.product_id) !== Number(id)
    ) {
      throw new AppError('Product ID mismatch', 400);
    }

    if (typeof productData.attributes === 'string') {
      try {
        productData.attributes = JSON.parse(productData.attributes);
      } catch {
        productData.attributes = [];
      }
    }

    if (productData.category_name && !productData.category_id) {
      const category =
        await findCategoryByName(productData.category_name);

      if (!category)
        throw new AppError('Category not found', 404);

      productData.category_id = category.category_id;
    }

    if (productData.brand_name && !productData.brand_id) {
      const brand =
        await findBrandByName(productData.brand_name);

      if (!brand)
        throw new AppError('Brand not found', 404);

      productData.brand_id = brand.brand_id;
    }

    const merged = {
      ...existing,
      ...productData,
      slug: productData.name
        ? slugify(productData.name, { lower: true, strict: true })
        : existing.slug
    };

    const updated =
      await productRepository.updateProductFieldsOnly(
        id,
        merged,
        client
      );

    // attributes replace
    await productRepository.deleteProductAttributes(id, client);

    if (Array.isArray(productData.attributes) &&
      productData.attributes.length > 0) {

      const values = await Promise.all(
        productData.attributes.map(attr =>
          productRepository.getAttributeValueById(
            attr.attribute_value_id,
            client
          )
        )
      );

      await productRepository.insertProductAttributes(
        id,
        values.filter(Boolean),
        client
      );
    }

    await client.query('COMMIT');
    return updated;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/* =========================================================
   IMAGE MANAGEMENT
========================================================= */
//using
export const addProductImage = async (productId, files) => {
  const client = await pool.connect();
  const uploaded = [];

  try {
    await client.query('BEGIN');

    const existing =
      await productRepository.findProductById(productId);

    if (!existing)
      throw new AppError('Product not found', 404);

    if (!files?.length) {
      return productRepository.getImagesById(productId);
    }

    const current =
      await productRepository.getImagesById(productId);

    if (current.length + files.length > 3) {
      throw new AppError('Max 3 images allowed', 400);
    }

    for (const [i, file] of files.entries()) {
      const res = await uploadToCloudinary(
        file.buffer,
        `product-${productId}-${Date.now()}-${i}`,
        'ecommerce/products'
      );

      uploaded.push(res.public_id);

      await productRepository.insertSingleImage(
        productId,
        {
          image_url: res.secure_url,
          product_image_id: res.public_id,
          is_primary: current.length === 0 && i === 0,
          alt_text: file.originalname,
          sort_order: current.length + i
        },
        client
      );
    }

    await client.query('COMMIT');

    return productRepository.getImagesById(productId);

  } catch (error) {
    await client.query('ROLLBACK');

    await Promise.allSettled(
      uploaded.map(deleteFromCloudinary)
    );

    throw error;
  } finally {
    client.release();
  }
};

// using 
export const removeProductImage = async (productId, imageId) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const image =
      await productRepository.getImageById(imageId);

    if (!image)
      throw new AppError('Image not found', 404);

    await productRepository.deleteImageById(imageId, client);

    if (image.is_primary) {
      const remaining =
        await productRepository.getImagesById(productId);

      if (remaining.length) {
        await client.query(
          `UPDATE product_images SET is_primary=true WHERE image_id=$1`,
          [remaining[0].image_id]
        );
      }
    }

    await client.query('COMMIT');

    if (image.product_image_id) {
      deleteFromCloudinary(image.product_image_id)
        .catch(() => { });
    }

    return { deleted: true, imageId };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// using 
export const reorderProductImages = async (
  productId,
  primaryImageId,
  orderedIds
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const current =
      await productRepository.getImagesById(productId);

    const ids = current.map(i => Number(i.image_id));

    if (!orderedIds.every(id => ids.includes(Number(id)))) {
      throw new AppError('Invalid image IDs', 400);
    }

    await productRepository.updateImagesOrder(
      productId,
      orderedIds.map(Number),
      Number(primaryImageId),
      client
    );

    await client.query('COMMIT');

    return productRepository.getImagesById(productId);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};