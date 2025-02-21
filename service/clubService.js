import {
    createClubRepository,
    findClubByIdRepository,
    getClubMemberIdsRepository,
    getClubEventsRepository,
    updateClubRepository,
    searchClubsRepository,
    clubNameExistsRepository,
    getClubWithMemberDetailsRepository,
    searchClubsByLocationRepository,
  } from "../repository/clubRepository.js";
import { updateUserRepository } from "../repository/userRepository.js";
import { processTagsForUpdate } from "./tagService.js";
  
/**
 * ✅ クラブを作成する
 */
export const createClubService = async ({name, description, themeImage, tags, ownerId,location}) => {
  if (await clubNameExistsRepository(name)) {
    throw { status: 400, message: "クラブ名は既に使用されています" };
  }

  if (tags && Array.isArray(tags)) {
    tags = processTagsForUpdate({exsistingTags:[], newTags:tags});
  }
  console.log({name, description, themeImage, tags, ownerId})
  const createdClubId = await createClubRepository({name, description, themeImage, tags, ownerId,location});
  await updateUserRepository(ownerId, { $addToSet: { clubs: createdClubId } });
  const club = await getClubWithMemberDetailsRepository(createdClubId)
  return club;
};


/**
 * ✅ クラブの詳細を取得（`members` を `populate()` する）
 */
export const getClubWithMemberDetailsService = async (clubId) => {
  const club = await getClubWithMemberDetailsRepository(clubId);
  if (!club) throw { status: 404, message: "クラブが見つかりません" };

  return club;
};

/**
 * ✅ クラブのメンバー一覧を取得（ID のみ）
 */
export const getClubMembersService = async (clubId) => {
  const club= await findClubByIdRepository(clubId);
  if (!club) throw { status: 404, message: "クラブが見つかりません" };
  const members = await getClubMemberIdsRepository(clubId)
  return members;
};


/**
* ✅ クラブのイベント一覧を取得
* @param {string} clubId - クラブ ID
* @returns {Promise<Array<{eventId: string, status: string}>>} - イベント ID & ステータスの配列
*/
export const getClubEventsService = async (clubId) => {
const events = await getClubEventsRepository(clubId);
if (!events) throw { status: 404, message: "クラブが見つかりません" };

return events;
};

/**
* ✅ クラブにユーザーを追加（参加）し、`members` を `populate()` して返却
* @param {string} clubId - クラブ ID
* @param {string} userId - 参加するユーザー ID
* @returns {Promise<object>} - `members` の詳細情報を含む更新後のクラブデータ
*/
export const joinClubService = async (clubId, userId) => {
// 1️⃣ クラブを取得
const club = await findClubByIdRepository(clubId);
if (!club) throw { status: 404, message: "クラブが見つかりません" };

// 2️⃣ すでに参加済みかチェック
if (club.members.includes(userId)) {
  throw { status: 400, message: "すでにこのクラブに参加しています" };
}

// 3️⃣ クラブメンバーに追加
club.members.push(userId);
await club.save();

// 4️⃣ ユーザーの `clubs` フィールドに `clubId` を追加
await updateUserRepository(userId, { $addToSet: { clubs: clubId } });

// 5️⃣ `populate()` したデータを取得して返す
return await getClubWithMemberDetailsRepository(clubId);
};



/**
 * ✅ クラブ情報を更新（`populate()` したデータを返す）
 * @param {string} clubId - クラブ ID
 * @param {object} updateData - 更新データ
 * @returns {Promise<object>} - `members` の詳細情報を含む更新後のクラブデータ
 */
export const updateClubService = async (clubId, updateData) => {
  // 1️⃣ 現在のクラブ情報を取得
  const currentClub = await findClubByIdRepository(clubId);
  if (!currentClub) throw { status: 404, message: "クラブが見つかりません" };

  // 2️⃣ 名前の変更がある場合、重複チェック
  if (updateData.name && updateData.name !== currentClub.name && await clubNameExistsRepository(updateData.name)) {
    throw { status: 400, message: "このクラブ名は既に使用されています" };
  }

  // 3️⃣ タグの処理（`tagService.js` に委託）
  if (updateData.tags && Array.isArray(updateData.tags)) {
    updateData.tags = processTagsForUpdate({existingTags:currentClub.tags,newTags: updateData.tags});
  }

  // 4️⃣ クラブ情報を更新（populateなし）
  await updateClubRepository(clubId, updateData);

  // 5️⃣ `populate()` したデータを取得して返す
  return await getClubWithMemberDetailsRepository(clubId);
};


/**
 * ✅ クラブを検索し、ID のみを返す
 * @param {string} name - クラブ名
 * @param {Array<string>} tags - 検索タグリスト
 * @returns {Promise<Array<string>>} - クラブ ID のリスト
 */
export const searchClubsService = async (name, tags = []) => {
  const query = { $or: [] };

  if (name) {
    query.$or.push({ name: { $regex: name, $options: "i" } });
  }

  if (tags && tags.length > 0) {
    query.$or.push({ "tags": { $elemMatch: { name: { $in: tags } }} });

  }


  if (query.$or.length === 0) {
    return [];
  }

  return await searchClubsRepository(query);
};

export const searchClubsByLocationService = async (coordinates) => {
  return await searchClubsByLocationRepository(coordinates);
};

