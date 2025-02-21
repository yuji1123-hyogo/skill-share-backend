import { createSharedArticleService } from "../service/sharedArticleService.js";
import {
  getSharedArticlesByEventService,
  getSharedArticleByIdService,
} from "../service/sharedArticleService.js";

export const createSharedArticleController = async (req, res, next) => {
  try {
    console.log("createSharedArticleController",req.params)
    const { eventId } = req.params;
    const { title, url, description, tags } = req.body;
    const userId = req.userId;

    const article = await createSharedArticleService({
      eventId,
      author: userId,
      title,
      url,
      description,
      tags
    });

    res.status(201).json({
      message: "技術記事を共有しました",
      article
    });
  } catch (error) {
    next(error);
  }
};

export const getSharedArticlesByEventController = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page, limit } = req.query;

    const result = await getSharedArticlesByEventService(eventId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSharedArticleByIdController = async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const article = await getSharedArticleByIdService(articleId);
    res.json(article);
  } catch (error) {
    next(error);
  }
}; 