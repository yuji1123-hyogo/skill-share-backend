const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    bio: { type: String, default: '' },
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Club' }],  // 所属クラブ
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],  // 投稿リスト
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // フォローしているユーザー
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // フォロワー
    directMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],  // ダイレクトメッセージ
    hobbies: [
      {
        name: { type: String, required: [true, "タグ名が必要です"], },  
        level: { type: Number, default: 1 },  // 現在のレベル
        currentExperience: { type: Number, default: 0 },  // 現在の経験値
        nextLevelExperience: { type: Number, default: 100 },  // 次のレベルに必要な経験値
      }],
    eventsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  }, { timestamps: true });




module.exports = mongoose.model("User",UserSchema);