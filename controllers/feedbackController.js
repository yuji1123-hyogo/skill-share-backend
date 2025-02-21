import {
  createFeedbackService,
  getFeedbacksByEventService,
  getFeedbackByIdService,
} from "../service/feedbackService.js";

export const createFeedbackController = async (req, res, next) => {
  try {

    console.log("eventId",req.params);
    const { eventId } = req.params;
    const { content,media } = req.body;
    const userId = req.userId;

    const feedback = await createFeedbackService({
      eventId,
      author: userId,
      content,
      media,
    });

    res.status(201).json({
      message: "フィードバックを作成しました",
      feedback
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbacksByEventController = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { page, limit } = req.query;

    const result = await getFeedbacksByEventService(eventId, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getFeedbackByIdController = async (req, res, next) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await getFeedbackByIdService(feedbackId);
    res.json(feedback);
  } catch (error) {
    next(error);
  }
}; 