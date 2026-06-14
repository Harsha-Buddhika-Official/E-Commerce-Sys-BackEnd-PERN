import slugify from 'slugify';
import * as brandRepository from './brand.repository.js';
import AppError from '../../utils/AppError.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

//create brand
export const createBrand = async (brandData, file) => {
    let logoUrl = null;
    let logoPublicId = null;

    if (file) {
        const uploadResult = await uploadToCloudinary(
            file.buffer,
            `brand-${Date.now()}`,
            'ecommerce/brands'
        );
        logoUrl = uploadResult.secure_url;
        logoPublicId = uploadResult.public_id;
    }
    brandData.logo_url = logoUrl;
    brandData.logo_public_id = logoPublicId;

    if (!brandData.name) throw new AppError('Brand name is required', 400);

    const existing = await brandRepository.findBrandByName(brandData.name);
    if(existing) {
        throw new AppError('Brand with this name already exists', 409);
    }

    brandData.slug = slugify(brandData.name, { lower: true, strict: true });

    return await brandRepository.createBrand(brandData);
}

//get all brands
export const getAllBrands = async() => {
    const brands = await brandRepository.getAllBrands();
    return brands;
}

//get all brand names and ids
export const getAllBrandNames = async() => {
    const brandNames = await brandRepository.getAllBrandNames();
    return brandNames;
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
// export const updateBrand = async(id, payload, file) => {
//     const existing = await brandRepository.findBrandById(id);
//     if(!existing){
//         throw new AppError('Brand not found', 404);
//     }
//     if(file) {
//         if (existing.logo_public_id) {
//             try {
//                 await deleteFromCloudinary(existing.logo_public_id);
//             } catch (deleteError) {
//                 console.error('Failed to delete old logo:', deleteError);
//             }
//         }
//         const uploadResult = await uploadToCloudinary(
//             file.buffer,
//             `brand-${Date.now()}`,
//             'ecommerce/brands'
//         );
//         payload.logo_url = uploadResult.secure_url;
//         payload.logo_public_id = uploadResult.public_id;
//     }

//     if(payload.name && payload.name !== existing.name){
//         const nameExists = await brandRepository.findBrandByName(payload.name);
//         if(nameExists){
//             throw new AppError('Brand with this name already exists', 409);
//         }
//         payload.slug = slugify(payload.name, {lower: true, strict: true});
//     }

//     return await brandRepository.updateBrand(id, payload);
// }

//soft delete brand
// export const softDeleteBrand = async (id) => {
//     const selectedBrand = await brandRepository.findBrandById(id);
//     if(!selectedBrand){
//         throw new AppError('Brand not found', 404);
//     }
//     return await brandRepository.softDelete(id);
// }

//restore brand
// export const restoreBrand = async (id) => {
//     const selectedBrand = await brandRepository.findBrandById(id);
//     if(!selectedBrand){
//         throw new AppError('Brand not found', 404);
//     }
//     return await brandRepository.restoreBrand(id);
// }

//delete brand
export const deleteBrand = async (id) => {
    const selectedBrand = await brandRepository.findBrandById(id);
    if (selectedBrand.logo_public_id) {
        try {
            await deleteFromCloudinary(selectedBrand.logo_public_id);
        } catch (deleteError) {
            console.error('Failed to delete logo from Cloudinary:', deleteError);
        }
    }
    if(!selectedBrand){
        throw new AppError('Brand not found', 404);
    }
    return await brandRepository.deleteBrand(id);
}