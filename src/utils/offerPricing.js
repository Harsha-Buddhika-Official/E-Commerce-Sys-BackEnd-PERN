import { findOfferByProductIdFullOfferData, getAllOfferProducts } from '../modules/offers/offers.repository.js';

const applyOfferDiscount = (product, offer) => {
    if (!offer) return product;

    if (offer.discount_type === 'percentage') {
        product.discounted_price -=
            (product.discounted_price * offer.discount_value) / 100;
    } else if (offer.discount_type === 'fixed') {
        product.discounted_price -= offer.discount_value;
    }

    product.active_offer = offer;

    return product;
};

export const applyOfferToProduct = async (product) => {
    const offer = await findOfferByProductIdFullOfferData(product.product_id);
    return applyOfferDiscount(product, offer);
};

export const applyOffersToProducts = async (products) => {
    const offers = await getAllOfferProducts();
    const offerMap = new Map(offers.map(offer => [offer.product_id, offer]));

    return products.map(product =>
        applyOfferDiscount(product, offerMap.get(product.product_id))
    );
};