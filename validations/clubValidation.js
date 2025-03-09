import * as yup from "yup";

/**
 * クラブ作成のバリデーションスキーマ
 */
export const createClubSchema = yup.object({
  name: yup
    .string()
    .required("クラブ名は必須です")
    .max(50, "クラブ名は最大50文字まで"),
  description: yup.string().max(200, "説明は最大200文字まで").nullable(),
  themeImage: yup.string().url("有効なURLを入力してください").nullable(),
  tags: yup
    .array()
    .default([]),
  location: yup.object({
    type: yup.string().optional().default("Point"),
    coordinates: yup.array().of(yup.number()).optional().default([0,0]),
    address: yup.string().optional().nullable().default(null),
  }).nullable().optional(),
});

/**
 * クラブ編集のバリデーションスキーマ
 */
export const updateClubSchema = yup.object({
  name: yup.string().max(50, "クラブ名は最大50文字まで").optional(),
  description: yup.string().max(200, "説明は最大200文字までです").optional().nullable(),
  themeImage: yup.string().url("有効なURLを入力してください").nullable().optional(),
  tags: yup
    .array()
    .optional()
    .nullable(),
  location: yup.object({
    type: yup.string().optional().default("Point"),
    coordinates: yup.array().of(yup.number()).optional().default([0,0]),
    address: yup.string().optional().nullable().default(null),
  }).nullable().optional(),
});

/**
 * クラブ検索のバリデーションスキーマ
 */
export const searchClubSchema = yup.object({
    name: yup.string().max(50, "クラブ名は最大50文字まで").nullable(),
    tags: yup.array().default([]),
    coordinates: yup.array().of(yup.number()).optional(),
    radius: yup.number().optional(),
  });


// クラブ ID のバリデーション (params)
export const clubIdParamSchema = yup.object({
    clubId: yup.string().matches(/^[0-9a-fA-F]{24}$/, "無効なクラブIDです").required(),
});

// 地図情報でクラブを検索のバリデーションスキーマ
export const locationSchema = yup.object({
  latitude: yup.number().required("緯度は必須です"),
  longitude: yup.number().required("経度は必須です"),
});

  