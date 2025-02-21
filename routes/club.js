import express from "express";
const router = express.Router();


import { clubIdParamSchema, createClubSchema, locationSchema, searchClubSchema, updateClubSchema } from "../validations/clubValidation.js";

import { validateRequest } from "../middlewears/validateRequest.js";
import { createClubController, getClubDetailController, getClubEventsController, getClubMemberIdsController, joinClubController, searchClubsController, updateClubController, searchClubsByLocationController } from "../contorollers/clubContoroller.js";


// クラブ作成（認証必須 & バリデーション適用）
router.post("/",validateRequest(createClubSchema), createClubController);


// クラブ検索
router.get("/search",validateRequest(searchClubSchema,"query"), searchClubsController);
// クラブ詳細取得
router.get("/:clubId",validateRequest(clubIdParamSchema, "params"),  getClubDetailController);

// クラブのメンバー一覧（IDのみ）
router.get("/:clubId/members",validateRequest(clubIdParamSchema, "params"),  getClubMemberIdsController);

// クラブのイベント一覧取得
router.get("/:clubId/events",validateRequest(clubIdParamSchema, "params"),  getClubEventsController);

// クラブ参加（認証必須）
router.post("/:clubId/join",validateRequest(clubIdParamSchema, "params"),  joinClubController);

// クラブ情報の更新（認証必須 & バリデーション適用）
router.put("/:clubId",validateRequest(clubIdParamSchema, "params"),  validateRequest(updateClubSchema), updateClubController);

// 地図情報でクラブを検索
router.get("/search/location",validateRequest(locationSchema, "query"), searchClubsByLocationController);


export default router;

