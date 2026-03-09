import * as brandService from './brand.service.js';

//create brand
export const createBrand = async (req, res, next) => {
    try {
        const newBrand = await brandService.createBrand(req.body);
        res.status(201).json({
            success: true,
            data: newBrand,
            message: 'Brand created successfully'
        });
    } catch (error) {
        next(error);
    }
};

//get all brands
export const getAllBrands = async (req, res, next) => {
    try {
        const brands = await brandService.getAllBrands();
        res.status(200).json({
            success: true,
            data: brands
        })
    } catch (error) {
        next(error);
    }
}

// //get brand by name
// export const getBrandByName = async (req, res, next) => {
//     try {
//         const { name } = req.params;
//         const brand = await brandService.getBrandByName(name)
//         res.status(200).json({
//             success: true,
//             data: brand
//         })
//     } catch (error) {
//         next(error);
//     }
// };

//get brand by id
export const getBrandById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const brand = await brandService.getBrandById(id);
        res.status(200).json({
            success: true,
            data: brand
        })
    } catch (error) {
        next(error);
    }
};

//update brand
export const updateBrand = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateBrand = await brandService.updateBrand(id, req.body);
        res.status(200).json({
            success: true,
            data: updateBrand,
            message: 'Brand updated successfully'
        })
    } catch (error) {
        next(error);
    }
}

//delete brand
export const deleteBrand = async (req, res, next) => {
    try {
        await brandService.deleteBrand(req.params.id);
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