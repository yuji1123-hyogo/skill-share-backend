import Comment from "../models/Comment.js";

/**
 * ✅ コメントを作成（`author` を `populate()` する）
 * @param {string} content - コメント内容
 * @param {string} author - コメントの作成者（User ID）
 * @param {string} postId - 投稿 ID
 * @returns {Promise<object>} - 作成されたコメント（`author` の詳細情報付き）
 */
export const createCommentRepository = async (commentData) => {
    const newComment = new Comment(commentData);
    await newComment.save();

    const comment = await Comment.findById(newComment._id)
        .populate("author", "_id username profilePicture")
        .lean();

    return comment ? transformComment(comment) : null;
};

/**
 * ✅ `author` を `populate()` したコメントの詳細を取得（APIレスポンス用）
 * @param {string} commentId - コメント ID
 * @returns {Promise<object | null>} - `author` の詳細情報を含むコメントデータ
 */
export const getCommentWithAuthorDetailsRepository = async (commentId) => {
    const comment = await Comment.findById(commentId)
        .populate("author", "_id username profilePicture")
        .lean();

    return comment ? transformComment(comment) : null;
};

/**
 * ✅ コメントの詳細を取得（`populate()` なし）
 * @param {string} commentId - コメント ID
 * @returns {Promise<object | null>} - コメントデータ
 */
export const findCommentByIdRepository = async (commentId) => {
    const comment = await Comment.findById(commentId).lean();
    if (!comment) return null;

    return {
        id: comment._id.toString(),
        content: comment.content ?? null,
        author: comment.author?.toString() ?? null,
        post: comment.post?.toString() ?? null,
        createdAt: comment.createdAt?.toISOString()
    };
};

/**
 * ✅ 投稿に紐づくコメント一覧を取得（ページネーション対応）
 * @param {string} postId - 投稿 ID
 * @param {number} page - ページ番号（デフォルト: 1）
 * @param {number} limit - 取得する件数（デフォルト: 10）
 * @returns {Promise<object>} - コメント ID の配列 & ページネーション情報
 */
export const getCommentsByPostIdRepository = async (postId, page, limit) => {
    return getCommentsByTargetRepository({ post: postId }, page, limit);
};

/**
 * ✅ 共有記事に紐づくコメント一覧を取得（ページネーション対応）
 * @param {string} articleId - 共有記事 ID
 * @param {number} page - ページ番号（デフォルト: 1）
 * @param {number} limit - 取得する件数（デフォルト: 10）
 * @returns {Promise<object>} - コメント ID の配列 & ページネーション情報
 */
export const getCommentsByArticleIdRepository = async (articleId, page, limit) => {
    return getCommentsByTargetRepository({ sharedArticle: articleId }, page, limit);
};

/**
 * ✅ フィードバックに紐づくコメント一覧を取得（ページネーション対応）
 * @param {string} feedbackId - フィードバック ID
 * @param {number} page - ページ番号（デフォルト: 1）
 * @param {number} limit - 取得する件数（デフォルト: 10）
 * @returns {Promise<object>} - コメント ID の配列 & ページネーション情報
 */
export const getCommentsByFeedbackIdRepository = async (feedbackId, page, limit) => {
    return getCommentsByTargetRepository({ feedback: feedbackId }, page, limit);
};

// 共通の変換関数
const transformComment = (comment) => ({
    id: comment._id.toString(),
    content: comment.content ?? null,
    post: comment.post?.toString() ?? null,
    sharedArticle: comment.sharedArticle?.toString() ?? null,
    feedback: comment.feedback?.toString() ?? null,
    createdAt: comment.createdAt?.toISOString(),
    author: comment.author
        ? {
            id: comment.author._id.toString(),
            username: comment.author.username,
            profilePicture: comment.author.profilePicture ?? null,
        }
        : null,
});

// コメント一覧取得（汎用化）
export const getCommentsByTargetRepository = async (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const comments = await Comment.find(query)
        .sort({ createdAt: "asc" })
        .skip(skip)
        .limit(limit)
        .select("_id")
        .lean();

    const commentIds = comments.map(comment => comment._id.toString());
    const totalComments = await Comment.countDocuments(query);

    return {
        commentIds,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalComments / limit),
            totalComments
        }
    };
};
