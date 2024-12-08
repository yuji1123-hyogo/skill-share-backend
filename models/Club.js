const mongoose = require("mongoose");
const ClubSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String},
    themeImage: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // メンバーリスト
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],  // クラブイベント
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],  // クラブ内投稿
    invitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invitation' }],  // 招待リクエスト
    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JoinRequest' }],  // 参加リクエスト
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },  // クラブ内トークチャット
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // クラブ管理者
    tags: [
      {  
        name: { type: String, required: true }, 
        level: { type: Number, default: 1 },  // 現在のレベル
        currentExperience: { type: Number, default: 0 },  // 現在の経験値
        nextLevelExperience: { type: Number, default: 100 },  // 次のレベルに必要な経験値
      },
    ],
  }, { timestamps: true });





module.exports = mongoose.model("Club",ClubSchema);