const express = require("express");
const router = express.Router();
const {
  determineMVP,
  createEvent,
  addParticipant,
  getEventsByTags,
  distributeExperience,
  voteForMVP,
  recommendEventsForUser,
  updateEventStatus,
} = require("../utils/eventUtils"); 
const Event = require("../models/Event");



//event関連のresponseはクラブ名、候補者名、参加者をpopulateして返しておく

//全イベントを取得
router.get("/", async (req, res) => {
    try {
      const events = await Event.find()
      .populate("participants.user")
      .populate("votes.candidate","username")
      .populate("club","name")
      .populate("mvp","username")


      return res.status(200).json(events);
    } catch (error) {
      console.error("イベント取得エラー:", error.message);
      return res.status(500).json({ message: "イベント一覧取得中にエラーが発生しました" });
    }
  });


// イベントを作成する
router.post("/create", async (req, res) => {
    const userId = req.user.user._id
    const eventdata = {...req.body,user:userId}
  try {
    const {event,club} = await createEvent(eventdata);
    return res.status(201).json({event,club});
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});




// クラブが開催中のイベントを取得する
router.get("/clubEvents/:clubId", async (req, res) => {
    try {
      const { clubId } = req.params; 
      const events = await Event.find({club:clubId})
      .populate("participants.user")
      .populate("votes.candidate","username")
      .populate("club","name")
      .populate("mvp","username")
      
      if(events.length === 0){
        return res.status(404).json({ message:"イベントが見つかりませんでした"});
      }
      return res.status(200).json(events);
    } catch (err) {
        console.error("イベント取得エラー:", err);
        return res.status(500).json({ message:"イベント取得に失敗しました",error:err});
    }
  });

// イベントに参加する
router.post("/:eventId/participate", async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId  = req.user.user._id;
    const event = await addParticipant(eventId, userId);
    const updateEvent = await Event.findById(eventId)
    .populate("participants.user")
    .populate("votes.candidate","username")
    .populate("club","name")
    .populate("mvp","username")
    res.status(200).json(updateEvent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// タグでイベントを検索する
router.get("/search", async (req, res) => {
  try {
    const { tags } = req.query; // クエリパラメータからタグリストを取得
    const taglist = tags.split(","); // カンマ区切りを配列に変換
    const events = await getEventsByTags(taglist);
    res.status(200).json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 経験値を分配する
router.post("/:eventId/distribute-experience", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { experience, mvpUserId, mvpBonus, clubExperienceMultiplier } = req.body;
    await distributeExperience(eventId, experience, mvpUserId, mvpBonus, clubExperienceMultiplier);

    // イベントのstatusをcompletedに更新しつつイベント情報を取得
    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { status: "completed" }, // statusを更新
        { new: true } // 更新後のドキュメントを取得
      )
        .populate("participants.user") // 参加者のユーザー情報を展開
        .populate("votes.candidate", "username") // 投票候補者のusernameを展開
        .populate({
            path: "club", // クラブ情報を展開
            populate: { path: "members", select: "username"} // クラブのメンバー情報をさらに展開
          })
        .populate("mvp", "username"); // MVPのusernameを展開
  
      // 更新結果を返す
      res.status(200).json(updatedEvent);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



// MVP に投票する
router.post("/:eventId/vote", async (req, res) => {
  try {
    const { eventId } = req.params;
    const {candidateId } = req.body;
    const voterId = req.user.user._id
    const event = await voteForMVP(eventId, voterId, candidateId);
    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// MVP を決定する
router.post("/:eventId/determine-mvp", async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await determineMVP(eventId);
    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ユーザーの趣味に基づくイベントのおすすめ
router.get("/recommend/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const events = await recommendEventsForUser(userId);
    res.status(200).json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



router.get("/:id", async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
      .populate("participants.user")
      .populate("votes.candidate","username")
      .populate("club","name")
      .populate("mvp","username")

      if (!event) {
        return res.status(404).json({ message: "イベントが見つかりません" });
      }
      res.status(200).json(event);
    } catch (error) {
      console.error("イベント取得エラー:", error.message);
      return res.status(500).json({ message: "イベント取得中にエラーが発生しました" });
    }
});

// イベントのステータスを更新する
router.patch("/:eventId/status", async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await updateEventStatus(eventId);
    res.status(200).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




module.exports = router;

