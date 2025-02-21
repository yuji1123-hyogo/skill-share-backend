import mongoose from "mongoose";

const SharedArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

// フロントエンド用にデータを整形
SharedArticleSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;

    // authorの整形
    if (ret.author && typeof ret.author === "object") {
      ret.author = {
        id: ret.author._id.toString(),
        username: ret.author.username,
        profilePicture: ret.author.profilePicture
      };
    }

    // commentsの整形
    if (Array.isArray(ret.comments)) {
      ret.comments = ret.comments.map(comment => 
        typeof comment === "object" ? comment.id : comment.toString()
      );
    }

    return ret;
  }
});

const SharedArticle = mongoose.model("SharedArticle", SharedArticleSchema);
export default SharedArticle;