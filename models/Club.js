import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  type: { type: String, default: "Point" },
  coordinates: { type: [Number], default: [0, 0] },
  address: { type: String, default: null }
});

const ClubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: null },
    themeImage: { type: String, default: null },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    tags: [
      {
        name: { type: String, required: true },
        level: { type: Number, default: 1 },
        currentExperience: { type: Number, default: 0 },
        nextLevelExperience: { type: Number, default: 100 },
      },
    ],
    location: {
      type: locationSchema,
      required: true,
      default: () => ({ type: "Point", coordinates: [0, 0], address: null })
    }
  },
  { timestamps: true }
);

// `.toJSON()` メソッドでデータを整形
ClubSchema.set("toJSON", {
  virtuals: true, // Virtuals を有効化
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.description = ret.description ?? null;
    ret.themeImage = ret.themeImage ?? null;

    // `members` を `populate("members")` している場合は `userSummary` を適用
    ret.members =
      ret.members?.map((member) =>
        typeof member === "object" && member !== null && member.userSummary
          ?  { ...member.userSummary }
          : member.toString()
      ) ?? [];

    ret.events = ret.events?.map((e) => e.toString()) ?? [];
    ret.posts = ret.posts?.map((p) => p.toString()) ?? [];
    ret.tags =
      ret.tags?.map((tag) => ({
        id: tag._id.toString(),
        name: tag.name,
        level: tag.level,
        currentExperience: tag.currentExperience,
        nextLevelExperience: tag.nextLevelExperience,
      })) ?? [];

    ret.createdAt = ret.createdAt?.toISOString();

    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt; // `updatedAt` をレスポンスから削除
    return ret;
  },
});


ClubSchema.index({ location: "2dsphere" });
// モデルをエクスポート
const Club = mongoose.model("Club", ClubSchema);
export default Club;
