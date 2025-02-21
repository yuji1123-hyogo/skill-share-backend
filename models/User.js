import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  type: { type: String, default: "Point" },
  coordinates: { type: [Number], default: [0, 0] },
  address: { type: String, default: null }
});

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: null },
    bio: { type: String, default: null },
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club", default: [] }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
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

// **Virtuals: ポスト用の `author` 情報を提供**
UserSchema.virtual("userSummary").get(function () {
  return {
    id: this._id.toString(),
    username: this.username,
    profilePicture: this.profilePicture ?? null,
  };
});

// **toJSON で virtuals を有効化**
UserSchema.set("toJSON", {
  virtuals: true, // Virtuals を出力に含める
  transform: (doc, ret) => {
    return {
      id: ret._id.toString(),
      username: ret.username,
      profilePicture: ret.profilePicture ?? null,
      bio: ret.bio ?? null,
      clubs: ret.clubs?.map((club) => club.toString()) ?? [],
      posts: ret.posts?.map((post) => post.toString()) ?? [],
      following: ret.following?.map((user) => user.toString()) ?? [],
      tags:
        ret.tags?.map((tag) => ({
          id: tag._id.toString(),
          name: tag.name,
          level: tag.level,
          currentExperience: tag.currentExperience,
          nextLevelExperience: tag.nextLevelExperience,
        })) ?? [],
    };
  },
});

UserSchema.index({ location: "2dsphere" });
// **Mongoose モデルの作成**
const User = mongoose.model("User", UserSchema);
export default User;
