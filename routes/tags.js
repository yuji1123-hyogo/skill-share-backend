const Club = require("../models/Club");
const User = require("../models/User");
const Event = require("../models/Event");
const router = require("express").Router();

router.post("/tagsearch", async (req, res) => {
    const { inputVal, mode } = req.body; // 入力値とモードを取得

    if (!inputVal) {
        return res.status(400).json({ error: "検索ワードが指定されていません" });
    }

    try {
        let results = [];
        const regex = new RegExp(inputVal, "i"); // 部分一致検索用の正規表現

        if (mode === "user") {
            // ユーザーの趣味フィールドから検索
            results = await User.find({ "hobbies.name": { $regex: regex } }).select("hobbies.name");
            results = results.flatMap(user => user.hobbies.map(hobby => hobby.name));

        } else if (mode === "club") {
            // クラブのタグフィールドから検索
            results = await Club.find({ "tags.name": { $regex: regex } }).select("tags.name");
            results = results.flatMap(club => club.tags.map(tag => tag.name));

        } else if (mode === "event") {
            // イベントのタグフィールドから検索
            results = await Event.find({ tags: { $regex: regex } }).select("tags");
            results = results.flatMap(event => event.tags);

        } else {
            return res.status(400).json({ error: "無効な検索モードが指定されました" });
        }

        // 検索結果が空の場合のレスポンス
        if (!results || results.length === 0) {
            return res.status(404).json({ message: "該当するタグが見つかりませんでした" });
        }

        // 重複を排除してタグの文字列配列を返す
        const uniqueTags = [...new Set(results)];
        return res.status(200).json(uniqueTags);

    } catch (err) {
        console.error("タグ検索エラー:", err);
        return res.status(500).json({ error: "検索処理に失敗しました" });
    }
});

module.exports = router;