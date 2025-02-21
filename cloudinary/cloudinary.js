import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryModule from 'cloudinary';
import { config as dotenvConfig } from 'dotenv';

// 環境変数をロード
dotenvConfig();

const cloudinary = cloudinaryModule.v2;

// Cloudinaryの初期設定
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolioapp',
    allowed_formats: ['jpeg', 'jpg', 'png'],
  },
});

export { cloudinary, storage };
