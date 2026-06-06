import AppError from "../../utils/AppError.js";
import * as repo from "./banner.repository.js";

export const createBanner = async (data) => {
  if (!data.title) {
    throw new AppError("Banner title is required", 400);
  }

  if (!data.media_url) {
    throw new AppError("Banner media is required", 400);
  }

  if (!data.media_type) {
    throw new AppError("Banner media type is required", 400);
  }

  if (!data.media_public_id) {
    throw new AppError("Banner media public ID is required", 400);
  }

  return repo.createBanner(data);
};

export const getAllBanners = async () => {
  return repo.getAllBanners();
};

export const getBannerImages = async () => {
    return repo.getBannerImages();
}

export const getBannerById = async (id) => {
  const banner = await repo.getBannerById(id);

  if (!banner) {
    throw new AppError("Banner not found", 404);
  }

  return banner;
};

export const updateBanner = async (id, data) => {
  const existing = await repo.getBannerById(id);

  if (!existing) {
    throw new AppError("Banner not found", 404);
  }

  const updatedData = {
    title: data.title ?? existing.title,
    is_active: data.is_active ?? existing.is_active,

    media_url: data.media_url ?? existing.media_url,
    media_type: data.media_type ?? existing.media_type,
    media_public_id: data.media_public_id ?? existing.media_public_id,

    sort_order: data.sort_order ?? existing.sort_order,
  };

  return repo.updateBanner(id, updatedData);
};

export const deleteBanner = async (id) => {
  const existing = await repo.getBannerById(id);

  if (!existing) {
    throw new AppError("Banner not found", 404);
  }

  return repo.deleteBanner(id);
};