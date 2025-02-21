import { findEventByIdRepository } from "../repository/eventRepository.js";
import { createFeedbackRepository,  findFeedbackByIdRepository, getFeedbacksByEventRepository } from "../repository/feedbackRepository.js";
import { canCreateFeedback, isEventParticipant } from "../utils/event/checkEventStatus.js";

export const createFeedbackService = async (feedbackData) => {
  const { eventId, author } = feedbackData;

  // イベントの存在確認
  const event = await findEventByIdRepository(eventId);
  if (!event) {
    throw { status: 404, message: "イベントが見つかりません" };
  }

  // イベントの状態チェック
  if (!canCreateFeedback(event)) {
    throw { 
      status: 400, 
      message: "イベント終了後のみフィードバックを作成できます" 
    };
  }

  // 参加者チェック
  if (!isEventParticipant(event, author)) {
    throw { 
      status: 403, 
      message: "イベント参加者のみがフィードバックを作成できます" 
    };
  }

  const formattedFeedbackData = {
    ...feedbackData,
    event: eventId,
  };
  // フィードバックの作成
  const feedback = await createFeedbackRepository(formattedFeedbackData);
  return feedback;
};

export const getFeedbacksByEventService = async (eventId, page, limit) => {
  const result = await getFeedbacksByEventRepository(eventId, page, limit);
  if (!result.feedbacks.length && page > 1) {
    throw { status: 404, message: "ページが見つかりません" };
  }
  return result;
};

export const getFeedbackByIdService = async (feedbackId) => {
  const feedback = await findFeedbackByIdRepository(feedbackId);
  if (!feedback) {
    throw { status: 404, message: "フィードバックが見つかりません" };
  }
  return feedback;
}; 