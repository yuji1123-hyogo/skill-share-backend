import {
    findUserByIdPublicRepository,
    getUserClubsRepository,
    updateUserRepository,
    searchUsersRepository,
    findUserByUsernameRepository,
    updateFollowStatusRepository,
    getFollowListRepository,
  } from "../repository/userRepository.js";
import { processTagsForUpdate } from "./tagService.js";
  
//個人のユーザー情報の取得時は必ず findUserByIdPublicRepositoryで整形したものを返す  


  /**
   * ✅ 特定のユーザー情報を取得
   */
  export const getPublicUserService = async (userId) => {
    const user = await findUserByIdPublicRepository(userId);
    if (!user) throw { status: 404, message: "ユーザーが見つかりません" };
    return user;
  };
  

/**
 * ✅ ユーザーのフォロー / フォロー解除
 * @param {string} userId - 操作を行うユーザー ID
 * @param {string} targetUserId - フォローするユーザー ID
 * @returns {Promise<{ wasFollowing: boolean, updatedUser: User }>}
 */
export const toggleFollowUserService = async (userId, targetUserId) => {
  if (userId === targetUserId) {
    throw { status: 400, message: "自身をフォローすることはできません" };
  }

  // ✅ 1️⃣ フォロー対象のユーザーが存在するかチェック
  const targetUser = await findUserByIdPublicRepository(targetUserId);
  if (!targetUser) {
    throw { status: 404, message: "フォローする相手が見つかりませんでした" };
  }

  // ✅ 2️⃣ 現在のフォロー状態を取得
  const user = await findUserByIdPublicRepository(userId);
  const wasFollowing = user.following.includes(targetUserId);

  // ✅ 3️⃣ フォロー / フォロー解除のアクション
  const action = wasFollowing ? "unfollow" : "follow";
  await updateFollowStatusRepository(userId, targetUserId, action);

  const updatedUser = await findUserByIdPublicRepository(userId);
  return { wasFollowing, updatedUser };
};





  /**
   * ✅ 参加しているクラブ一覧を取得
   */
  export const getUserClubsService = async (userId) => {
  // 1️⃣ 現在のユーザー情報を取得
  const currentUser = await findUserByIdPublicRepository(userId);
  if (!currentUser) {
    throw { status: 404, message: "ユーザーが見つかりません" };
  }
  const clubIdList = await getUserClubsRepository(userId)
  return clubIdList
  };
  
/**
 * ✅ ユーザー情報を更新
 */
export const updateUserService = async (userId, updateData) => {
  // 1️⃣ 現在のユーザー情報を取得
  const currentUser = await findUserByIdPublicRepository(userId);
  if (!currentUser) {
    throw { status: 404, message: "ユーザーが見つかりません" };
  }

  // 2️⃣ 名前の変更がある場合、重複チェック
  if (updateData.username && updateData.username !== currentUser.username) {
    const existingUser = await findUserByUsernameRepository(updateData.username);
    if (existingUser) {
      throw { status: 400, message: "このユーザー名は既に使用されています" };
    }
  }

  // 3️⃣ タグの処理（`tagService.js` に委託）
  if (updateData.tags && Array.isArray(updateData.tags)) {
    updateData.tags = processTagsForUpdate({existingTags:currentUser.tags, newTags:updateData.tags});
  }

  // 4️⃣ ユーザー情報を更新
   await updateUserRepository(userId, updateData);
   const updatedUser = await findUserByIdPublicRepository(userId);
   return updatedUser;
};



 /**
 * ✅ ユーザーを検索し、ID のみを返す
 * @param {string} username - ユーザー名（部分一致検索）
 * @param {Array<string>} tags - タグリスト
 * @returns {Promise<Array<string>>} - ユーザー ID のリスト
 */
export const searchUsersService = async (username, tags = []) => {
  const query = { $or: [] };

  if (username) {
    query.$or.push({ username: { $regex: username, $options: "i" } });
  }

  if (tags && tags.length > 0) {
    query.$or.push({ "tags": { $elemMatch: { name: { $in: tags } }} });
  }

  console.log("queryorlength",username)
  if (query.$or.length === 0) {
    return [];
  }


  return await searchUsersRepository(query);
};


/**
 * ✅ フォローリスト取得サービス
 */
export const getFollowListService = async (userId) => {
  return await getFollowListRepository(userId);
};