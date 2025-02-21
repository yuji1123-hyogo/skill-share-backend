import { createCommentService, getCommentByIdService, getCommentsByTargetService } from "../service/commentService.js";

export const createCommentController = async (req, res, next) => {
    try {
        const { targetType, targetId } = req.params;
        const { content } = req.body;
        const author = req.userId;
        
        const comment = await createCommentService(content, author, targetType, targetId);
        res.status(201).json({ message: "コメントを追加しました", comment });
    } catch (error) {
        next(error);
    }
};

export const getCommentsByTargetController = async (req, res, next) => {
    try {
        const { targetType, targetId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { commentIds, pagination } = await getCommentsByTargetService(
            targetType, 
            targetId, 
            page, 
            limit
        );

        res.status(200).json({ commentIds, pagination });
    } catch (error) {
        next(error);
    }
};

export const getCommentByIdController = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const comment = await getCommentByIdService(commentId);
        res.status(200).json({ message: "コメントの詳細情報を取得しました", comment });
    } catch (error) {
        next(error);
    }
}; 