import * as yup from "yup";

/**
 * ✅ バリデーションミドルウェア
 * @param {yup.ObjectSchema} schema - バリデーションスキーマ
 * @param {"body" | "query" | "params"} location - バリデーション対象（デフォルトは body）
 */
export const validateRequest = (schema, location = "body") => {
  return async (req, res, next) => {
    try {
      // Yup でリクエストのバリデーションを実行
      req[location] = await schema.validate(req[location], { abortEarly: false });
      next(); // 成功したら次の処理へ
    } catch (error) {
      res.status(400).json({ message: error.errors[0] || "リクエストバリデーションエラー", errors: error.errors || []});
    }
  };
};
