import { multiUploadCloudinary } from "../services/cloudinary.js"

export const uploadImages = async (req, res) => {
  try {
    console.log(req.files, 'req.files')
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    const files = req.files
    const uploadedImageUrls = await multiUploadCloudinary(files, 'medicines')
    console.log(uploadedImageUrls, 'uploadedImageUrls')

    res.status(200).json({ message: 'Files uploaded successfully', urls: uploadedImageUrls })
  } catch (error) {
    console.error('Error in uploadImages:', error)
    res.status(500).json({ message: 'Error uploading files', error: error.message })
  }
}