import * as yup from "yup";

export const createFeedbackSchema = yup.object({
  content: yup.string()
    .required("フィードバック内容は必須です")
    .max(1000, "フィードバックは1000文字以内で入力してください"),
}); 