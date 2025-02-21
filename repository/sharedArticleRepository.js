import SharedArticle from "../models/SharedArticle.js";

/**
 * 共有記事を作成
 * @param {Object} articleData - 記事データ
 * @returns {Promise<Object>} 作成された記事
 */
export const createSharedArticleRepository = async (articleData) => {
  const article = new SharedArticle(articleData);
  return await article.save();
};

/**
 * イベントIDで記事一覧を取得
 * @param {string} eventId - イベントID
 * @param {number} page - ページ番号
 * @param {number} limit - 1ページあたりの件数
 * @returns {Promise<{ articles: Array, pagination: Object }>} 記事一覧とページネーション情報
 */
export const findSharedArticlesByEventRepository = async (eventId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [articles, total] = await Promise.all([
    SharedArticle.find({ event: eventId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "_id username profilePicture")
      .lean(),
    SharedArticle.countDocuments({ event: eventId })
  ]);

  return {
    articles: articles.map(article => ({
      id: article._id.toString(),
      title: article.title,
      url: article.url,
      description: article.description ?? null,
      tags: article.tags ?? [],
      createdAt: article.createdAt?.toISOString(),
      updatedAt: article.updatedAt?.toISOString(),
      
      // author の整形
      author: article.author ? {
        id: article.author._id.toString(),
        username: article.author.username,
        profilePicture: article.author.profilePicture ?? null
      } : null,

      // comments の整形
      comments: Array.isArray(article.comments)
        ? article.comments.map(comment => comment.toString())
        : [],

      event: article.event.toString()
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalArticles: total
    }
  };
};

/**
 * 記事IDで記事を取得
 * @param {string} articleId - 記事ID
 * @returns {Promise<Object>} 記事情報
 */
export const findSharedArticleByIdRepository = async (articleId) => {
  const article = await SharedArticle.findById(articleId)
    .populate("author", "_id username profilePicture")
    .populate({
      path: "comments",
      populate: { 
        path: "author",
        select: "_id username profilePicture"
      }
    })
    .lean();

  if (!article) return null;

  return {
    id: article._id.toString(),
    title: article.title,
    url: article.url,
    description: article.description ?? null,
    tags: article.tags ?? [],
    createdAt: article.createdAt?.toISOString(),
    updatedAt: article.updatedAt?.toISOString(),
    
    // author の整形
    author: article.author ? {
      id: article.author._id.toString(),
      username: article.author.username,
      profilePicture: article.author.profilePicture ?? null
    } : null,

    // comments の整形（コメント詳細を含む）
    comments: Array.isArray(article.comments)
      ? article.comments.map(comment => ({
          id: comment._id.toString(),
          content: comment.content,
          createdAt: comment.createdAt?.toISOString(),
          author: comment.author ? {
            id: comment.author._id.toString(),
            username: comment.author.username,
            profilePicture: comment.author.profilePicture ?? null
          } : null
        }))
      : [],

    event: article.event.toString()
  };
};

/**
 * 記事を更新
 * @param {string} articleId - 記事ID
 * @param {Object} updateData - 更新データ
 * @returns {Promise<Object>} 更新された記事
 */
export const updateSharedArticleRepository = async (articleId, updateData) => {
  return await SharedArticle.findByIdAndUpdate(
    articleId,
    updateData,
    { new: true }
  ).populate("author", "username profilePicture");
};

/**
 * 記事を削除
 * @param {string} articleId - 記事ID
 * @returns {Promise<Object>} 削除された記事
 */
export const deleteSharedArticleRepository = async (articleId) => {
  return await SharedArticle.findByIdAndDelete(articleId);
}; 