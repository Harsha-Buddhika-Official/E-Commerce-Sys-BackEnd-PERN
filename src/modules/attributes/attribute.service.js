import * as attributeRepository from './attribute.repository.js';
import * as productRepository from '../products/product.repository.js';
import AppError from '../../utils/AppError.js';

export const createAttribute = async (attribute) => {
    return await attributeRepository.createAttribute(attribute);
}

export const getAttributesByCategoryId = async (categoryId) => {
    return await attributeRepository.getAttributesByCategoryId(categoryId);
}

export const getAttributeCatalog = async () => {
    return await attributeRepository.getAttributeCatalog();
}

export const getAttributesGroupedByCategory = async (categoryId = null) => {
    return await attributeRepository.getAttributesByCategory(categoryId);
}

export const getAttributeById = async (id) => {
    return await attributeRepository.getAttributeById(id);
}

export const deleteAttribute = async (id) => {
    await attributeRepository.deleteAttribute(id);
}

export const updateAttribute = async (id, attribute) => {
    await attributeRepository.updateAttribute(id, attribute);
}

export const createAttributeValue = async (attributeValue) => {
    return await attributeRepository.createAttributeValue(attributeValue);
}

export const deleteAttributeValue = async (attributeId, valueId) => {
    return await attributeRepository.deleteAttributeValue(attributeId, valueId);
}

export const createProductAttribute = async (productId, attributeData) => {
    const product = await productRepository.findProductById(productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    const attributeValue = await attributeRepository.getAttributeValueById(attributeData.attribute_value_id);
    if (!attributeValue) {
        throw new AppError('Attribute value not found', 404);
    }

    if (Number(attributeValue.attribute_id) !== Number(attributeData.attribute_id)) {
        throw new AppError('Attribute value does not belong to the provided attribute', 400);
    }

    return await attributeRepository.createProductAttribute(productId, {
        ...attributeData,
        value: attributeValue.value,
    });
}