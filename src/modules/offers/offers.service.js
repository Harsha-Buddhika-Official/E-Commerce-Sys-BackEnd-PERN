import AppError from '../../utils/AppError.js';
import * as offersRepository from './offers.repository.js';
import * as productRepository from '../products/product.repository.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

//using
export const createOffer = async (offerData, file) => {
    if (!offerData.title?.trim()) {
        throw new AppError('Offer title is required', 400);
    }

    const startDate = new Date(offerData.start_date);
    const endDate = new Date(offerData.end_date);

    if (Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())) {
        throw new AppError('Invalid start or end date', 400);
    }

    if (endDate < startDate) {
        throw new AppError(
            'End date must be after start date',
            400
        );
    }

    if (
        offerData.discount_type === 'percentage' &&
        Number(offerData.discount_value) > 100
    ) {
        throw new AppError(
            'Percentage discount cannot exceed 100',
            400
        );
    }

    const payload = {
        ...offerData,
        title: offerData.title.trim(),
    };

    if (file) {
        const uploadResult = await uploadToCloudinary(
            file.buffer,
            `offer-banner-${Date.now()}`,
            'ecommerce/offers'
        );

        payload.banner_image_url = uploadResult.secure_url;
        payload.banner_image_id = uploadResult.public_id;
    }

    return await offersRepository.createOffer(payload);
};

//using
export const getAllOffers = async () => {
    return offersRepository.getAllOffers();
};

//using
export const getOffers = async (status) => {
    const validStatuses = ['active', 'upcoming', undefined];

    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status filter', 400);
    }

    return await offersRepository.getOffers({ status });
};

export const getActiveOffers = async () => {
    return offersRepository.getActiveOffers();
};

export const getUpcomingOffers = async () => {
    return offersRepository.getUpcomingOffers();
};

//using
export const getOfferByIdAdmin = async (id) => {
    const offer = await offersRepository.findOfferByIdAdmin(id);
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

//using
export const getOfferByIdUser = async (id) => {
    const offer = await offersRepository.findOfferByIdUser(id);
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
                    // selling_price: product.discounted_price,
                    discounted_price: numericPrice,
                },
            };
        })
        : [];
    return offer;
};

//using
export const updateOffer = async (id, offerData, file) => {
    const existing =
        await offersRepository.findOfferByIdBasic(id);

    if (!existing) {
        throw new AppError('Offer not found', 404);
    }

    const updated = {
        title: offerData.title ?? existing.title,
        description: Object.prototype.hasOwnProperty.call( offerData, 'description')? offerData.description: existing.description,        
        discount_type: offerData.discount_type ?? existing.discount_type,
        discount_value: offerData.discount_value ?? existing.discount_value,
        start_date: offerData.start_date ?? existing.start_date,
        end_date: offerData.end_date ?? existing.end_date,
        is_active: offerData.is_active ?? existing.is_active,
        banner_image: offerData.banner_image ?? existing.banner_image,
        banner_image_public_id: offerData.banner_image_public_id ?? existing.banner_image_public_id,
    };

    if (file) {
        const uploadResult = await uploadToCloudinary(
            file.buffer,
            `offer-banner-${Date.now()}`,
            'ecommerce/offers'
        );
        updated.banner_image = uploadResult.secure_url;
        updated.banner_image_id = uploadResult.public_id;
    }

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

    return await offersRepository.updateOffer(id, updated);
};


//using
export const toggleOffer = async (id, isActive) => {
    if (!id) throw new AppError("Offer ID is required", 400);

    const existing = await offersRepository.findOfferByIdBasic(id);
    
    if (!existing) throw new AppError('Offer not found', 404);

    return offersRepository.toggleOffer(id, isActive);
};

//using
export const deleteOffer = async (id) => {
    const existing = await offersRepository.findOfferByIdBasic(id);
    if (!existing) {
        throw new AppError('Offer not found', 404);
    }
    await deleteFromCloudinary(existing.banner_image_id);
    return offersRepository.deleteOffer(id);
};

//using
export const addOfferProduct = async (offerId, productId) => {
    const offer = await offersRepository.findOfferByIdBasic(offerId);
    if (!offer) {
        throw new AppError('Offer not found', 404);
    }
    const product = await productRepository.findProductByIdBasic(productId);
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
    const offer = await offersRepository.findOfferByIdBasic(offerId);
    if (!offer) {
        throw new AppError('Offer not found', 404);
    }

    const existing = await offersRepository.findOfferProduct(offerId, productId);
    if (!existing) {
        throw new AppError('Offer product not found', 404);
    }

    return offersRepository.removeOfferProduct(offerId, productId);
};

//using
export const getOfferProducts = async (offerId) => {
    const offer = await offersRepository.findOfferByIdBasic(offerId);
    if (!offer) {
        throw new AppError('Offer not found', 404);
    }

    return offersRepository.getOfferProducts(offerId);
};
