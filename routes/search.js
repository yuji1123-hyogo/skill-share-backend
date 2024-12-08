
const router = require("express").Router()
const Club = require("../models/Club");
const User = require("../models/User");


router.post("/usersearch", async (req, res) => {
    const { searchTerm, tags } = req.body;

    console.log(tags)
    if (!searchTerm && (!tags || tags.length === 0)) {
        return res.status(400).json({ error: "検索ワードまたはタグが指定されていません" });
    }

    try {
        const queryConditions = [];

        // ユーザー名による検索条件を追加
        if (searchTerm) {
            queryConditions.push({ username: { $regex: searchTerm, $options: "i" } }); // 部分一致検索
        }

        // タグによる検索条件を追加
        if (tags && tags.length > 0) {
            queryConditions.push({ "hobbies.name": { $in: tags } });
        }

        // クエリ条件を `$or` 演算子で結合
        const results = await User.find({ $or: queryConditions });

        if (results.length === 0) {
            return res.status(404).json({ message: "検索結果はありません" });
        }

        return res.status(200).json(results); // 検索結果をクライアントに返す
    } catch (err) {
        console.error("ユーザー検索エラー:", err);
        return res.status(500).json({ error: "検索処理に失敗しました" });
    }
});

router.post("/clubsearch", async (req, res) => {
    const { searchTerm, tags } = req.body;

    console.log(tags)
    console.log(searchTerm)
    if (!searchTerm && (!tags || tags.length === 0)) {
        return res.status(400).json({ error: "検索ワードまたはタグが指定されていません" });
    }

    try {
        const queryConditions = [];

        // ユーザー名による検索条件を追加
        if (searchTerm) {
            queryConditions.push({ name: { $regex: searchTerm, $options: "i" } }); // 部分一致検索
        }

        // タグによる検索条件を追加
        if (tags && tags.length > 0) {
            queryConditions.push({ "tags.name": { $in: tags } });
        }

        // クエリ条件を `$or` 演算子で結合
        const results = await Club.find({ $or: queryConditions }).populate("members");

        if (results.length === 0) {
            return res.status(404).json({ message: "検索結果はありません" });
        }

        return res.status(200).json(results); // 検索結果をクライアントに返す
    } catch (err) {
        console.error("ユーザー検索エラー:", err);
        return res.status(500).json({ error: "検索処理に失敗しました" });
    }
});


router.post("/tagsearch", async (req, res) => {
    const { inputVal, mode } = req.body; // 入力値とモードを取得

    if (!inputVal) {
        return res.status(400).json({ error: "検索ワードが指定されていません" });
    }

    try {
        let results = [];
        
        const regex = new RegExp(inputVal, "i"); // 部分一致検索用の正規表現

            // ユーザーの趣味フィールドから検索
            results = await User.find({ "hobbies.name": { $regex: regex } }).select("hobbies.name");
            UserResults = results.flatMap(user => user.hobbies.map(hobby => hobby.name));

            // クラブのタグフィールドから検索
            results = await Club.find({ "tags.name": { $regex: regex } }).select("tags.name");
            ClubResults = results.flatMap(club => club.tags.map(tag => tag.name));


            const totalResults = [...UserResults,...ClubResults]

        // 検索結果が空の場合のレスポンス
        if (!totalResults || totalResults.length === 0) {
            return res.status(404).json({ message: "該当するタグが見つかりませんでした" });
        }

        // 重複を排除してタグの文字列配列を返す
        const uniqueTags = [...new Set(totalResults)];
        return res.status(200).json(uniqueTags);

    } catch (err) {
        console.error("タグ検索エラー:", err);
        return res.status(500).json({ error: "検索処理に失敗しました" });
    }
});




router.post("/usersearchByAtlas", async (req, res) => {

    const { searchTerm } = req.body; // クエリ文字列をリクエストボディから取得
  
    if (!searchTerm) {
      return res.status(400).json({ error: "searchTerm is required" });
    }
  
    try {
      // MongoDB Atlas Searchクエリ
      const results = await User.aggregate([
        {
          $search: {
            index: "default", 
            text: {
              query: searchTerm, // 検索文字列
              path: "username", // 検索対象のフィールド
              fuzzy: {
                maxEdits: 1,//編集距離
                prefixLength: searchTerm.length <= 2 ? 0 : 1,
              },
            },
          },
        },
        {
          $project: {
            username: 1, 
            _id: 1,
            bio: 1,
            profilePicture: 1,
            hobbies:1,
            score: { $meta: "searchScore" }, // スコアを取得
          },
        },
        {
          $sort: { score: -1 }, // スコア順で並び替え
        },
        {
          $limit: 10, // 最大10件を返す
        },
      ]);
  
      res.json(results); // 検索結果をクライアントに返す
    } catch (err) {
      console.error("Error during search:", err);
      res.status(500).json({ error: "Search failed" });
    }
  });






module.exports = router