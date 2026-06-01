import * as brandService from './brand.service.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

//create brand
export const createBrand = async (req, res, next) => {
    try {
        let logoUrl = null;
        let logoPublicId = null;

        // Handle logo upload if file is provided
        if (req.file) {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                `brand-${Date.now()}`,
                'ecommerce/brands'
            );
            logoUrl = uploadResult.secure_url;
            logoPublicId = uploadResult.public_id;
        }

        const brandData = {
            ...req.body,
            logo_url: logoUrl,
            logo_public_id: logoPublicId
        };

        const newBrand = await brandService.createBrand(brandData);
        res.status(201).json({
            success: true,
            data: newBrand,
            message: 'Brand created successfully'
        });
    } catch (error) {
        // Delete uploaded file if brand creation fails
        if (req.file && error.logoPublicId) {
            try {
                await deleteFromCloudinary(error.logoPublicId);
            } catch (deleteError) {
                console.error('Failed to delete file from Cloudinary:', deleteError);
            }
        }
        next(error);
    }
};

//get all brands
export const getAllBrands = async (req, res, next) => {
    try {
        const brands = await brandService.getAllBrands();
        res.status(200).json({
            success: true,
            data: brands,
            message: 'Brands retrieved successfully'
        })
    } catch (error) {
        next(error);
    }
}

//get all brand names and ids
export const getAllBrandnames = async (req, res, next) => {
    try {
        const brandNames = await brandService.getAllBrandNames();
        res.status(200).json({
            success: true,
            data: brandNames,
            message: 'Brand names retrieved successfully'
        })
    } catch (error) {
        next(error);
    }
}

//get brand by id
export const getBrandById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const brand = await brandService.getBrandById(id);
        res.status(200).json({
            success: true,
            data: brand,
            message: 'Brand retrieved successfully'
        })
    } catch (error) {
        next(error);
    }
};

//update brand
export const updateBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const brandData = { ...req.body };

        if (req.file) {
            const existingBrand = await brandService.getBrandById(id);
            
            if (existingBrand.logo_public_id) {
                try {
                    await deleteFromCloudinary(existingBrand.logo_public_id);
                } catch (deleteError) {
                    console.error('Failed to delete old logo:', deleteError);
                }
            }

            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                `brand-${Date.now()}`,
                'ecommerce/brands'
            );
            brandData.logo_url = uploadResult.secure_url;
            brandData.logo_public_id = uploadResult.public_id;
        }

        const updatedBrand = await brandService.updateBrand(id, brandData);
        res.status(200).json({
            success: true,
            data: updatedBrand,
            message: 'Brand updated successfully'
        })
    } catch (error) {
        next(error);
    }
}

//delete brand
export const deleteBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const brand = await brandService.getBrandById(id);

        // Delete logo from Cloudinary if it exists
        if (brand.logo_public_id) {
            try {
                await deleteFromCloudinary(brand.logo_public_id);
            } catch (deleteError) {
                console.error('Failed to delete logo from Cloudinary:', deleteError);
            }
        }

        await brandService.deleteBrand(id);
        res.status(200).json({
            success: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

//soft delete brand
export const softDeleteBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        await brandService.softDeleteBrand(id);
        res.status(200).json({
            success: true,
            message: 'Brand soft deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

//restore brand
export const restoreBrand = async (req, res, next) => {
    try {
        const { id } = req.params
        await brandService.restoreBrand(id);
        res.status(200).json({
            success: true,
            message: 'Brand restore successfully'
        });
    } catch (error) {
        next(error);
    }
}