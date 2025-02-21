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
 * ✅ 投稿を作成
 * @param {string} userId - 投稿者のユーザー ID
 * @param {object} postData - 投稿内容
 * @returns {Promise<object>} - 作成された投稿（`author` の詳細情報付き）
 */
export const createPostService = async (userId, postData) => {
  if (!postData.content) {
    throw { status: 400, message: "投稿内容は必須です" };
  }

  // 1️⃣ 投稿者の情報を取得
  const user = await findUserByIdPublicRepository(userId);
  if (!user) {
    throw { status: 404, message: "ユーザーが見つかりません" };
  }

  // 2️⃣ 投稿者のタグ情報を取得し、投稿データにセット
  const userTags = user.tags.map(tag => ({
    name: tag.name,
    level: tag.level,
    currentExperience: tag.currentExperience,
    nextLevelExperience: tag.nextLevelExperience
  }));

  // 3️⃣ 投稿データを作成 returnはauthorがpopulate済み
  const newPost = await createPostRepository({
    ...postData,
    author: userId,
    tags: userTags
  });

  // 4️⃣ ユーザーの `posts` フィールドに `postId` を追加
  await updateUserRepository(userId, { $addToSet: { posts: newPost._id } });

  // 5️⃣ クラブの `posts` フィールドに `postId` を追加（クラブが指定されている場合）
  if (postData.club) {
    const club = await findClubByIdRepository(postData.club);
    if (club) {
      await updateClubRepository(postData.club, { $addToSet: { posts: newPost._id } });
    }
  }

  return newPost;
};




/**
 * ✅ 投稿の詳細を取得
 * @param {string} postId - 投稿 ID
 * @returns {Promise<object>} - `author` の詳細情報を含む投稿データ
 */
export const getPostDetailsService = async (postId) => {
  const post = await getPostWithAuthorDetailsRepository(postId); // ✅ `populate()` されたデータを取得
  if (!post) throw { status: 404, message: "投稿が見つかりませんでした" };
  return post;
};



 
export const getUserPostsService = async (userId) => {
  return await getUserPostsRepository(userId);
};


export const getClubPostsService = async (clubId) => {
  return await getClubPostsRepository(clubId);
};


export const getHomePostsService = async (userIds) => {
  return await getHomePostsRepository(userIds);
};




