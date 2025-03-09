import {
    createEventService,
    getEventByIdService,
    participateEventService,
    updateEventStatusService,
    voteForMvpService,
    determineMvpService,
    distributeExpService
  } from "../service/eventService.js";
  
  /**
   * イベント作成
   */
  export const createEventController = async (req, res, next) => {
    try {
      const { userId } = req;
      const event = await createEventService({ ...req.body, participants: [userId],host:userId });
      res.status(201).json({ message: "イベントが作成されました", event:event });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * イベント詳細取得
   */
  export const getEventByIdController = async (req, res, next) => {
    try {
      const event = await getEventByIdService(req.params.eventId);
      res.status(200).json( {message: "イベントの詳細情報を取得しました", event:event });
    } catch (error) {
      next(error);
    }
  };
  

  
/**
 * イベント参加
 */
export const participateEventController = async (req, res, next) => {
  try {
    const { userId } = req;
    const updatedEvent = await participateEventService(req.params.eventId, userId);
    
    res.status(200).json({
      message: "イベントに参加しました",event: updatedEvent, // 更新後のイベント情報を返す
    });
  } catch (error) {
    next(error);
  }
};

/**
 * イベントステータスの自動更新
 */
export const updateEventStatusController = async (req, res, next) => {
  try {
      const { userId } = req;
      const updatedEvent = await updateEventStatusService(req.params.eventId, userId);
      
      res.status(200).json({ message: "イベントのステータスが更新されました", event: updatedEvent });
  } catch (error) {
      next(error);
  }
};
  
  /**
   * MVP 投票
   */
  export const voteForMvpController = async (req, res, next) => {
    try {
      const { userId } = req;
      const { candidate } = req.body;
      const event = await voteForMvpService(req.params.eventId, userId, candidate);
      res.status(200).json({ message: "MVP投票が完了しました" ,event:event});
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * MVP 確定 
   */
  export const determineMvpController = async (req, res, next) => {
    try {
      const { userId } = req;
      const event = await determineMvpService(req.params.eventId, userId);
      res.status(200).json({ message: "MVPが確定しました",event:event});
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * 経験値分配
   */
  export const distributeExpController = async (req, res, next) => {
    try {
      const { userId } = req;
      const result = await distributeExpService(req.params.eventId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  