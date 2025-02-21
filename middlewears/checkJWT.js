
import jwt from "jsonwebtoken";


/**
 * JWT 認証ミドルウェア
 * クッキーに含まれる JWT トークンを検証し、認証情報を `req.userId` にセット
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token; // クッキーからトークンを取得

  if (!token) {
    return res.status(401).json({ message: "認証が必要です" ,errors:[]});
  }

  try {
    // トークンを検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ユーザー ID をリクエストオブジェクトに追加
    req.userId = decoded.userId;

    // 次のミドルウェアへ
    next();
  } catch (error) {
    return res.status(401).json({ message: "無効なトークンです" ,errors:[]});
  }
};

export default authMiddleware;
