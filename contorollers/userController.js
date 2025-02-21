import {
    getPublicUserService,
    toggleFollowUserService,
    getUserClubsService,
    updateUserService,
    searchUsersService,
    getFollowListService,
  } from "../service/userService.js";
  
  

  //自分を含めた特定のユーザーの詳細
  export const getPublicUserController = async (req, res, next) => {
    try {
      const user = await getPublicUserService(req.params.userId);
      res.status(200).json({message:`userId:${req.params.userId}のユーザー情報を取得しました`,user:user});
    } catch (error) {
      next(error);
    }
  };
  
// ✅ フォロー・フォロー解除
export const toggleFollowUserController = async (req, res, next) => {
  try {
    const { wasFollowing, updatedUser } = await toggleFollowUserService(req.userId, req.params.userId);

    const message = wasFollowing ? "フォローを解除しました" : "フォローしました";
    res.status(200).json({ message, user: updatedUser });
    } catch (error) {
      next(error);
    }
  };
  
  export const getUserClubsController = async (req, res, next) => {
    try {
      const clubIdList= await getUserClubsService(req.userId);
      res.status(200).json({message:"ユーザーが参加中のクラブID一覧を取得しました", clubIdList});
    } catch (error) {
      next(error);
    }
  };
  
  
/**
 * ✅ ユーザー情報の更新
 */
export const updateUserController = async (req, res, next) => {
  try {
    const userId = req.userId; // 認証ミドルウェアを通じて取得
    const updateData = req.body;

    const updatedUser = await updateUserService(userId, updateData);

    res.status(200).json({ message: "ユーザー情報が更新されました", user: updatedUser });
  } catch (error) {
    next(error);
  }
};
  
  // ユーザー検索:返されるのはIDではなくユーザー情報一覧
  export const searchUsersController = async (req, res, next) => {
    try {
      const { username, tags } = req.query;
      const users = await searchUsersService(username, tags);
      res.status(200).json({ message: "検索条件に合致するユーザーID一覧を取得しました",userSearchList: users });
    } catch (error) {
      next(error);
    }
  };


/**
 * ✅ フォローIDリストを取得
 */
export const getFollowListController = async (req, res, next) => {
  try {
    const { userId } = req; // 認証情報から userId を取得
    const following = await getFollowListService(userId);

    res.status(200).json({
      message: "フォローリストを取得しました",
      following,
    });
  } catch (error) {
    next(error);
  }
};
