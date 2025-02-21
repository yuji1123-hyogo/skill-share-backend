import express from "express";
import { validateRequest } from "../middlewears/validateRequest.js";
import { clubIdParamSchema, postIdParamSchema, postSchema, userIdParamSchema } from "../validations/postValidation.js";
import { createPostController, getClubPostsController, getHomePostsController, getPostDetailsController, getUserPostsController } from "../contorollers/postContoroller.js";
const router = express.Router();

// 投稿を作成
router.post("/", validateRequest(postSchema), createPostController);

// ホームフィードの投稿一覧
router.get("/home", getHomePostsController);

// 投稿の詳細を取得
router.get("/:postId", validateRequest(postIdParamSchema,"params"),getPostDetailsController);

// ユーザーの投稿一覧
router.get("/users/:userId", validateRequest(userIdParamSchema,"params"),getUserPostsController);

// クラブの投稿一覧
router.get("/clubs/:clubId", validateRequest(clubIdParamSchema,"params"),getClubPostsController);



export default router;
