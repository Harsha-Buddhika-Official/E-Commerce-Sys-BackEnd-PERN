import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import * as service from "./banner.service.js";

export const createBanner = async (req, res, next) => {
    try {
        console.log("Received body:", req.body);
        console.log("Received file:", req.file);
        const banner = await service.createBanner(req.body, req.file)

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

export const getBannerVideo = async (req, res, next) => {
    try {
        const banners = await service.getBannerVideo();
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