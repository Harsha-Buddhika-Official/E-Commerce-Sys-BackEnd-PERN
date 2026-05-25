import * as attributeService from './attribute.service.js';

export const createAttribute = async (req, res, next) => {
    try {
        const attributeData = await attributeService.createAttribute(req.body);
        res.status(201).json({ message: 'Attribute created successfully', attribute: attributeData });
    } catch (error) {
        next(error);
    }
};

export const getAttributesByCategoryId = async (req, res, next) => {
    try {
        const Data = req.body;
        const attributes = await attributeService.getAttributesByCategoryId(Data);
        res.status(200).json(attributes);
    } catch (error) {
        next(error);
    }
};

export const getAttributeCatalog = async (req, res, next) => {
    try {
        const catalog = await attributeService.getAttributeCatalog();
        res.status(200).json(catalog);
    } catch (error) {
        next(error);
    }
};

export const getAttributeById = async (req, res, next) => {
    try {
        const attribute = await attributeService.getAttributeById(req.params.id);
        res.status(200).json(attribute);
    } catch (error) {
        next(error);
    }
};

export const deleteAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        await attributeService.deleteAttribute(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const updateAttribute = async (req, res, next) => {
    try {
        const { name } = req.body;
        await attributeService.updateAttribute(req.params.id, name);
        res.status(200).json({ message: 'Attribute updated successfully' });
    } catch (error) {
        next(error);
    }
};

export const createAttributeValue = async (req, res, next) => {
    try {
        const attributeValueData = await attributeService.createAttributeValue({
            ...req.body,
            attribute_id: req.params.attributeId,
        });
        res.status(201).json({ message: 'Attribute value created successfully', attributeValue: attributeValueData });
    } catch (error) {
        next(error);
    }
};

export const deleteAttributeValue = async (req, res, next) => {
    try {
        const { attributeId, valueId } = req.params;
        await attributeService.deleteAttributeValue(attributeId, valueId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};