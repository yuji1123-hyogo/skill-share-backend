import express from "express";

import { getFollowListController, getPublicUserController, getUserClubsController,   searchUsersController, toggleFollowUserController, updateUserController } from "../contorollers/userController.js";
import { searchUserSchema, toggleFollowUserSchema, updateUserSchema, userIdParamSchema } from "../validations/userValidation.js";
import { validateRequest } from "../middlewears/validateRequest.js";

const router = express.Router();

router.get("/search", validateRequest(searchUserSchema,"query"), searchUsersController);
router.get("/:userId", validateRequest(userIdParamSchema,"params"), getPublicUserController);
router.put("/:userId/follow", validateRequest(toggleFollowUserSchema,"params"), toggleFollowUserController);
router.get("/me/clubs", getUserClubsController);
router.put("/me", validateRequest(updateUserSchema), updateUserController);
router.get("/me/following", getFollowListController);

export default router;
