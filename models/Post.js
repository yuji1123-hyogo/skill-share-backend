import mongoose from "mongoose";

// 投稿スキーマ
const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    media: { type: String, default: null },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", default: null },
    tags: [
      {
        name: { type: String, required: true },
        level: { type: Number, default: 1 },
        currentExperience: { type: Number, default: 0 },
        nextLevelExperience: { type: Number, default: 100 },
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] }],
  },
  { timestamps: true }
);

// `toJSON` メソッドでデータを整形
PostSchema.set("toJSON", {
  virtuals: true, // Virtuals を有効化
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.media = ret.media ?? null;
    ret.club = ret.club?.toString() ?? null;

    // `populate("author")` している場合は `userSummary` を適用し、ネストを削除
    if (ret.author && typeof ret.author === "object" && ret.author.userSummary) {
      ret.author = { ...ret.author.userSummary }; // `userSummary` を展開
    } else {
      ret.author = ret.author?.toString() ?? null;
    }

    ret.comments = ret.comments?.map((comment) => comment.toString()) ?? [];
    ret.tags =
      ret.tags.length > 0
        ? ret.tags.map((tag) => ({
            id: tag._id.toString(),
            name: tag.name,
            level: tag.level,
            currentExperience: tag.currentExperience,
            nextLevelExperience: tag.nextLevelExperience,
          }))
        : [];

    ret.createdAt = ret.createdAt?.toISOString();

    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

// Mongoose モデルの作成
const Post = mongoose.model("Post", PostSchema);
export default Post;
