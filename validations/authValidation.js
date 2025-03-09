import * as yup from "yup";

// ユーザー登録のバリデーションスキーマ
export const registerSchema = yup.object({
    username: yup
      .string()
      .trim()
      .required("ユーザー名は必須です")
      .max(30, "ユーザー名は30文字以内で入力してください"),

    email: yup
      .string()
      .trim()
      .email("有効なメールアドレスを入力してください")
      .required("メールアドレスは必須です"),

    password: yup
      .string()
      .trim()
      .required("パスワードは必須です"),
});

// ログインのバリデーションスキーマ
export const loginSchema = yup.object({
    email: yup
      .string()
      .trim()
      .email("有効なメールアドレスを入力してください")
      .required("メールアドレスは必須です"),
    password: yup.string().trim().required("パスワードは必須です"),
});

// メールアドレス存在チェック（クエリパラメータ）
export const checkEmailSchema = yup.object({
    email: yup
      .string()
      .trim()
});

// ユーザー名存在チェック（クエリパラメータ）
export const checkUsernameSchema = yup.object({
    username: yup
      .string()
      .trim()
      .required("ユーザー名は必須です")
});
