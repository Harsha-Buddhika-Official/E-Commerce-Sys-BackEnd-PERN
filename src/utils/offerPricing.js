import { findOfferByProductIdFullOfferData } from '../modules/offers/offers.repository.js';

export const applyActiveOfferPricing = async (product) => {
    const checkOffer = await findOfferByProductIdFullOfferData(product.product_id);
    if (!checkOffer) {
        return product;
    };

    if (checkOffer.discount_type === 'percentage') {
        const discountAmount = (product.discounted_price * checkOffer.discount_value) / 100;
        product.discounted_price = product.discounted_price - discountAmount;
    } else if (checkOffer.discount_type === 'fixed') {
        product.discounted_price = product.discounted_price - checkOffer.discount_value;
    }
    
    return product;
};
