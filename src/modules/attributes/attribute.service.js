import * as attributeRepository from './attribute.repository.js';
import * as productRepository from '../products/product.repository.js';
import AppError from '../../utils/AppError.js';

//using
export const createAttribute = async (attribute) => {
    return await attributeRepository.createAttribute(attribute);
}

//using
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

//using
export const createAttributeValue = async (attributeValue) => {
    if(!attributeValue.attribute_id || !attributeValue.value){
        const error = new Error("Attribute ID and value are required to create an attribute value");
        error.statusCode = 400;
        throw error;
    }
    return await attributeRepository.insertAttributeValue (attributeValue);
}

//using
export const getAttributeCatalog = async () => {
    return await attributeRepository.getAttributeCatalog();
}

// export const getAttributeById = async (id) => {
//     if(!id){
//         const error = new Error("Attribute ID is required");
//         error.statusCode = 400;
//         throw error;
//     }
//     return await attributeRepository.getAttributeById(id);
// }

// export const getAttributesByCategoryId = async (categoryId) => {
//     if(!categoryId){
//         const error = new Error("Category ID is required");
//         error.statusCode = 400;
//         throw error;
//     }
//     return await attributeRepository.getAttributesByCategoryId(categoryId);
// }

//using
export const getAttributesGroupedByCategory = async (categoryId = null) => {
    return await attributeRepository.getAttributesByCategory(categoryId);
}

export const updateAttribute = async (id, payload) => {
    const { name, category_id } = payload;

    if (!name?.trim()) {
        const error = new Error("Attribute name is required");
        error.statusCode = 400;
        throw error;
    }

    if (!category_id) {
        const error = new Error("category_id is required");
        error.statusCode = 400;
        throw error;
    }

    const updated = await attributeRepository.updateAttributeById(id, {
        name: name.trim(),
        category_id,
    });

    if (!updated) {
        const error = new Error("Attribute not found");
        error.statusCode = 404;
        throw error;
    }

    return updated;
};

//using
export const deleteAttribute = async (id) => {
    const deleted = await attributeRepository.deleteAttributeById (id);

    if(!deleted){
        const error = new Error('Attribute not found');
        error.statusCode = 404;
        throw error;
    }

    return deleted;
}

//using
export const deleteAttributeValue = async (attributeId, valueId) => {
    const deleted = await attributeRepository.deleteAttributeValueById(attributeId, valueId);

    if(!deleted){
        const error = new Error('Attribute value not found');
        error.statusCode = 404;
        throw error;
    }

    return deleted;
}
