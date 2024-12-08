require('dotenv').config();
const router = require("express").Router()
const User = require("../models/User")
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// 新規ユーザーの登録
router.post("/register",async (req,res)=>{
    const {username,email,password} = req.body;

    try{
     // 既に登録されているメールアドレスがあるか確認
     const existingUser = await User.findOne({ email });
     if (existingUser) {
         return res.status(400).json({ message: 'このメールアドレスは既に使用されています' });
     }
     
     //パスワードのハッシュ化
     const salt = await bcrypt.genSalt(10);  // ソルトの生成
     const hashedPassword = await bcrypt.hash(password, salt);

     //新しいユーザーの作成
     const newUser = new User({
      username,
      email,
      password:hashedPassword,
     });

     await newUser.save();
     res.status(201).json({message:`ユーザー登録が完了しました.(${username}さん)`})
    }catch(e){
     res.status(500).json({message:"ユーザー登録に失敗しました"})
    }
})

// ログインapi
//認証が成功したらJWTを返す

router.post("/login",async(req,res)=>{
 const {email,password} = req.body;
 try{
     const user = await User.findOne({email:email});
     //ユーザーが存在するか
     if(!user){
         return res.status(400).json({ message: "メールアドレスをご確認ください" })
     }

     // パスワードは正しいか
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
         return res.status(400).json({ message: "パスワードが違います"});
     }
     
   
      // JWTを生成::::apiとの通信時の認証に利用
      const token = jwt.sign(
         {user},   // ペイロード（トークンに含めるデータ）
           process.env.JWT_SECRET,               // 秘密鍵
         { expiresIn: '200h' }   // 有効期限 (1時間)
     );

     res.cookie("token", token, {
        httpOnly: true,     // JavaScriptからアクセスできないようにする
        maxAge: 360000000     // クッキーの有効期限(秒)
    });
    
    //user:::フロントエンドでのホーム画面表示の基準とリクエスト送信時のURLに利用
    res.status(200).json({ message: 'ログイン成功', user });
 }catch(e){
        return res.status(500).json({ message: 'ログイン失敗', error:e })
 }
})

//ログアウト用api
// ログアウトAPI
router.post('/logout', (req, res) => {
    // クッキーのを削除
    res.clearCookie('token'); 
    return res.status(200).json({ message: "ログアウトしました" });
  });


//新規登録時のバリデーションチェック用
router.get('/check-email', async (req, res) => {
    const { email } = req.query;

    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.json({ exists: true }); // 既存のメールアドレスが見つかった
      } else {
        return res.json({ exists: false }); // メールアドレスは未登録
      }
    } catch (error) {
      return res.status(500).json({ message: "サーバーエラーが発生しました" });
    }
  });

router.get('/check-username', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.json({ exists: true }); 
    } else {
      return res.json({ exists: false }); 
    }
  } catch (error) {
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
});



module.exports = router