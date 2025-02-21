import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    sharedArticle: { type: mongoose.Schema.Types.ObjectId, ref: "SharedArticle", default: null },
    feedback: { type: mongoose.Schema.Types.ObjectId, ref: "Feedback", default: null },
  },
  { timestamps: true }
);

// `.toJSON()` メソッドでデータを整形
CommentSchema.set("toJSON", {
  virtuals: true, // Virtuals を有効化
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.content = ret.content ?? null;

    // `populate("author")` されている場合は `userSummary` を適用し、ネストを削除
    if (ret.author && typeof ret.author === "object" && ret.author.userSummary) {
      ret.author = { ...ret.author.userSummary }; // `userSummary` を展開
    } else {
      ret.author = ret.author?.toString() ?? null;
    }

    ret.post = ret.post?.toString() ?? null;
    ret.createdAt = ret.createdAt.toISOString();

    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt; // `updatedAt` をレスポンスから削除
    return ret;
  },
});

// モデルをエクスポート
const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
