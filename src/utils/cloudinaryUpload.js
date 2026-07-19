import cloudinary from '../config/cloudinary.js';
import AppError from './AppError.js';

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} fileName - Name for the file on Cloudinary
 * @param {String} folder - Folder path on Cloudinary (e.g., 'ecommerce/products')
 * @param {Object} options - Extra Cloudinary upload options (overrides defaults)
 * @param {String} mimetype - File's mimetype (from multer's req.file.mimetype), used to detect video
 * @returns {Promise<Object>} - Cloudinary response with public_id and secure_url
 */

const isPdfBuffer = (buffer) =>
    buffer?.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

// Video mimetypes accepted by the general-purpose multer instance
const VIDEO_MIMETYPES = ['video/mp4', 'video/webm', 'video/ogg'];

export const uploadToCloudinary = async (fileBuffer, fileName, folder = 'ecommerce', options = {}, mimetype = '') => {
    const isPdf = isPdfBuffer(fileBuffer);
    const isVideo = VIDEO_MIMETYPES.includes(mimetype);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id:     fileName,
                overwrite:     true,
                resource_type: isVideo ? 'video' : 'image',   // branch based on detected video mimetype
                ...(isPdf && {
                    format:  'jpg',                 // convert PDF → JPG on upload
                    pages:   1,                     // first page only
                    quality: 90,
                }),
                ...options,
            },
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary Upload] Failed:', error);
                    reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
                } else {
                    resolve({
                        public_id:     result.public_id,
                        secure_url:    result.secure_url,
                        url:           result.url,
                        resource_type: result.resource_type,
                        format:        result.format,
                        width:         result.width,
                        height:        result.height,
                    });
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Public ID of the file on Cloudinary
 * @param {String} resourceType - 'image' (default) or 'video' — must match the type used at upload time
 * @returns {Promise<Object>} - Cloudinary response
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return result;
    } catch (error) {
        throw new AppError(`Failed to delete file from Cloudinary: ${error.message}`, 500);
    }
};

/**
 * Get Cloudinary URL for a public_id
 * @param {String} publicId - Public ID of the file on Cloudinary
 * @param {Object} options - Transformation options
 * @returns {String} - Cloudinary URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
    try {
        return cloudinary.url(publicId, {
            secure: true,
            ...options
        });
    } catch (error) {
        throw new AppError(`Failed to generate Cloudinary URL: ${error.message}`, 500);
    }
};

export const getDownloadUrl = (publicId, resourceType = 'raw', filename = 'receipt') => {
    return cloudinary.url(publicId, {
        secure:        true,
        resource_type: resourceType,
        flags:         'attachment',      // forces browser download
        public_id:     publicId,
    });
};