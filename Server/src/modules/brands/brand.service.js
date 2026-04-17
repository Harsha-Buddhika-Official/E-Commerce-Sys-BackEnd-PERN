import slugify from 'slugify';
import * as brandRepository from './brand.repository.js';
import AppError from '../../utils/AppError.js';

//create brand
export const createBrand = async (brandData) => {
    if (!brandData.name) throw new AppError('Brand name is required', 400);

    const existing = await brandRepository.findBrandByName(brandData.name);
    if(existing) {
        throw new AppError('Brand with this name already exists', 400);
    }

    brandData.slug = slugify(brandData.name, { lower: true, strict: true });

    return await brandRepository.createBrand(brandData);
}

//get all brands
export const getAllBrands = async() => {
    const brands = await brandRepository.getAllBrands();
    return brands;
}

//get brand by id
export const getBrandById = async (id) => {
    const brand = await brandRepository.findBrandById(id);
    if(!brand){
        throw new AppError('Brand not found', 404);
    }
    return brand;
}

//update brand
export const updateBrand = async(id, brandData) => {
    const existing = await brandRepository.findBrandById(id);
    if(!existing){
        throw new AppError('Brand not found', 404);
    }
    if(brandData.name && brandData.name !== existing.name){
        const nameExists = await brandRepository.findBrandByName(brandData.name);
        if(nameExists){
            throw new AppError('Brand with this name already exists', 400);
        }
    }
    brandData.slug = slugify(brandData.name, {lower: true, static:true});
    return await brandRepository.updateBrand(id, brandData);
}

//delete brand
export const deleteBrand = async (id) => {
    const selectedBrand = await brandRepository.findBrandById(id);
    if(!selectedBrand){
        throw new AppError('Brand not found', 404);
    }
    return await brandRepository.deleteBrand(id);
}

//soft delete brand
export const softDeleteBrand = async (id) => {
    const selectedBrand = await brandRepository.findBrandById(id);
    if(!selectedBrand){
        throw new AppError('Brand not found', 404);
    }
    return await brandRepository.softDelete(id);
}

//restore brand
export const restoreBrand = async (id) => {
    const selectedBrand = await brandRepository.findBrandById(id);
    if(!selectedBrand){
        throw new AppError('Brand not found', 404);
    }
    return await brandRepository.restoreBrand(id);
}