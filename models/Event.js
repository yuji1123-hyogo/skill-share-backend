import mongoose from "mongoose";
import { EVENT_STATUS } from "../constants/eventStatus.js";

const EventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, default: null },
    date: { type: Date, default: null },
    picture:{type: String, default: null},
    location: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(EVENT_STATUS),
      default: EVENT_STATUS.UPCOMING
    },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    mvp: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    votes: [
      {
        voter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    sharedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: "SharedArticle" }],
    feedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Feedback" }],
    expDistributed: { type: Boolean, default: false },
    eventtags: [{ type: String }],
  },
  { timestamps: true }
);

// `.toJSON()` メソッドでフロントエンド用にデータを整形
EventSchema.set("toJSON", {
  virtuals: true, // Virtuals を有効化
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;

    ret.date = ret.date?.toISOString() ?? null;
    ret.description = ret.description ?? null;
    ret.location = ret.location ?? null;

    // `host` に `userSummary` を適用
    if (ret.host && typeof ret.host === "object" && ret.host.userSummary) {
      ret.host = { ...ret.host.userSummary };
    } else {
      ret.host = ret.host?.toString() ?? null;
    }

    // `participants` に `userSummary` を適用
    ret.participants = Array.isArray(ret.participants)
      ? ret.participants.map((p) =>
          typeof p === "object" && p !== null && p.userSummary ? { ...p.userSummary } : p.toString()
        )
      : [];

    // `mvp` に `userSummary` を適用
    if (ret.mvp && typeof ret.mvp === "object" && ret.mvp.userSummary) {
      ret.mvp = { ...ret.mvp.userSummary };
    } else {
      ret.mvp = ret.mvp?.toString() ?? null;
    }

    // `votes` の `voter` & `candidate` を ObjectId の文字列に変換
    ret.votes = Array.isArray(ret.votes)
      ? ret.votes.map((vote) => ({
          voter: vote.voter?.toString() ?? null,
          candidate: vote.candidate?.toString() ?? null,
        }))
      : [];

    return ret;
  },
});

// Mongoose モデルの作成
const Event = mongoose.model("Event", EventSchema);
export default Event;
