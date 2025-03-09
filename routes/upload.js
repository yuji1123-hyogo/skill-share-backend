import express from "express";
import multer from "multer";
import { storage } from "../cloudinary/cloudinary.js"

const router = express.Router();
const upload = multer({ storage});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "画像がアップロードされていません" , errors: [] });
    }

    res.status(200).json({
      message: "Cloudinaryへのアップロードが成功しました",
      imageUrl: req.file.path, // 修正後
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Cloudinaryへのアップロードが失敗しました", errors: error.errors ||  [] });
  }
});

export default router;

