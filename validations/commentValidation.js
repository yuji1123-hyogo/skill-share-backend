import * as yup from "yup";

// MongoDB ObjectId のバリデーション
export const objectIdSchema = yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "無効なID形式です")
    .required();

// 🎯 コメント作成時のバリデーション
export const createCommentSchema = yup.object({
    content: yup.string().trim().required("コメント内容は必須です"),
});

// 🎯 コメントIDのバリデーション
export const commentIdParamSchema = yup.object({
    commentId: objectIdSchema,
});

// 🎯 投稿IDのバリデーション（コメント一覧取得時）
export const postIdParamSchema = yup.object({
    postId: objectIdSchema,
});

export const articleIdParamSchema = yup.object({
    articleId: objectIdSchema,
});

export const feedbackIdParamSchema = yup.object({
    feedbackId: objectIdSchema,
});
