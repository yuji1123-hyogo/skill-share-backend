const express = require("express");
const Club = require("../models/Club");
const Tag = require("../models/Tag");

// 認可ミドルウェア: 管理者かどうか確認
async function isAdmin(req, res, next) {
    try {
      const club = await Club.findById(req.params.id);
      if (!club) {
        return res.status(404).json({ message: "クラブが見つかりません" });
      }
  
      // 現在のユーザーが管理者でない場合はエラー
      const userId = req.user.user._id; // 認証ミドルウェアで設定されるユーザー情報
      if (!club.admins.includes(userId)) {
        return res.status(403).json({ message: "この操作を行う権限がありません" });
      }
  
      req.club = club; // クラブデータをリクエストに追加して次のミドルウェアに渡す
      next();
    } catch (error) {
      console.error("認可エラー:", error.message);
      res.status(500).json({ message: "認可中にエラーが発生しました" });
    }
  }

module.exports ={
    isAdmin
}