import express from "express";
import { searchTagsController } from "../contorollers/tagController.js";
import { searchTagSchema } from "../validations/tagValidation.js";
import { validateRequest } from "../middlewears/validateRequest.js";

const router = express.Router();

// タグ検索 API（Yup バリデーション適用）
router.get("/search", validateRequest(searchTagSchema, "query"), searchTagsController);

export default router;
