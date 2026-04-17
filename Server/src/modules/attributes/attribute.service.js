import * as attributeRepository from './attribute.repository.js';

export const createAttribute = async (attribute) => {
    return await attributeRepository.createAttribute(attribute);
}

export const getAttributesByCategoryId = async (categoryId) => {
    return await attributeRepository.getAttributesByCategoryId(categoryId);
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