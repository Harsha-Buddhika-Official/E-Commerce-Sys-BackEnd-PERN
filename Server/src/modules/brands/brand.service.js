import slugify from 'slugify';
import * as brandRepository from './brand.repository.js';

export const createBrand = async (brandData) => {
    if (!brandData.name) throw new Error('Brand name is required');

    const existing = await brandRepository.findByName(brandData.name);
    if(existing) {
        throw new Error('Brand with this name already exists');
    }

    brandData.slug = slugify(brandData.name, { lower: true, strict: true });

    return await brandRepository.createBrand(brandData);
}

export const deleteBrand = async (brandId) => {
    const selectedBrand = await brandRepository.findById(brandId);
    if(!selectedBrand){
        throw new Error('Brand not found');
    }
    return await brandRepository.deleteBrand(brandId);
}

export const softDeleteBrand = async (brandId) => {
    const selectedBrand = await brandRepository.findById(brandId);
    if(!selectedBrand){
        throw new Error('Brand not found');
    }
    return await brandRepository.softDelete(brandId);
}