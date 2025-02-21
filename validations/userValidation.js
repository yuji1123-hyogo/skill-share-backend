import * as yup from "yup";

// `params` の userId のバリデーション
export const userIdParamSchema = yup.object({
    userId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "無効なユーザーIDです").required(),
});

// ✅ ユーザー情報の更新バリデーション
export const updateUserSchema = yup.object({
    username: yup.string().min(3, "ユーザー名は3文字以上である必要があります").max(20, "ユーザー名は20文字以内である必要があります").optional(),
    profilePicture: yup.string().url("有効なURLを入力してください").nullable().optional(),
    bio: yup.string().max(200, "自己紹介は200文字以内で入力してください").nullable().optional(),
    tags: yup.array().of(yup.string()).optional(),
    location:yup.object({
        type:yup.string().default("Point"),
        coordinates:yup.array().of(yup.number()).optional().default([0,0]),
        address:yup.string().nullable().optional().default(null)
    }).optional()
});

// ✅ ユーザー検索バリデーション
export const searchUserSchema = yup.object({
    username: yup.string().optional().nullable(),
    tags: yup.array().of(yup.string()).optional().typeError("タグは配列形式である必要があります"),
});

// ✅ フォロー/フォロー解除バリデーション
export const toggleFollowUserSchema = yup.object({
    userId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "無効なユーザーIDです").required(),
});


