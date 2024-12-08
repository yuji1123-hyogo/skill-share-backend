const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true }, // イベント名
  description: { type: String, default: "" }, // イベントの説明
  date: { type: Date}, // イベント日時
  location: { type: String, default: "" }, // 開催地
  status: { type: String, enum: ["upcoming", "ongoing", "completed"], default: "upcoming" }, 
  club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true }, // 関連するクラブ
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 参加者
      experienceAwarded: { type: Number, default: 0 }, // このイベントで得た経験値
    },
  ],
  mvp: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // MVP に選ばれたユーザー
  votes: [
    {
      voter: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 投票者
      candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 投票先
    },
  ],
  tags: [{ type: String, required: true }],
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
