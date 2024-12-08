const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

router.get("/",(req,res)=>{
    res.send("ポストページ")
})


//コメント用
// コメントを追加するエンドポイント
router.post("/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const {content} = req.body;
      const authorId = req.user.user._id
  
      if (!content) {
        return res.status(400).json({ error: "コメント内容は必須です" });
      }
  
      // コメントを投稿に追加
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "投稿が見つかりません" });
      }
  
      const newComment = {
        content,
        author: authorId,
      };
  
      post.comments.push(newComment);
      await post.save();
  
      res.status(200).json(post);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "コメントの追加に失敗しました" });
    }
  });
  
  // コメント一覧を取得するエンドポイント
  router.get("/:postId/comments", async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await Post.findById(postId).populate("comments.author");

      if (!post) {
        return res.status(404).json({ error: "投稿が見つかりません" });
      }
      if(!post.comments || post.comments.length === 0){
        return res.status(404).json({ error: "コメントはありません" });
      }
      res.status(200).json(post.comments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "コメントの取得に失敗しました" });
    }
  });


  //クラブのポスト取得用
  // クラブの投稿を取得するエンドポイント
  router.get("/clubpost/:clubId", async (req, res) => {
    try {
      const { clubId } = req.params;
  
      // クラブIDで投稿をフィルタリング
      const posts = await Post.find({ club: clubId })
        .populate("author") // 投稿者情報を展開
        .populate("club", "name") // クラブ情報を展開
        .sort({ createdAt: -1 }); // 最新の投稿から順にソート
  
      if (!posts.length) {
        return res.status(404).json({ message: "投稿が見つかりません" });
      }
  
      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "クラブの投稿を取得中にエラーが発生しました" });
    }
  });

  
//投稿用api
router.post("/",async (req,res)=>{
    try{
        const newpost = new Post({ ...req.body})
        const savedPost = await newpost.save()
        const populatedPost = await Post.findById(savedPost._id).populate("author");

        return res.status(200).json(populatedPost);
        
    }catch(e){
        // エラーハンドリング
        console.error(e);
        return res.status(500).json({ message: "ポストの投稿中にエラーが発生しました" ,e});
    }
})


//タイムラインを取得するapi
router.get("/timeline",async (req,res)=>{
    try{
        const currentUserId = req.user.user._id
        //対象のユーザー
        const targetUser = await User.findById(currentUserId)
        if (!targetUser) {
            return res.status(404).json({ message: "ユーザーが見つかりませんでした" });
        }
        // following配列を取得
        const followingList = targetUser.following;
        //対象ユーザー自身のポストを取得
        const hisPosts = await Post.find({author:currentUserId}).populate('author')
        //followingのポストを取得
        const followingPosts = await Post.find({author:{$in:followingList}}).populate('author')
        const allposts = hisPosts.concat(followingPosts)


        return res.status(200).json(allposts)
    }catch(e) {
        console.error("エラー詳細:", e.message, e.stack); // エラーメッセージとスタックトレースを出力
        return res.status(500).json({
            message: "フォロー一覧取得中にエラーが発生しました",
            error: e.message // エラーメッセージもレスポンスに含める
        });
    }
})


//投稿取得用api
router.get("/:id",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id).populate('author')
        return res.status(200).json({
            message:"ポストを取得しました",
            post:post
        })
    }catch(e){
        // エラーハンドリング
        console.error(e);
        return res.status(500).json({ message: "ポストの取得中にエラーが発生しました" });
    }
})


//投稿更新用api
router.put("/:id",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: "ポストが見つかりません" });
        }

        if(post.author.toString() === req.user.id){
            const updatedPost = await Post.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },  
                { new: true }  
            );
            return res.status(200).json({message:"ポストを編集しました",post:updatedPost})
        }else{
            return res.status(403).json({message:"他のユーザーのポストは編集できません"})
        }
    }catch(e){
        console.error(e);
        return res.status(500).json({message:"ポストの更新に失敗しました"})
    }
})

//投稿削除用api
router.delete("/:id",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: "ポストが見つかりません" });
        }

        if(post.author.toString() === req.user.id){
            await Post.findByIdAndDelete(req.params.id);
            return res.status(200).json({message:"ポストを削除しました"})
        }else{
            return res.status(403).json({message:"他のユーザーのポストは削除できません"})
        }
    }catch(e){
        console.error(e);
        return res.status(500).json({message:"ポストの削除に失敗しました"})
    }
})

//いいね用api
router.put("/:id/like",async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({message:"投稿が見つかりませんでした"})
        }
        //自分のフォロー一覧に既に相手のユーザーが存在しているかどうか
        if(post.likes.includes(req.user.id)){
            await post.updateOne({ $pull: { likes: req.user.id } });
            return res.status(200).json({ message: "いいねを解除しました" });
        }else{
            await post.updateOne({ $push: { likes: req.user.id } });
            return res.status(200).json({ message: "いいねしました" });
        }
    }catch(e){
        console.error(e);
        return res.status(500).json({message:"いいね操作中にエラーが発生しました"})
    }
})



module.exports = router