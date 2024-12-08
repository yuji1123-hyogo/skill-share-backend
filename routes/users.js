
const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require("../models/Post")
const Tag = require("../models/Tag");
const { registerNewTags, validateTags } = require("../utils/tagUtils");
const { findById } = require("../models/Club");

//初回マウント時などにクッキー内のトークンからユーザー情報をフェッチするapi
router.get("/",async (req,res)=>{
    if (!req.user) {
        return res.status(401).json({ message: '認証が必要です' });
    }
    try{
        const user = await User.findById(req.user.user._id)
        return res.status(200).json(user);
        if(!user){
            return res.status(404).send("ユーザーが見つかりませんでした")
        }
    }catch(e){
        console.log(e)
       return res.status(500).send({ message:"ユーザー情報の取得に失敗しました"})
    }
})

// ユーザーの情報取得(ID)
router.get("/:id",async (req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "ユーザーが見つかりません" });
        }
        const { password, ...userDetails } = user._doc; 
        return res.status(200).json(userDetails)
    }catch(e){
        return res.status(500).json({message:"ユーザー情報の取得に失敗しました"})
    }
})

// ユーザーの情報取得(username,hobbies)
router.post("/search/:username",async (req,res)=>{
    const  username  = req.params.username;
    const  {hobbies} = req.body
    try{
        if (!username) {
            return res.status(400).json({ message: "ユーザー名を指定してください" });
        }
        const userListByUsername = await User.find({ username:username })
        const userListByTag = await User.find({"hobbies.name":{$in:hobbies}})
        const userlist = [...userListByTag,...userListByUsername]
        // ユーザーが存在しない場合
        if (userlist.length === 0) {
            return res.status(404).json({ message: "ユーザーが見つかりません" });
        }
        // 各ユーザーからパスワードを除外
        const userDetailsList = userlist.map(user => {
            const { password, ...userDetails } = user._doc;
            return userDetails;
        });

        // パスワードを除外したユーザーリストを返却
        return res.status(200).json(userDetailsList);
    }catch(e){
        return res.status(500).json({
            error: e,
            message:`ユーザー情報の取得に失敗しました`})
    }
})



//プロフィール編集
router.put("/", async (req, res) => {
    try {
        const id = req.user.user._id
      const { username, ...otherData } = req.body;
  

      // ユーザーを検索
      const user = await User.findById(req.user.user._id);
  
      if (!user) {
        return res.status(403).json({ message: "ユーザーが見つかりません" });
      }
      
      const existingUser = await User.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({ message: "ユーザー名は既に使用されています。" });
      }
  
      

      const updatedData = {...req.body}

      // タグの整形
      if (otherData.hobbies) {
        const existingTag = user.hobbies || [];
        const updateTagNames = otherData.hobbies.map((h) => (h.name ? h.name : h));
        const validatedTags = validateTags({
          existingTag: existingTag,
          newTagNames: updateTagNames,
        });
        updatedData.hobbies = validatedTags
      }
  
      // パスワードのハッシュ化
      if (req.body.password && req.body.password.length > 0) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        updatedData.password = hashedPassword;
      }
  
      // ユーザー情報を更新
      const updatedUser = await User.findByIdAndUpdate(
        req.user.user._id,
        updatedData,
        { new: true }
      );
  
      console.log(updatedUser)

      // パスワードを除外してレスポンスを返す
      const { password: password, ...userDetails } = updatedUser._doc;
      res.status(200).json(userDetails);
    } catch (e) {
      // エラーログにリクエスト内容とエラー情報を出力
      console.error("ユーザー情報更新エラー:", {
        message: e.message,
        stack: e.stack,
        requestBody: req.body,
        requestParams: req.params,
        userId: req.user.user._id,
      });
      return res.status(500).json({ message: "ユーザー情報の更新に失敗しました" });
    }
  });

//ユーザーのフォローを行うapi
router.put("/:id/follow",async (req,res)=>{
    try{
        const followTargetUser = await User.findById(req.params.id)
        const currentUser = await User.findById(req.user.user._id)

        if(!followTargetUser ){
            return res.status(404).json({message:"フォローする相手が見つかりませんでした"})
        }
        if(req.params.id === req.user.user._id){
            return res.status(403).json({message:"自身をフォローすることはできません"})
        }
        //自分のフォロー一覧に既に相手のユーザーが存在しているかどうか
        if(currentUser.following.includes(req.params.id)){
            await currentUser.updateOne({ $pull: { following: req.params.id } });
            await followTargetUser.updateOne({ $pull: { followers: req.user.user._id } });
            const updateUser =  await User.findById(req.user.user._id)
            return res.status(200).json({ message: "フォローを解除しました" ,updateUser});
        }else{
           await currentUser.updateOne({ $push: { following: req.params.id } });
            await followTargetUser.updateOne({ $push: { followers: req.user.user._id } });
            const updateUser =  await User.findById(req.user.user._id)
            return res.status(200).json({ message: "フォローしました" ,updateUser});
        }
    }catch(e){
        console.error("サーバー側エラー:", e); // サーバー側にエラーログを出力
        return res.status(500).json({ message: "フォローAPIで問題が発生しました", error: e.message });
    }
})

//フォローしているユーザーの一覧を取得するapi
router.get("/:id/followinglist",async (req,res)=>{
    try{
        const targetUser = await User.findById(req.params.id).populate('following', 'username email profilePicture bio hobbies');
        if (!targetUser) {
            return res.status(404).json({ message: "ユーザーが見つかりませんでした" });
        }

        // following配列を取得して返す
        const followingList = targetUser.following;
        return res.status(200).json(followingList);

    }catch(e){
        console.error(e);
        return res.status(500).json({message:"フォロー一覧取得中にエラーが発生しました"})
    }
})


//自身の投稿をすべて取得するapi
router.get("/:id/profileposts",async (req,res)=>{
    try{
        //対象のユーザー
        const targetUser = await User.findById(req.params.id)
        if (!targetUser) {
            return res.status(404).json({ message: "ユーザーが見つかりませんでした" });
        }
        //対象ユーザー自身のポストを取得
        const hisPosts = await Post.find({author:targetUser._id}).populate("author")

        return res.status(200).json(hisPosts)
    }catch(e) {
        console.log(e);
        return res.status(500).json({
            message: "ポスト一覧取得中にエラーが発生しました",
            error: e.message // エラーメッセージもレスポンスに含める
        });
    }
})





module.exports =router