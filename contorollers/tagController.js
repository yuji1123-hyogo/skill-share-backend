import { searchTagsService } from "../service/tagService.js";

/**
 * ✅ タグ検索 API
 */
export const searchTagsController = async (req, res, next) => {
    try {
        const { query } = req.query;
        const threshold = parseInt(req.query.threshold) || 2;
        const limit = parseInt(req.query.limit) || 10;

        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "検索クエリが必要です" });
        }

        const tags = await searchTagsService(query, threshold, limit);
        res.status(200).json({ message: "タグ検索結果", tags });
    } catch (error) {
        next(error);
    }
};
