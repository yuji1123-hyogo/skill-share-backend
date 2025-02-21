import express from "express";
import { 
    commentIdParamSchema, 
    createCommentSchema, 
    postIdParamSchema,
    articleIdParamSchema,
    feedbackIdParamSchema
} from "../validations/commentValidation.js";
import {
    createCommentController,
    getCommentByIdController,
    getCommentsByTargetController
} from "../controllers/commentController.js";
import { validateRequest } from "../middlewears/validateRequest.js";


const router = express.Router();

// 汎用的なコメント作成エンドポイント
router.post(
    "/:targetType/:targetId",
    validateRequest(createCommentSchema),
    createCommentController
);

// 汎用的なコメント一覧取得エンドポイント
router.get(
    "/:targetType/:targetId",
    getCommentsByTargetController
);

// コメント詳細取得
router.get(
    "/:commentId",
    validateRequest(commentIdParamSchema, "params"),
    getCommentByIdController
);

export default router;
