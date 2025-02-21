import Feedback from "../models/Feedback.js";

/**
 * フィードバックを作成
 * @param {Object} feedbackData - フィードバックデータ
 * @returns {Promise<Object>} 作成されたフィードバック
 */
export const createFeedbackRepository = async (feedbackData) => {
  const feedback = new Feedback(feedbackData);
  return await feedback.save();
};

/**
 * イベントIDでフィードバック一覧を取得
 * @param {string} eventId - イベントID
 * @param {number} page - ページ番号
 * @param {number} limit - 1ページあたりの件数
 * @returns {Promise<{ feedbacks: Array, pagination: Object }>} フィードバック一覧とページネーション情報
 */
export const getFeedbacksByEventRepository = async (eventId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [feedbacks, total] = await Promise.all([
    Feedback.find({ event: eventId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "_id username profilePicture")
      .lean(),
    Feedback.countDocuments({ event: eventId })
  ]);

  return {
    feedbacks: feedbacks.map(feedback => ({
      id: feedback._id.toString(),
      content: feedback.content,
      media: feedback.media ?? null,
      createdAt: feedback.createdAt?.toISOString(),
      updatedAt: feedback.updatedAt?.toISOString(),
      
      // author の整形
      author: feedback.author ? {
        id: feedback.author._id.toString(),
        username: feedback.author.username,
        profilePicture: feedback.author.profilePicture ?? null
      } : null,

      // comments の整形
      comments: Array.isArray(feedback.comments)
        ? feedback.comments.map(comment => comment.toString())
        : [],

      event: feedback.event.toString()
    })),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalFeedbacks: total
    }
  };
};

/**
 * フィードバックIDでフィードバックを取得
 * @param {string} feedbackId - フィードバックID
 * @returns {Promise<Object>} フィードバック情報
 */
export const findFeedbackByIdRepository = async (feedbackId) => {
  const feedback = await Feedback.findById(feedbackId)
    .populate("author", "_id username profilePicture")
    .populate({
      path: "comments",
      populate: { 
        path: "author",
        select: "_id username profilePicture"
      }
    })
    .lean();

  if (!feedback) return null;

  return {
    id: feedback._id.toString(),
    content: feedback.content,
    media: feedback.media ?? null,
    createdAt: feedback.createdAt?.toISOString(),
    updatedAt: feedback.updatedAt?.toISOString(),
    
    // author の整形
    author: feedback.author ? {
      id: feedback.author._id.toString(),
      username: feedback.author.username,
      profilePicture: feedback.author.profilePicture ?? null
    } : null,

    // comments の整形（コメント詳細を含む）
    comments: Array.isArray(feedback.comments)
      ? feedback.comments.map(comment => ({
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

    event: feedback.event.toString()
  };
};

/**
 * フィードバックを更新
 * @param {string} feedbackId - フィードバックID
 * @param {Object} updateData - 更新データ
 * @returns {Promise<Object>} 更新されたフィードバック
 */
export const updateFeedbackRepository = async (feedbackId, updateData) => {
  return await Feedback.findByIdAndUpdate(
    feedbackId,
    updateData,
    { new: true }
  ).populate("author", "_id username profilePicture");
};

/**
 * フィードバックを削除
 * @param {string} feedbackId - フィードバックID
 * @returns {Promise<Object>} 削除されたフィードバック
 */
export const deleteFeedbackRepository = async (feedbackId) => {
  return await Feedback.findByIdAndDelete(feedbackId);
}; 