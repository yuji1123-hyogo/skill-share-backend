import * as yup from "yup";

/**
 * ✅ タグ検索のバリデーションスキーマ
 */
export const searchTagSchema = yup.object({
  query: yup
    .string()
    .trim()
    .required("検索クエリが必要です。")
    .min(2, "検索クエリは2文字以上である必要があります。")
    .max(30, "検索クエリは30文字以内である必要があります。"),

  threshold: yup
    .number()
    .integer("編集距離（threshold）は整数で指定してください。")
    .min(0, "編集距離（threshold）は0以上である必要があります。")
    .max(5, "編集距離（threshold）は5以下である必要があります。")
    .default(2),

  limit: yup
    .number()
    .integer("取得件数（limit）は整数で指定してください。")
    .min(1, "取得件数（limit）は1以上である必要があります。")
    .max(50, "取得件数（limit）は50以下である必要があります。")
    .default(10),
});
