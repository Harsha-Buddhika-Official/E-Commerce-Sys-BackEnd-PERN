import AppError from "../../utils/AppError.js";
import * as repo from "./banner.repository.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";

export const createBanner = async (data, file) => {
  let media_type = null;

  if (file) {
    if (file.mimetype.startsWith("image/")) {
      media_type = "image";
    } else if (file.mimetype.startsWith("video/")) {
      media_type = "video";
    }

    const uploadResult = await uploadToCloudinary(
      file.buffer,
      `offer-banner-${Date.now()}`,
      "ecommerce/banners"
    );

    data.media_url = uploadResult.secure_url;
    data.media_public_id = uploadResult.public_id;
    data.media_type = media_type;
  }

  if (!data.title) {
    throw new AppError("Banner title is required",400);
  }

  return await repo.createBanner(data);
};

export const getAllBanners = async () => {
  return await repo.getAllBanners();
};

export const getBannerImages = async () => {
  return await repo.getBannerImages();
};

export const getBannerVideo = async () => {
  return await repo.getBannerVideo();
};

export const getBannerById = async (id) => {
  const banner = await repo.getBannerById(id);

  if (!banner) {
    throw new AppError(
      "Banner not found",
      404
    );
  }

  return banner;
};

export const updateBanner = async (id, data) => {
  const existing = await repo.getBannerById(id);

  if (!existing) {
    throw new AppError(
      "Banner not found",
      404
    );
  }

  const updatedData = {
    title: data.title ?? existing.title,
    is_active: data.is_active ?? existing.is_active,
    media_url: data.media_url ?? existing.media_url,
    media_type: data.media_type ?? existing.media_type,
    media_public_id: data.media_public_id ?? existing.media_public_id,
    sort_order: data.sort_order ?? existing.sort_order,
  };

  return await repo.updateBanner(
    id,
    updatedData
  );
};

export const deleteBanner = async (id) => {
  const existing = await repo.getBannerById(id);

  if (!existing) {
    throw new AppError(
      "Banner not found",
      404
    );
  }

  await deleteFromCloudinary(
    existing.media_public_id
  );

  return await repo.deleteBanner(id);
};