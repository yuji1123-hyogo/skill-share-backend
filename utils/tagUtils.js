const Tag = require("../models/Tag");


//タグのバリデーション
const validateTags = ({existingTag=[],newTagNames}) => {
    
    const existingTagNames = existingTag.map((t)=>t.name ? t.name : t)
    const acceptedTagNamesInNewTag = newTagNames.filter(tagName => !existingTagNames.includes(tagName));
    const acceptedTagInExistInTag = existingTag.filter((tag)=> newTagNames.includes(tag.name))

    const formatedTag =  acceptedTagNamesInNewTag.map(tagName => ({
      name: tagName,
      level: 1,
      currentExperience: 0,
      nextLevelExperience: 100,
    }));
    
    return [...formatedTag,...acceptedTagInExistInTag]
  };


// タグ登録処理
async function registerNewTags(tags) {
    const errors = [];
    const promises = tags.map(async (tagName) => {
      try {
        await Tag.updateOne(
          { name: tagName },
          { $setOnInsert: { name: tagName } },
          { upsert: true }
        );
      } catch (error) {
        console.error(`タグ登録エラー: ${tagName}`, error.message);
        errors.push({ tag: tagName, error: error.message });
      }
    });
  
    await Promise.all(promises);
  
    if (errors.length > 0) {
      console.warn("一部のタグ登録に失敗しました:", errors);
    }
}

// タグ一覧を取得
async function getTags() {
  return await Tag.find();
}

// タグを作成
async function createTag(data) {
  const { name, description, category } = data;

  const existingTag = await Tag.findOne({ name });
  if (existingTag) throw new Error("タグは既に存在します");

  const tag = new Tag({ name, description, category });
  return await tag.save();
}


// タグを名前で検索
async function searchTagsByName(name) {
  return await Tag.find({ name: { $regex: name, $options: "i" } }); // 部分一致の検索
}

module.exports = {
  validateTags,
  getTags,
  createTag,
  searchTagsByName,
  registerNewTags
};
