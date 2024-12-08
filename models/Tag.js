const mongoose = require("mongoose");

const TagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // タグ名
  description: { type: String, default: '' },  // タグの説明
  category: { type: String, default: '' },  // タグカテゴリ
});

module.exports = mongoose.model("Tag", TagSchema);
