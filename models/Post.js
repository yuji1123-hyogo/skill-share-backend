const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
    content: { type: String, required: true },  // 投稿内容
    media: { type: String, default: '' },  // メディアファイル
    username:{type:String},
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // 投稿者
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },  
    tags: [String],  // タグ
    comments: [{  // コメント
      content: { type: String },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
    createdAt: { type: Date, default: Date.now },
   }, { timestamps: true });
  
  module.exports = mongoose.model("Post",PostSchema);