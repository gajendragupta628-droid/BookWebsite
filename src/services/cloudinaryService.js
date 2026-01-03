const cloudinary = require('cloudinary').v2;
const { env } = require('../config/env');
const logger = require('../utils/logger');

// Validate Cloudinary configuration
const isConfigured = !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (!isConfigured && env.NODE_ENV === 'production') {
  logger.warn('Cloudinary is not configured - image uploads will fail');
}

// Configure Cloudinary
if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload a single image to Cloudinary
 * @param {String} filePath - Path to the file to upload
 * @param {String} folder - Folder in Cloudinary (default: 'books')
 * @returns {Promise<Object>} Upload result with url, public_id, etc.
 */
async function uploadImage(filePath, folder = 'books') {
  if (!isConfigured) {
    const error = new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    logger.error({ filePath, folder }, 'Cloudinary upload attempted without configuration');
    throw error;
  }
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return {
      src: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    logger.error({ err: error, filePath, folder }, 'Cloudinary upload error');
    throw new Error('Failed to upload image to Cloudinary: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file objects from multer
 * @param {String} folder - Folder in Cloudinary
 * @returns {Promise<Array>} Array of upload results
 */
async function uploadMultipleImages(files, folder = 'books') {
  if (!files || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map(file => uploadImage(file.path, folder));
  return await Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - The public_id of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
async function deleteImage(publicId) {
  if (!isConfigured) {
    logger.warn({ publicId }, 'Cloudinary delete attempted without configuration');
    return { result: 'not_configured' };
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error({ err: error, publicId }, 'Cloudinary delete error');
    throw new Error('Failed to delete image from Cloudinary: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of public_ids to delete
 * @returns {Promise<Array>} Array of deletion results
 */
async function deleteMultipleImages(publicIds) {
  if (!publicIds || publicIds.length === 0) {
    return [];
  }

  const deletePromises = publicIds.map(publicId => deleteImage(publicId));
  return await Promise.all(deletePromises);
}

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  cloudinary
};

