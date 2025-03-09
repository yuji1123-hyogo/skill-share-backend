import { checkEmailExists, checkUsernameExists, login, registerUser } from "../service/authService.js";

/**
 * ユーザー登録コントローラー
 */
export const registerController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser(username, email, password);
    res.status(201).json({ message: `ユーザー登録が完了しました (${username} さん)` ,user:user});
  } catch (error) {
    next(error); // グローバルエラーハンドラーへ
  }
};

/**
 * ユーザーログインコントローラー
 */
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await login(email, password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 360000000, // 100時間
    });

    res.status(200).json({ message: `ログイン:${user.username} さん`, user:user });
  } catch (error) {
    next(error);
  }
};

/**
 * ログアウトコントローラー
 */
export const logoutController = (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "ログアウトしました" });
};

/**
 * メールアドレスの存在チェック
 */
export const checkEmailController = async (req, res, next) => {
  try {
    const { email } = req.query;
    const exists = await checkEmailExists(email);
    if(exists){
      res.status(200).json({message:"他のメールアドレスをお試しください",exists:exists });
    }else{
      res.status(200).json({message:"このメールアドレスは使用可能です",exists:exists });
    }
    
  } catch (error) {
    next(error);
  }
};

/**
 * ユーザー名の存在チェック
 */
export const checkUsernameController = async (req, res, next) => {
  try {
    const { username } = req.query;
    const exists = await checkUsernameExists(username);
    if(exists){
      res.status(200).json({message:"他のユーザー名をお試しください",exists:exists });
    }else{
      res.status(200).json({message:"このユーザー名は使用可能です",exists:exists });
    }
  } catch (error) {
    next(error);
  }
};

