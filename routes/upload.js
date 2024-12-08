const Club = require("../models/Club");
const User = require("../models/User");
const router = require("express").Router()
//画像更新用api


router.post('/', (req, res) => {
    try {
      // req.fileにCloudinaryのアップロード情報が含まれる
      console.log('Uploaded file:', req.file);
  
      res.status(200).json({
        message: 'cloudinaryへのアップロードが成功しました',
        imageUrl: req.file.path, // アップロードされた画像のURL
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'cloudinaryへのアップロードが失敗しました', error });
    }
  });


  //プロフィール画像更新
  router.post('/profilepicture', async (req, res) => {

    try {
      const userId = req.user.user._id;
      // req.fileにCloudinaryのアップロード情報が含まれる
      console.log('Uploaded file:', req.file);
  
      // 画像がアップロードされていない場合のチェック
      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: 'cloudinaryへのアップロードが失敗しました' });
      }


      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: req.file.path }, // 新しい画像URLをセット
        { new: true } // 更新後のユーザー情報を返す
      );

      if (!user) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }

      res.status(200).json({
        message: 'cloudinaryへのアップロードが成功しました',
        imageUrl: user.profilePicture, // アップロードされた画像のURL
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message:'profilePictureの更新中に予期せぬエラーが発生' , error });
    }
  });


    //プロフィール画像更新
    router.post('/club/themeImage', async (req, res) => {

      try {
        const {clubId} = req.body;
        // req.fileにCloudinaryのアップロード情報が含まれる
        console.log('Uploaded file:', req.file);
    
        // 画像がアップロードされていない場合のチェック
        if (!req.file || !req.file.path) {
          return res.status(400).json({ message: 'cloudinaryへのアップロードが失敗しました' });
        }
  
  
        const club= await Club.findByIdAndUpdate(
           clubId,
          { themeImage: req.file.path }, // 新しい画像URLをセット
          { new: true } // 更新後のユーザー情報を返す
        );
  
        if (!club) {
          return res.status(404).json({ message: 'クラブが見つかりません' });
        }
  
        res.status(200).json({
          message: 'cloudinaryへのアップロードが成功しました',
          imageUrl: club.themeImage, // アップロードされた画像のURL
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message:'profilePictureの更新中に予期せぬエラーが発生' , error });
      }
    });


module.exports = router;