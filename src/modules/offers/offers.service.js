import AppError from '../../utils/AppError.js';
import * as offersRepository from './offers.repository.js';

export const createOffer = async (offerData) => {
    if (!offerData.title) {
        throw new AppError('Offer title is required', 400);
    }

    const startDate = new Date(offerData.start_date);
    const endDate = new Date(offerData.end_date);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new AppError('Invalid start or end date', 400);
    }
    if (endDate < startDate) {
        throw new AppError('End date must be after start date', 400);
    }

    if (offerData.discount_type === 'percentage' && offerData.discount_value > 100) {
        throw new AppError('Percentage discount cannot exceed 100', 400);
    }

    return offersRepository.createOffer(offerData);
};

export const getAllOffers = async () => {
    return offersRepository.getAllOffers();
};

export const getActiveOffers = async () => {
    return offersRepository.getActiveOffers();
};

export const getUpcomingOffers = async () => {
    return offersRepository.getUpcomingOffers();
};

export const getOfferById = async (id) => {
    const offer = await offersRepository.findOfferById(id);
    if (!offer) {
        throw new AppError('Offer not found', 404);
    }

    const calculateDiscountedPrice = (price) => {
        const numericPrice = Number(price) || 0;

        if (offer.discount_type === 'percentage') {
            return Math.max(0, numericPrice - (numericPrice * Number(offer.discount_value)) / 100);
        }

        if (offer.discount_type === 'fixed') {
            return Math.max(0, numericPrice - Number(offer.discount_value));
        }
        return numericPrice;
    };

    offer.products = Array.isArray(offer.products)
        ? offer.products.map((item) => {
            const product = item.product || {};
            const basePrice = product.discounted_price ?? product.selling_price;
            const numericPrice = calculateDiscountedPrice(basePrice)
            return {
                ...item,
                product: {
                    ...product,
                    discounted_price: numericPrice,
                },
            };
        })
        : [];

    return offer;
};

export const updateOffer = async (id, offerData) => {
    const existing = await offersRepository.findOfferById(id);
    if (!existing) {
        throw new AppError('Offer not found', 404);
    }

    const updated = {
        title: offerData.title ?? existing.title,
        description: offerData.description ?? existing.description,
        discount_type: offerData.discount_type ?? existing.discount_type,
        discount_value: offerData.discount_value ?? existing.discount_value,
        start_date: offerData.start_date ?? existing.start_date,
        end_date: offerData.end_date ?? existing.end_date,
        is_active: offerData.is_active ?? existing.is_active,
        banner_image: offerData.banner_image ?? existing.banner_image,
    };

    const startDate = new Date(updated.start_date);
    const endDate = new Date(updated.end_date);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new AppError('Invalid start or end date', 400);
    }
    if (endDate < startDate) {
        throw new AppError('End date must be after start date', 400);
    }

    if (updated.discount_type === 'percentage' && updated.discount_value > 100) {
        throw new AppError('Percentage discount cannot exceed 100', 400);
    }

    return offersRepository.updateOffer(id, updated);
};

export const deleteOffer = async (id) => {
    const existing = await offersRepository.findOfferById(id);
    if (!existing) {
        throw new AppError('Offer not found', 404);
    }
    return offersRepository.deleteOffer(id);
};

export const addOfferProduct = async (offerId, productId) => {
    const offer = await offersRepository.findOfferById(offerId);
    if (!offer) {
        throw new AppError('Offer not found', 404);
    }

    const product = await offersRepository.findProductById(productId);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    const existing = await offersRepository.findOfferProduct(offerId, productId);
    if (existing) {
        throw new AppError('Product already attached to offer', 409);
    }

    return offersRepository.addOfferProduct(offerId, productId);
};

export const removeOfferProduct = async (offerId, productId) => {
    const offer = await offersRepository.findOfferById(offerId);
    if (!offer) {
        throw new AppError('Offer not found', 404);
    }

    const existing = await offersRepository.findOfferProduct(offerId, productId);
    if (!existing) {
        throw new AppError('Offer product not found', 404);
    }

    return offersRepository.removeOfferProduct(offerId, productId);
};

export const getOfferProducts = async (offerId) => {
    const offer = await offersRepository.findOfferById(offerId);
    if (!offer) {
        throw new AppError('Offer not found', 404);
    }

    return offersRepository.getOfferProducts(offerId);
};
