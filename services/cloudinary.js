import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
});

export const uploadToCloudinary = async (path, folder) => {
  try {
    const data = await cloudinary.uploader.upload(path, { folder });
    return { url: data.url, public_id: data.public_id };
  } catch (error) {
    console.error(error);
    throw error;
  }
};



export const multiUploadCloudinary = async (files, folder) => {
  try {
    const uploadedImages = [];
    for (const file of files) {
      const { path } = file;
      const result = await cloudinary.uploader.upload(path, { folder });
      if (result.secure_url) {
        uploadedImages.push(result.secure_url);
      }
    }
    return uploadedImages;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
