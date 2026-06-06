import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import * as service from "./banner.service.js";

export const createBanner = async (req, res, next) => {
    try {
        let bannerImageUrl = null;
        let bannerImagePublicId = null;
        let media_type = null;

        if (req.file) {
            if (req.file.mimetype.startsWith("image/")) {
                media_type = "image";
            } else if (req.file.mimetype.startsWith("video/")) {
                media_type = "video";
            }
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                `offer-banner-${Date.now()}`,
                'ecommerce/offers'
            );
            bannerImageUrl = uploadResult.secure_url;
            bannerImagePublicId = uploadResult.public_id;
        }

        const banner = await service.createBanner({
            ...req.body,
            media_url: bannerImageUrl,
            media_type: media_type,
            media_public_id: bannerImagePublicId
        });

        res.status(201).json({
            success: true,
            data: banner
        });
    } catch (err) {
        next(err);
    }
};

export const getBannerImages = async (req, res, next) => {
    try {
        const banners = await service.getBannerImages();
         res.json({
            success: true,
            data: banners
        });
    } catch (err) {
        next(err);
    }
};

export const getAllBanners = async (req, res, next) => {
    try {
        const banners = await service.getAllBanners();

        res.json({
            success: true,
            data: banners
        });
    } catch (err) {
        next(err);
    }
};

export const getBannerById = async (req, res, next) => {
    try {
        const banner = await service.getBannerById(req.params.id);
        res.json({
            success: true,
            data: banner
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

        res.json({
            success: true,
            data: banner
        });
    } catch (err) {
        next(err);
    }
};

export const deleteBanner = async (req, res, next) => {
    try {
        await service.deleteBanner(req.params.id);
        res.json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};