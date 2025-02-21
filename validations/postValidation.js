import * as yup from "yup";

// ✅ 投稿作成バリデーション
export const postSchema = yup.object({
    content: yup.string().min(1, "投稿内容を入力してください").required(),
    media: yup.string().url("有効なURLを入力してください").nullable().default(null),
    club: yup.string().matches(/^[0-9a-fA-F]{24}$/, "無効なクラブIDです").nullable().default(null),
});

// ✅ 投稿IDのバリデーション
export const postIdParamSchema = yup.object({
    postId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "無効な投稿IDです").required(),
});

// ✅ ユーザーIDのバリデーション
export const userIdParamSchema = yup.object({
    userId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "無効なユーザーIDです").required(),
});

// ✅ クラブIDのバリデーション
export const clubIdParamSchema = yup.object({
    clubId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "無効なクラブIDです").required(),
});
