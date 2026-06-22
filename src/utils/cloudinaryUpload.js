import cloudinary from '../config/cloudinary.js';
import AppError from './AppError.js';

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} fileName - Name for the file on Cloudinary
 * @param {String} folder - Folder path on Cloudinary (e.g., 'ecommerce/products')
 * @returns {Promise<Object>} - Cloudinary response with public_id and secure_url
 */

//using
// export const uploadToCloudinary = async (fileBuffer, fileName, folder = 'ecommerce') => {
//     try {
//         return new Promise((resolve, reject) => {
//             const uploadStream = cloudinary.uploader.upload_stream(
//                 {
//                     resource_type: 'auto',
//                     public_id: fileName,
//                     folder: folder,
//                     overwrite: true,
//                     quality: 'auto'
//                 },
//                 (error, result) => {
//                     if (error) {
//                         reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
//                     } else {
//                         resolve({
//                             public_id: result.public_id,
//                             secure_url: result.secure_url,
//                             url: result.url,
//                             width: result.width,
//                             height: result.height
//                         });
//                     }
//                 }
//             );

//             uploadStream.end(fileBuffer);
//         });
//     } catch (error) {
//         throw new AppError(`Failed to upload file to Cloudinary: ${error.message}`, 500);
//     }
// };

const isPdfBuffer = (buffer) =>
    buffer?.length >= 4 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46;

export const uploadToCloudinary = async (fileBuffer, fileName, folder = 'ecommerce', options = {}) => {
    const isPdf = isPdfBuffer(fileBuffer);

    // console.log('[Cloudinary Upload] Starting:', {
    //     fileName,
    //     folder,
    //     isPdf,
    //     bufferSize: fileBuffer?.length,
    //     magicBytes: fileBuffer ? [...fileBuffer.slice(0, 4)].map(b => b.toString(16)).join(' ') : 'no buffer',
    // });

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id:     fileName,
                overwrite:     true,
                resource_type: 'image',             // always image
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
                    // console.log('[Cloudinary Upload] Success:', {
                    //     resource_type: result.resource_type,
                    //     format:        result.format,
                    //     secure_url:    result.secure_url,
                    // });
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
 * @returns {Promise<Object>} - Cloudinary response
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
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

// utils/cloudinaryUpload.js — add this
export const getDownloadUrl = (publicId, resourceType = 'raw', filename = 'receipt') => {
    return cloudinary.url(publicId, {
        secure:        true,
        resource_type: resourceType,
        flags:         'attachment',      // forces browser download
        public_id:     publicId,
    });
};