import { findClubByIdRepository, updateClubRepository } from "../repository/clubRepository.js";
import {
    getPostWithAuthorDetailsRepository,
    getUserPostsRepository,
    getClubPostsRepository,
    getHomePostsRepository,
    createPostRepository,
} from "../repository/postRepository.js";
import { findUserByIdPublicRepository, updateUserRepository } from "../repository/userRepository.js";


/**
 * 新しい投稿を作成
 * @param {string} userId - 投稿者のユーザーID
 * @param {Object} postData - 投稿データ
 * @param {string} postData.content - 投稿内容
 * @param {string} [postData.media] - メディアURL（任意）
 * @param {string} [postData.club] - 関連するクラブID（任意）
 * @returns {Promise<{
 *   id: string,
 *   content: string,
 *   media: string|null,
 *   club: string|null,
 *   createdAt: string,
 *   tags: Array<{
 *     id: string,
 *     name: string,
 *     level: number,
 *     currentExperience: number,
 *     nextLevelExperience: number
 *   }>,
 *   comments: Array<string>,
 *   author: {
 *     id: string,
 *     username: string,
 *     profilePicture: string|null
 *   }|null
 * }>} - 作成された投稿データ
 * @throws {Object} バリデーションエラーや投稿者が見つからない場合のエラー
 */
export const createPostService = async (userId, postData) => {
  if (!postData.content) {
    throw { status: 400, message: "投稿内容は必須です" };
  }

  // 投稿者の情報を取得
  const user = await findUserByIdPublicRepository(userId);
  if (!user) {
    throw { status: 404, message: "ユーザーが見つかりません" };
  }

  // 投稿者のタグ情報を取得し、投稿データにセット
  const userTags = user.tags.map(tag => ({
    name: tag.name,
    level: tag.level,
    currentExperience: tag.currentExperience,
    nextLevelExperience: tag.nextLevelExperience
  }));

  // 投稿データを作成 returnはauthorがpopulate済み
  const newPost = await createPostRepository({
    ...postData,
    author: userId,
    tags: userTags
  });

  // ユーザーの `posts` フィールドに `postId` を追加
  await updateUserRepository(userId, { $addToSet: { posts: newPost._id } });

  // クラブの `posts` フィールドに `postId` を追加（クラブが指定されている場合）
  if (postData.club) {
    const club = await findClubByIdRepository(postData.club);
    if (club) {
      await updateClubRepository(postData.club, { $addToSet: { posts: newPost._id } });
    }
  }

  return newPost;
};





/**
 * 投稿の詳細を取得
 * @param {string} postId - 投稿ID
 * @returns {Promise<{
 *   id: string,
 *   content: string,
 *   media: string|null,
 *   club: string|null,
 *   createdAt: string,
 *   tags: Array<{
 *     id: string,
 *     name: string,
 *     level: number,
 *     currentExperience: number,
 *     nextLevelExperience: number
 *   }>,
 *   comments: Array<string>,
 *   author: {
 *     id: string,
 *     username: string,
 *     profilePicture: string|null
 *   }|null
 * }>} - 投稿の詳細データ
 * @throws {Object} 投稿が見つからない場合は404エラー
 */
export const getPostDetailsService = async (postId) => {
  const post = await getPostWithAuthorDetailsRepository(postId); // `populate()` されたデータを取得
  if (!post) throw { status: 404, message: "投稿が見つかりませんでした" };
  return post;
};



/**
 * ユーザーの投稿一覧を取得
 * @param {string} userId - ユーザーID
 * @returns {Promise<Array<{
 *   id: string,
 *   content: string,
 *   media: string|null,
 *   club: string|null,
 *   createdAt: string,
 *   tags: Array<{
 *     id: string,
 *     name: string,
 *     level: number,
 *     currentExperience: number,
 *     nextLevelExperience: number
 *   }>,
 *   comments: Array<string>,
 *   author: {
 *     id: string,
 *     username: string,
 *     profilePicture: string|null
 *   }|null
 * }>>} - ユーザーの投稿一覧
 */
export const getUserPostsService = async (userId) => {
  return await getUserPostsRepository(userId);
};


/**
 * クラブの投稿一覧を取得
 * @param {string} clubId - クラブID
 * @returns {Promise<Array<{
 *   id: string,
 *   content: string,
 *   media: string|null,
 *   club: string|null,
 *   createdAt: string,
 *   tags: Array<{
 *     id: string,
 *     name: string,
 *     level: number,
 *     currentExperience: number,
 *     nextLevelExperience: number
 *   }>,
 *   comments: Array<string>,
 *   author: {
 *     id: string,
 *     username: string,
 *     profilePicture: string|null
 *   }|null
 * }>>} - クラブの投稿一覧
 */
export const getClubPostsService = async (clubId) => {
  return await getClubPostsRepository(clubId);
};


/**
 * ホームフィードの投稿一覧を取得
 * @param {string[]} userIds - フォロー中のユーザーと自分のID配列
 * @returns {Promise<Array<{
 *   id: string,
 *   content: string,
 *   media: string|null,
 *   club: string|null,
 *   createdAt: string,
 *   tags: Array<{
 *     id: string,
 *     name: string,
 *     level: number,
 *     currentExperience: number,
 *     nextLevelExperience: number
 *   }>,
 *   comments: Array<string>,
 *   author: {
 *     id: string,
 *     username: string,
 *     profilePicture: string|null
 *   }|null
 * }>>} - ホームフィードの投稿一覧
 */
export const getHomePostsService = async (userIds) => {
  return await getHomePostsRepository(userIds);
};




