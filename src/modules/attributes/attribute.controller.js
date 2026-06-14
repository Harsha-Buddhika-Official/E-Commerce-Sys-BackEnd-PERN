import * as attributeService from './attribute.service.js';

//using
export const createAttribute = async (req, res, next) => {
    try {
        const attributeData = await attributeService.createAttribute(req.body);
        res.status(201).json({
            success: true,
            message: 'Attribute created successfully',
            data: attributeData });
    } catch (error) {
        next(error);
    }
};

//using
export const createProductAttribute = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const mappedAttribute = await attributeService.createProductAttribute(productId, req.body);
        res.status(201).json({
            success: true,
            message: 'Product attribute created successfully',
            data: mappedAttribute,
        });
    } catch (error) {
        next(error);
    }
};

//using
export const createAttributeValue = async (req, res, next) => {
    try {
        const attributeValueData = await attributeService.createAttributeValue ({
            ...req.body,
            attribute_id: req.params.attributeId,
        });
        res.status(201).json({ 
            success: true,
            message: 'Attribute value created successfully', 
            data: attributeValueData 
        });
    } catch (error) {
        next(error);
    }
};


//using
export const getAttributes = async (req, res, next) => {
    try {
        const catalog = await attributeService.getAttributeCatalog();
        res.status(200).json({
            success: true,
            message: 'Attributes retrieved successfully',
            data: catalog
        });
    } catch (error) {
        next(error);
    }
};

export const getAttributeById = async (req, res, next) => {
    try {
        const attribute = await attributeService.getAttributeById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Attribute retrieved successfully',
            data: attribute
        });
    } catch (error) {
        next(error);
    }
};

export const getAttributesByCategoryId = async (req, res, next) => {
    try {
        const Data = req.body;
        const attributes = await attributeService.getAttributesByCategoryId(Data);
        res.status(200).json({
            success: true,
            message: 'Attributes retrieved successfully',
            data: attributes
        });
    } catch (error) {
        next(error);
    }
};

//using
export const getAttributesGroupedByCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId || req.query.category_id || req.query.categoryId || (req.body && req.body.category_id) || null;
        const data = await attributeService.getAttributesGroupedByCategory(categoryId);
        res.status(200).json({ 
            success: true,
            message: 'Attributes retrieved successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};

export const updateAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await attributeService.updateAttribute(id, req.body);
        res.status(200).json({ 
            success: true,
            message: 'Attribute updated successfully',
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

//using
export const deleteAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await attributeService.deleteAttribute(id);
        res.status(200).json({
            success: true,
            message: 'Attribute deleted successfully',
            data: {id: deleted.attribute_id}
        });
    } catch (error) {
        next(error);
    }
};

//using
export const deleteAttributeValue = async (req, res, next) => {
    try {
        const { attributeId, valueId } = req.params;
        const data = await attributeService.deleteAttributeValue(attributeId, valueId);
        res.status(200).json({
            success: true,
            message: 'Attribute value deleted successfully',
            data: data
        });
    } catch (error) {
        next(error);
    }
};