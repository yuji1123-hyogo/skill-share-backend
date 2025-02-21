import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club" },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ], // 参加者（1対1またはグループ）
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // メッセージ送信者
        content: { type: String, required: true }, // メッセージ内容
        sentAt: { type: Date, default: Date.now },
        timestamps: { type: String },
        username: { type: String }
      }
    ]
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
