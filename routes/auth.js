import express from "express";
import {
  registerSchema,
  loginSchema,
  checkEmailSchema,
  checkUsernameSchema,
} from "../validations/authValidation.js";
import { validateRequest } from "../middlewears/validateRequest.js";
import { checkEmailController, checkUsernameController, loginController, logoutController, registerController } from "../contorollers/authContoroller.js";

const router = express.Router();

// ユーザー登録
router.post("/register", validateRequest(registerSchema), registerController);

// ログイン
router.post("/login", validateRequest(loginSchema), loginController);

// メールアドレス存在チェック
router.get("/check-email", validateRequest(checkEmailSchema,"query"), checkEmailController);

// ユーザー名存在チェック
router.get("/check-username", validateRequest(checkUsernameSchema,"query"), checkUsernameController);

// ログアウト
router.post("/logout", logoutController);

export default router;
