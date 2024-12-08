require('dotenv').config();
const jwt = require('jsonwebtoken');

// HTTPリクエストのヘッダーには複数の情報が含まれている
//その中でもAuthorizationヘッダーの中に含まれる情報は認証に利用される

// JWT認証ミドルウェア
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token; // クッキーからトークンを取得

    if (!token) {
      return res.status(401).json({ message: '認証が必要です' });
    }else{
        try {
            // トークンを検証
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // トークンの検証が成功したらユーザー情報をリクエストに追加
            //req.userにuserオブジェクトが追加される
            req.user = decoded;
            
            // 次のミドルウェアに進む
            next();
        } catch (error) {
            // トークンが無効または期限切れの場合
            return res.status(401).json({ message: '無効なトークンです' });
        }
    }

};

module.exports = authMiddleware;