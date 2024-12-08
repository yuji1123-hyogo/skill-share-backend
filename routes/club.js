const express = require("express");
const Club = require("../models/Club");
const Tag = require("../models/Tag");
const { registerNewTags, validateTags } = require("../utils/tagUtils");
const { addExperienceToClubTag, addExperience } = require("../utils/levelCulc");
const User = require("../models/User");
const router = express.Router();






// クラブを作成する
router.post("/", async (req, res) => {
  try {
    const { name, description, tags ,themeImage} = req.body;
    const userId = req.user.user._id

    const existingClub = await Club.findOne({ name });

    if (existingClub) {
        return res.status(400).json({ message: 'このクラブ名は既に使用されています' });
    }

    

    const validatedTags = validateTags({existingTags:[],newTagNames:tags.map((tag)=>tag.name ? tag.name:tag)})
      
    const newClub = new Club({
        name,
        description,
        tags: validatedTags,
        members:[userId],
        themeImage
      });

    await newClub.save();
    return res.status(201).json(newClub);
  } catch (error) {
    console.error("クラブ作成エラー:", error.message);
    return res.status(500).json({ message: "クラブ作成中にエラーが発生しました" });
  }
});

//自分の参加しているクラブの取得
router.get("/myclub", async (req, res) => {
    try {
      const userId = req.user.user._id
  
      const myClub = await Club.find({members:{$in:userId}}).populate("members");;
      if (myClub.length === 0) {
          return res.status(404).json({ message: '参加しているクラブはありません' });
      }
  
      return res.status(200).json(myClub);
    } catch (error) {
      console.error("クラブ取得エラー:", error.message);
      return res.status(500).json({ message: "クラブ取得中にエラーが発生しました" });
    }
  });



// 全クラブを取得
router.get("/", async (req, res) => {
  try {
    const clubs = await Club.find().populate("tags.name").populate("members");
    return res.status(200).json(clubs);
  } catch (error) {
    console.error("クラブ取得エラー:", error.message);
    return res.status(500).json({ message: "クラブ一覧取得中にエラーが発生しました" });
  }
});


// 特定のクラブを取得
router.get("/:id", async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate("members")
      .populate("tags.name")
      .populate("members");
    if (!club) {
      return res.status(404).json({ message: "クラブが見つかりません" });
    }
    console.log(club)
    res.status(200).json(club);
  } catch (error) {
    console.error("クラブ取得エラー:", error.message);
    return res.status(500).json({ message: "クラブ取得中にエラーが発生しました" });
  }
});


// クラブにタグの経験値を追加
router.put("/:id/tags/:tagname/experience", async (req, res) => {
  try {
    const { id, tagname } = req.params;
    const { experience } = req.body;

    const club = await Club.findById(id).populate("members");
    if (!club) {
      return res.status(404).json({ message: "クラブが見つかりません" });
    }

    // タグを検索
    const clubTag = club.tags.find((tag) => tag.name === tagname);
    if (!clubTag) {
        return res.status(404).json({ message: "タグが見つかりません" });
    }

    // 経験値の更新処理
    const { currentExperience, level, nextLevelExperience } = clubTag;
    const updatedTag = addExperience(
       {currentExperience, level, nextLevelExperience},experience 
    );

    // clubTagのプロパティを更新
    clubTag.level = updatedTag.level;
    clubTag.currentExperience = updatedTag.currentExperience;
    clubTag.nextLevelExperience = updatedTag.nextLevelExperience;

    // 保存
    await club.save();
    
    res.status(200).json(club);
  } catch (error) {
    console.error("経験値追加エラー:", error.message);
    return res.status(500).json({ message: "タグの経験値追加中にエラーが発生しました" });
  }
});

// クラブを更新する
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {name,...updatedData} = req.body;

    // 送信されたidを除いてクラブを取得
    const existingClub = await Club.findOne({ name, _id: { $ne: id } });
    if (existingClub) {
      return res.status(400).json({ message: 'クラブ名は既に使用されています。' });
    }

    const club = await Club.findById(id)
    if (!club) {
        return res.status(404).json({ message: "クラブが見つかりません" });
      }

    const existingTag = club.tags || []

    let validatedTags = []
    if(updatedData.tags){
      const updateTagNames = updatedData.tags.map((t)=>t.name ? t.name : t)
      validatedTags = validateTags({existingTag:existingTag,newTagNames:updateTagNames}) 
    }
    
    club.set({
        ...updatedData,
        name: name,
        tags: validatedTags, // バリデーション済みのタグを適用
      });
    await club.save();

    const updatedClub = await Club.findById(id).populate("members")
    return res.status(200).json(updatedClub);
  } catch (error) {
    console.error("クラブ更新エラー:", error.message);
    return res.status(500).json({ message: "クラブ更新中にエラーが発生しました" });
  }
});

// クラブを削除する
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClub = await Club.findByIdAndDelete(id);
    if (!deletedClub) {
      return res.status(404).json({ message: "クラブが見つかりません" });
    }
    return res.status(200).json({ message: "クラブを削除しました" });
  } catch (error) {
    console.error("クラブ削除エラー:", error.message);
    return res.status(500).json({ message: "クラブ削除中にエラーが発生しました" });
  }
});

// クラブに参加する
router.post("/:clubId/join", async (req, res) => {
    try {
      const { clubId } = req.params;
      const  userId = req.user.user._id;
  
      // クラブとユーザーを取得
      const club = await Club.findById(clubId)
      const user = await User.findById(userId);
  
      if (!club) throw new Error("クラブが見つかりません");
      if (!user) throw new Error("ユーザーが見つかりません");
  
      if (club.members.map(String).includes(userId)) { 
        return res.status(400).json({ error: "すでにクラブのメンバーです" });
      }
  
      // メンバーリストに追加
      club.members.push(userId);
      await club.save();
  
      club.populate("members")
      // ユーザーのクラブ参加リストに追加
      user.clubs = user.clubs || [];
      user.clubs.push(clubId);
      await user.save();
  
      

      res.status(200).json({ message: "クラブに参加しました", club });
    } catch (err) {
      res.status(400).json({ error: err.message });
      console.log(req.body)
    }
  });

module.exports = router;
