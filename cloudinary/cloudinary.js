const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Cloudinaryの初期設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:'portfolioapp',
        allowed_formats:['jpeg','jpg','png']
    }
})

module.exports = {cloudinary,storage}