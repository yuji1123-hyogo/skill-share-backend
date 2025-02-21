import express from "express";

import {
  createEventSchema,
  eventIdParamSchema,
  voteForMvpSchema,
} from "../validations/eventValidation.js";


import { validateRequest } from "../middlewears/validateRequest.js";
import { createEventController, determineMvpController, distributeExpController, getEventByIdController, participateEventController, updateEventStatusController, voteForMvpController } from "../contorollers/eventContoroller.js";
import { createSharedArticleSchema } from "../validations/sharedArticleValidation.js";
import { createFeedbackSchema } from "../validations/feedbackValidation.js";
import { createFeedbackController } from "../controllers/feedbackController.js";
import { createSharedArticleController, getSharedArticlesByEventController, getSharedArticleByIdController } from "../controllers/sharedArticleController.js";
import { getFeedbacksByEventController, getFeedbackByIdController } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", validateRequest(createEventSchema), createEventController);
router.get("/:eventId", validateRequest(eventIdParamSchema, "params"), getEventByIdController);
router.post("/:eventId/join", validateRequest(eventIdParamSchema, "params"),  participateEventController);
router.put("/:eventId/status", validateRequest(eventIdParamSchema, "params"), updateEventStatusController);
router.post("/:eventId/vote", validateRequest(eventIdParamSchema, "params"),validateRequest(voteForMvpSchema), voteForMvpController);
router.post("/:eventId/mvp", validateRequest(eventIdParamSchema, "params"),determineMvpController);
router.post("/:eventId/distribute-exp",validateRequest(eventIdParamSchema, "params"), distributeExpController);
router.post("/:eventId/articles", validateRequest(createSharedArticleSchema), createSharedArticleController);
router.post("/:eventId/feedbacks", validateRequest(createFeedbackSchema), createFeedbackController);
router.get("/:eventId/articles", validateRequest(eventIdParamSchema, "params"), getSharedArticlesByEventController);
router.get("/:eventId/articles/:articleId", validateRequest(eventIdParamSchema, "params"), getSharedArticleByIdController);
router.get("/:eventId/feedbacks", validateRequest(eventIdParamSchema, "params"), getFeedbacksByEventController);
router.get("/:eventId/feedbacks/:feedbackId", validateRequest(eventIdParamSchema, "params"), getFeedbackByIdController);
export default router;
