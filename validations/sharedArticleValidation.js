import * as yup from "yup";

export const createSharedArticleSchema = yup.object({
  title: yup.string()
    .required("タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  url: yup.string()
    .required("URLは必須です")
    .url("有効なURLを入力してください"),
  description: yup.string()
    .max(500, "説明は500文字以内で入力してください"),
  tags: yup.array()
    .of(yup.string())
    .max(5, "タグは5つまでです"),
}); 