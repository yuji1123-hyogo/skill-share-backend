import {
    createCommentRepository,
    getCommentsByPostIdRepository,
    getCommentsByArticleIdRepository,
    getCommentsByFeedbackIdRepository,
    getCommentWithAuthorDetailsRepository,
} from "../repository/commentRepository.js";
import { findPostByIdRepository, updatePostRepository } from "../repository/postRepository.js";
import { findSharedArticleByIdRepository,updateSharedArticleRepository } from "../repository/sharedArticleRepository.js";
import { findFeedbackByIdRepository ,updateFeedbackRepository } from "../repository/feedbackRepository.js";

export const createCommentService = async (content, author, targetType, targetId) => {
    let target;
    let updateRepository;
    const commentData = { content, author };

    // ターゲットタイプに応じた処理
    switch (targetType) {
        case 'post':
            target = await findPostByIdRepository(targetId);
            updateRepository = updatePostRepository;
            commentData.post = targetId;
            break;
        case 'article':
            target = await findSharedArticleByIdRepository(targetId);
            updateRepository = updateSharedArticleRepository;
            commentData.sharedArticle = targetId;
            break;
        case 'feedback':
            target = await findFeedbackByIdRepository(targetId);
            updateRepository = updateFeedbackRepository;
            commentData.feedback = targetId;
            break;
        default:
            throw { status: 400, message: "無効なターゲットタイプです" };
    }

    if (!target) {
        throw { status: 404, message: "対象のコンテンツが見つかりません" };
    }

    const newComment = await createCommentRepository(commentData);
    await updateRepository(targetId, { $addToSet: { comments: newComment.id } });

    return newComment;
};

export const getCommentsByTargetService = async (targetType, targetId, page, limit) => {
    switch (targetType) {
        case 'post':
            return await getCommentsByPostIdRepository(targetId, page, limit);
        case 'article':
            return await getCommentsByArticleIdRepository(targetId, page, limit);
        case 'feedback':
            return await getCommentsByFeedbackIdRepository(targetId, page, limit);
        default:
            throw { status: 400, message: "無効なターゲットタイプです" };
    }
};

export const getCommentByIdService = async (commentId) => {
    const comment = await getCommentWithAuthorDetailsRepository(commentId);
    if (!comment) {
        throw { status: 404, message: "コメントが見つかりません" };
    }
    return comment;
}; 