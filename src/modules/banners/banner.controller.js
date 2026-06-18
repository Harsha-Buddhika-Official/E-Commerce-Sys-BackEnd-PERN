import * as service from "./banner.service.js";

//using
export const createBanner = async (req, res, next) => {
    try {
        const banner = await service.createBanner(req.body, req.file);

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner,
        });
    } catch (err) {
        next(err);
    }
};

//using
export const getBannerImages = async (req, res, next) => {
    try {
        const banners = await service.getBannerImages();

        res.status(200).json({
            success: true,
            message: "Banner images retrieved successfully",
            data: banners,
        });
    } catch (err) {
        next(err);
    }
};

//using
export const getBannerVideo = async (req, res, next) => {
    try {
        const banners = await service.getBannerVideo();

        res.status(200).json({
            success: true,
            message: "Banner videos retrieved successfully",
            data: banners,
        });
    } catch (err) {
        next(err);
    }
};

//using
export const getAllBanners = async (req, res, next) => {
    try {
        const banners = await service.getAllBanners();

        res.status(200).json({
            success: true,
            message: "Banners retrieved successfully",
            data: banners,
        });
    } catch (err) {
        next(err);
    }
};

//using
export const getBannerById = async (req, res, next) => {
    try {
        const banner = await service.getBannerById(req.params.id);

        res.status(200).json({
            success: true,
            message: "Banner retrieved successfully",
            data: banner,
        });
    } catch (err) {
        next(err);
    }
};

export const updateBanner = async (req, res, next) => {
    try {
        const banner = await service.updateBanner(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: banner,
        });
    } catch (err) {
        next(err);
    }
};

//using
export const deleteBanner = async (req, res, next) => {
    try {
        const deleted = await service.deleteBanner(req.params.id);

        res.status(200).json({
            success: true,
            message: "Banner deleted successfully",
            data: {
                id: deleted.banner_id,
            },
        });
    } catch (err) {
        next(err);
    }
};