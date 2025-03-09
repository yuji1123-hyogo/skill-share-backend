import { 
  createCommentService, 
  getCommentDetailsService,
  getPostCommentsService,
  getSharedCommentsService,
  getFeedbackCommentsService,
} from "../service/commentService.js";

/**
 * 投稿にコメントを追加
 */
export const createCommentController = async (req, res, next) => {
  try {
    const comment = await createCommentService(req.body, req.userId);
    res.status(201).json({ message: "コメントが追加されました", comment });
  } catch (error) {
    next(error);
  }
};

/**
 * 投稿のコメント一覧を取得
 */
/**
 * 投稿のコメント ID 一覧を取得（ページネーション対応）
 */
export const getPostCommentsController = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    const result = await getPostCommentsService(postId, Number(page), Number(limit));
    
    res.status(200).json({
      message: "コメント一覧を取得しました",
      comments: result.comments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * コメント詳細を取得
 */
export const getCommentDetailsController = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const comment = await getCommentDetailsService(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "コメントが見つかりません" });
    }
    
    res.status(200).json({
      message: "コメント詳細を取得しました",
      comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getSharedCommentsController = async (req, res, next) => {
  try {
    const { sharedId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    const result = await getSharedCommentsService(sharedId, Number(page), Number(limit));
    
    res.status(200).json({
      message: "共有記事のコメント一覧を取得しました",
      comments: result.comments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackCommentsController = async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const { page = 1, limit = 10 } = req.query;
  
    const result = await getFeedbackCommentsService(feedbackId, Number(page), Number(limit));
    
    res.status(200).json({
      message: "フィードバックのコメント一覧を取得しました",
      comments: result.comments,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};
