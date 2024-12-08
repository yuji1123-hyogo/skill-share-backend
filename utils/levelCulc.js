const User = require("../models/User");
const Club = require("../models/Club");

// 計算式ベースの次のレベル経験値を算出
function calculateNextLevelExperience(level) {
    const baseExp = 100; // 基本経験値
    const multiplier = 1.5; // レベルごとの倍率
    return Math.floor(baseExp * Math.pow(level, multiplier));
  }
  


// 経験値を追加し、レベルアップ処理を行う
const addExperience=({currentExperience, level, nextLevelExperience},experience)=>{
    currentExperience +=experience ;
  
    while (currentExperience >= nextLevelExperience) {
      currentExperience -= nextLevelExperience;
      level += 1;
      nextLevelExperience = calculateNextLevelExperience(level);
    }
  
    return { currentExperience, level, nextLevelExperience };
}
  


// ユーザータグに経験値を追加
async function addExperienceToUserTag(userId, tagname, expToAdd) {
    const user = await User.findById(userId);

    if (!user) throw new Error("ユーザーが見つかりません");
  
    const updatedTag = await user.addExperienceToTag(tagname, expToAdd);
    return updatedTag;
  }
  
// クラブタグに経験値を追加
async function addExperienceToClubTag(
    { currentExperience, level, nextLevelExperience,experience }
) {
    const updatedProgress = addExperience({ currentExperience, level, nextLevelExperience});
    return targetTag;
  }



module.exports = { 
    addExperienceToUserTag,addExperienceToClubTag,
    calculateNextLevelExperience,addExperience,
    addExperienceToClubTag
};
  