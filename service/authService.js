import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUserrepository, findUserByEmailRepository, findUserByUsernameRepository } from "../repository/userRepository.js";

/**
 * ✅ ユーザー登録処理
 */
export const registerUser = async (username, email, password) => {
  const existingUser = await findUserByEmailRepository(email);
  if (existingUser) throw { status: 400, message: "このメールアドレスは既に使用されています" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUserrepository(username, email, hashedPassword);
  return user
};

/**
 * ✅ ユーザーログイン処理
 */
export const login = async (email, password) => {
  const user = await findUserByEmailRepository(email);
  if (!user) throw { status: 400, message: "メールアドレスが見つかりません" };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { status: 400, message: "パスワードが違います" };

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "200h" });

  return { token, user };
};

/**
 * ✅ メールアドレスの存在チェック
 */
export const checkEmailExists = async (email) => {
  const user = await findUserByEmailRepository(email);
  return !!user;
};

/**
 * ✅ ユーザー名の存在チェック
 */
export const checkUsernameExists = async (username) => {
  const user = await findUserByUsernameRepository(username);
  return !!user;
};
