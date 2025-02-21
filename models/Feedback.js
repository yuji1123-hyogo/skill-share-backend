import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    media: { type: String, default: null },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] }],
  },
  { timestamps: true }
);

// toJSON メソッドの設定
FeedbackSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model("Feedback", FeedbackSchema);