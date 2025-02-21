import * as yup from "yup";

// 🎯 MongoDB ObjectId のバリデーション
const objectIdSchema = yup
  .string()
  .matches(/^[0-9a-fA-F]{24}$/, "無効なID形式です")
  .required("有効なIDが必要です");

// 🎯 イベント作成時のバリデーション
export const createEventSchema = yup.object({
    name: yup.string().required("イベント名は必須です"),
    description: yup.string().nullable().optional().default(null),
    date: yup.date().nullable().optional().default(null),  // ISO 8601 の文字列として送信されることを想定
    location: yup.string().nullable().optional().default(null),
    picture: yup.string().nullable().optional().default(null),
    club: objectIdSchema,
    eventtags: yup.array().of(yup.string().required()).default([]),
});

// 🎯 イベントIDのバリデーション（全ての `eventId` を含むルートで使用可能）
export const eventIdParamSchema = yup.object({
    eventId: objectIdSchema,
});

// 🎯 イベント参加のバリデーション
export const participateEventSchema = eventIdParamSchema;

// 🎯 MVP 投票のバリデーション
export const voteForMvpSchema = yup.object({
    candidate: objectIdSchema
});


