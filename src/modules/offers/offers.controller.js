import * as offersService from './offers.service.js';

export const createOffer = async (req, res, next) => {
    try {
        const offer = await offersService.createOffer(req.body);
        res.status(201).json({
            success: true,
            data: offer,
            message: 'Offer created successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getAllOffers = async (req, res, next) => {
    try {
        const offers = await offersService.getAllOffers();
        res.status(200).json({
            success: true,
            data: offers
        });
    } catch (error) {
        next(error);
    }
};

export const getActiveOffers = async (req, res, next) => {
    try {
        const offers = await offersService.getActiveOffers();
        res.status(200).json({
            success: true,
            data: offers
        });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingOffers = async (req, res, next) => {
    try {
        const offers = await offersService.getUpcomingOffers();
        res.status(200).json({
            success: true,
            data: offers
        });
    } catch (error) {
        next(error);
    }
};

export const getOfferById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const offer = await offersService.getOfferById(id);
        res.status(200).json({
            success: true,
            data: offer
        });
    } catch (error) {
        next(error);
    }
};

export const updateOffer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updated = await offersService.updateOffer(id, req.body);
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Offer updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateOfferStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;
        const updated = await offersService.updateOfferStatus(id, is_active);
        res.status(200).json({
            success: true,
            data: updated,
            message: 'Offer activation updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const deleteOffer = async (req, res, next) => {
    try {
        const { id } = req.params;
        await offersService.deleteOffer(id);
        res.status(200).json({
            success: true,
            message: 'Offer deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const addOfferProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { product_id } = req.body;
        const relation = await offersService.addOfferProduct(id, product_id);
        res.status(201).json({
            success: true,
            data: relation,
            message: 'Product added to offer successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const removeOfferProduct = async (req, res, next) => {
    try {
        const { id, productId } = req.params;
        await offersService.removeOfferProduct(id, productId);
        res.status(200).json({
            success: true,
            message: 'Product removed from offer successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getOfferProducts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const products = await offersService.getOfferProducts(id);
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};
