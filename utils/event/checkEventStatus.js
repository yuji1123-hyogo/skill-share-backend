import { EVENT_STATUS } from "../../constants/eventStatus.js";

/**
 * イベントが技術記事を共有可能な状態かチェック
 * @param {Object} event - イベント情報
 * @returns {boolean} 共有可能な場合はtrue
 */
export const canShareArticle = (event) => {
  return [EVENT_STATUS.UPCOMING, EVENT_STATUS.IN_PROGRESS].includes(event.status);
};

/**
 * イベントがフィードバックを作成可能な状態かチェック
 * @param {Object} event - イベント情報
 * @returns {boolean} 作成可能な場合はtrue
 */
export const canCreateFeedback = (event) => {
  return event.status === EVENT_STATUS.COMPLETED;
};

/**
 * イベントが開催中かチェック
 * @param {Object} event - イベント情報
 * @returns {boolean} 開催中の場合はtrue
 */
export const isEventInProgress = (event) => {
  return event.status === EVENT_STATUS.IN_PROGRESS;
};

/**
 * イベントが終了しているかチェック
 * @param {Object} event - イベント情報
 * @returns {boolean} 終了している場合はtrue
 */
export const isEventCompleted = (event) => {
  return event.status === EVENT_STATUS.COMPLETED;
};

/**
 * イベントが開催前かチェック
 * @param {Object} event - イベント情報
 * @returns {boolean} 開催前の場合はtrue
 */
export const isEventUpcoming = (event) => {
  return event.status === EVENT_STATUS.UPCOMING;
};

export const isEventParticipant = (event, userId) => {
  return event.participants.some(participant => 
    participant.toString() === userId.toString()
  );
}; 