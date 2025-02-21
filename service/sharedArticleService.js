import { findEventByIdRepository } from "../repository/eventRepository.js";
import { createSharedArticleRepository, findSharedArticlesByEventRepository, findSharedArticleByIdRepository } from "../repository/sharedArticleRepository.js";
import { canShareArticle, isEventParticipant } from "../utils/event/checkEventStatus.js";

export const createSharedArticleService = async (articleData) => {
  const { eventId, author, ...restData } = articleData;

  // イベントの存在確認
  const event = await findEventByIdRepository(eventId);
  if (!event) {
    throw { status: 404, message: "イベントが見つかりません" };
  }

  // イベントの状態チェック
  if (!canShareArticle(event)) {
    throw { 
      status: 400, 
      message: "イベント開催前または開催中のみ記事を共有できます" 
    };
  }

  // 参加者チェック
  if (!isEventParticipant(event, author)) {
    throw { 
      status: 403, 
      message: "イベント参加者のみが記事を共有できます" 
    };
  }

  // モデルスキーマに合わせてデータを整形
  const formattedArticleData = {
    ...restData,
    event: eventId,  // eventId を event フィールドにマッピング
    author
  };

  // 記事の作成
  const article = await createSharedArticleRepository(formattedArticleData);
  return article;
};

export const getSharedArticlesByEventService = async (eventId, page, limit) => {
  const result = await findSharedArticlesByEventRepository(eventId, page, limit);
  if (!result.articles.length && page > 1) {
    throw { status: 404, message: "ページが見つかりません" };
  }
  return result;
};

export const getSharedArticleByIdService = async (articleId) => {
  const article = await findSharedArticleByIdRepository(articleId);
  if (!article) {
    throw { status: 404, message: "記事が見つかりません" };
  }
  return article;
}; 