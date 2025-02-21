import {
    createClubService,
    getClubEventsService,
    joinClubService,
    updateClubService,
    searchClubsService,
    getClubWithMemberDetailsService,
    getClubMembersService,
    searchClubsByLocationService,
  } from "../service/clubService.js";
  
  /**
   * ✅ クラブを作成
   */
  export const createClubController = async (req, res, next) => {
    try {
      const { name, description, themeImage, tags ,location} = req.body;
      const ownerId = req.userId; // 認証ミドルウェアから取得
      console.log("ownerId", typeof ownerId);
      console.log("location", location);
      const club = await createClubService({name, description, themeImage, tags, ownerId,location});
      res.status(201).json({ message: "クラブが作成されました", club:club ,userId:String(ownerId)});
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * ✅ クラブの詳細を取得
   */
  export const getClubDetailController = async (req, res, next) => {
    try {
      const clubId = req.params.clubId;
      const club = await getClubWithMemberDetailsService(clubId);
      res.status(200).json({message: "クラブ詳細を取得しました", club:club });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * ✅ クラブのメンバー一覧（ID のみ）を取得
   */
  export const getClubMemberIdsController = async (req, res, next) => {
    try {
      const clubId = req.params.clubId;
      const members = await getClubMembersService(clubId);

      res.status(200).json({ message:"クラブのメンバー一覧を取得しました",memberIdList:members });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * ✅ クラブのイベント一覧を取得(populateされた)
   */
  export const getClubEventsController = async (req, res, next) => {
    try {
      const clubId = req.params.clubId;
      const events = await getClubEventsService(clubId);
      res.status(200).json({ message:"クラブのイベント一覧を取得しました",events:events });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * ✅ クラブにユーザーを追加（参加）
   */
  export const joinClubController = async (req, res, next) => {
    try {
      const clubId = req.params.clubId;
      const userId = req.userId; // 認証ミドルウェアから取得
      const club = await joinClubService(clubId, userId);
      console.log("userIdの型:", typeof req.userId, req.userId);
      res.status(200).json({ message: "クラブに参加しました", club:club ,userId:String(userId)});
    } catch (error) {
      next(error);
    }
  };
  


/**
 * ✅ クラブ情報の更新
 */
export const updateClubController = async (req, res, next) => {
  try {
    const clubId = req.params.clubId; // URL パラメータからクラブ ID を取得
    const updateData = req.body;

    const updatedClub = await updateClubService(clubId, updateData);

    res.status(200).json({ message: "クラブ情報が更新されました", club:updatedClub});
  } catch (error) {
    next(error);
  }
};
  
/**
 * ✅ クラブのリストを検索する
 */
export const searchClubsController = async (req, res, next) => {
  try {
    const { name, tags } = req.query;

    const clubs = await searchClubsService(name, tags);
    res.status(200).json({ message: "クラブの検索結果一覧を取得しました", clubSearchList: clubs });
  } catch (error) {
    next(error);
  }
};
  
/**
 * ✅ 地図情報でクラブを検索
 */
export const searchClubsByLocationController = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.query;
    const coordinates = [parseFloat(longitude), parseFloat(latitude)];

    const clubs = await searchClubsByLocationService(coordinates);
    res.status(200).json({ message: "地図情報でクラブを検索しました", clubs: clubs });
  } catch (error) {
    next(error);
  }
};

