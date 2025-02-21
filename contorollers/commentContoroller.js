import { createCommentService, getCommentByIdService, getCommentsByPostIdService } from "../service/commentSearvice.js";

/**
 * ✅ 投稿にコメントを追加
 */
export const createCommentController = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const author = req.userId; // JWT 認証ミドルウェアで userId を取得
        const comment = await createCommentService(content, author, postId);
        res.status(201).json({ message: "コメントを追加しました", comment:comment });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ 投稿のコメント一覧を取得
 */
/**
 * ✅ 投稿のコメント ID 一覧を取得（ページネーション対応）
 */
export const getCommentsByPostIdController = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { commentIds, pagination } = await getCommentsByPostIdService(postId, page, limit);

        res.status(200).json({ commentIds, pagination });
    } catch (error) {
        next(error);
    }
};


/**
 * ✅ コメント詳細を取得
 */
export const getCommentByIdController = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await getCommentByIdService(commentId);

        res.status(200).json({message:"コメントの詳細情報を取得しました",comment:comment});
    } catch (error) {
        next(error);
    }
};
