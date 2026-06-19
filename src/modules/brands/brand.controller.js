import * as brandService from './brand.service.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

//create brand
//using
export const createBrand = async (req, res, next) => {
    try {
        const newBrand = await brandService.createBrand(req.body, req.file);
        res.status(201).json({
            success: true,
            data: newBrand,
            message: 'Brand created successfully'
        });
    } catch (error) {
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
//using
export const getAllBrands = async (req, res, next) => {
    try {
        const brands = await brandService.getAllBrands();
        res.status(200).json({
            success: true,
            message: 'Brands retrieved successfully',
            data: brands
        })
    } catch (error) {
        next(error);
    }
}

//get all brand names and ids
//using
export const getAllBrandnames = async (req, res, next) => {
    try {
        const brandNames = await brandService.getAllBrandNames();
        res.status(200).json({
            success: true,
            message: 'Brand names retrieved successfully',
            data: brandNames
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
            message: 'Brand retrieved successfully',
            data: brand
        })
    } catch (error) {
        next(error);
    }
};

// export const updateBrand = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         // const brandData = { ...req.body };

//         // if (req.file) {
//         //     const existingBrand = await brandService.getBrandById(id);
            
//         //     if (existingBrand.logo_public_id) {
//         //         try {
//         //             await deleteFromCloudinary(existingBrand.logo_public_id);
//         //         } catch (deleteError) {
//         //             console.error('Failed to delete old logo:', deleteError);
//         //         }
//         //     }

//         //     const uploadResult = await uploadToCloudinary(
//         //         req.file.buffer,
//         //         `brand-${Date.now()}`,
//         //         'ecommerce/brands'
//         //     );
//         //     brandData.logo_url = uploadResult.secure_url;
//         //     brandData.logo_public_id = uploadResult.public_id;
//         // }

//         // const updatedBrand = await brandService.updateBrand(id, brandData);
//         const updatedBrand = await brandService.updateBrand(id, req.body, req.file);
//         res.status(200).json({
//             success: true,
//             data: updatedBrand,
//             message: 'Brand updated successfully'
//         })
//     } catch (error) {
//         next(error);
//     }
// }

//using
export const deleteBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await brandService.getBrandById(id);

        await brandService.deleteBrand(id);
        res.status(200).json({
            success: true,
            message: 'Brand deleted successfully',
            data: {id: deleted.brand_id}
        });
    } catch (error) {
        next(error);
    }
}

//soft delete brand
// export const softDeleteBrand = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         await brandService.softDeleteBrand(id);
//         res.status(200).json({
//             success: true,
//             message: 'Brand soft deleted successfully'
//         });
//     } catch (error) {
//         next(error);
//     }
// }

// //restore brand
// export const restoreBrand = async (req, res, next) => {
//     try {
//         const { id } = req.params
//         await brandService.restoreBrand(id);
//         res.status(200).json({
//             success: true,
//             message: 'Brand restore successfully'
//         });
//     } catch (error) {
//         next(error);
//     }
// }