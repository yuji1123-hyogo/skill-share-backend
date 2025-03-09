import Post from "../models/Post.js";
import User from "../models/User.js";
import Club from "../models/Club.js";

/**
 * 返却する投稿内容を整形（事前にauthorをpopulateしている必要あり）
 * @param {Object} post - MongoDBから取得した投稿データ
 * @returns {{
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
 * }} 整形された投稿データ
 */
const formatPost = (post) => {
  return {
    id: post._id.toString(),
    content: post.content,
    media: post.media ?? null,
    club: post.club?.toString() ?? null,
    createdAt: post.createdAt?.toISOString(),
    tags: post.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],
    comments: post.comments?.map((comment) => comment.toString()) ?? [],
    // `author` を手動で変換
    author: post.author ?
        {
          d: post.author._id.toString(),
          username: post.author.username,
          profilePicture: post.author.profilePicture ?? null,
        }: null,
  };
};


/**
 * 投稿を作成（`author` を `populate()` する）
 * @param {object} postData - 投稿データ
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
 * }>} - 作成された投稿の詳細構造
 */

export const createPostRepository = async (postData) => {
  const newPost = new Post(postData);
  await newPost.save(); // 一旦保存

  
 
  //クラブの投稿ならユーザーのpostsには保存しない
  if(newPost.club){
    // 投稿を作成したクラブの投稿一覧に追加
    await Club.findByIdAndUpdate(newPost.club, { $push: { posts: newPost._id } });
  }else{
    // 投稿を作成したユーザーの投稿一覧に追加
    await User.findByIdAndUpdate(newPost.author, { $push: { posts: newPost._id } });
  }

  // `author` を `populate` し、手動で変換
  const post = await Post.findById(newPost._id)
    .populate("author", "_id username profilePicture")
    .lean();

  if (!post) return null;

  return {
    id: post._id.toString(),
    content: post.content,
    media: post.media ?? null,
    club: post.club?.toString() ?? null,
    createdAt: post.createdAt?.toISOString(),
    tags: post.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],
    comments: post.comments?.map((comment) => comment.toString()) ?? [],

    // `author` を手動で変換
    author: post.author
      ? {
          id: post.author._id.toString(),
          username: post.author.username,
          profilePicture: post.author.profilePicture ?? null,
        }
      : null,
  };
};

/**
 * 投稿の詳細を取得（`author` を `populate()` する）
 * @param {string} postId - 投稿 ID
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
 * }|null>} - `author` の詳細情報を含む投稿データ、投稿が見つからない場合は null
 */
export const getPostWithAuthorDetailsRepository = async (postId) => {
  const post = await Post.findById(postId)
    .populate("author", "_id username profilePicture")
    .lean();

  if (!post) return null;

  return {
    id: post._id.toString(),
    content: post.content,
    media: post.media ?? null,
    club: post.club?.toString() ?? null,
    createdAt: post.createdAt?.toISOString(),
    tags: post.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],
    comments: post.comments?.map((comment) => comment.toString()) ?? [],

    // `author` を手動で変換
    author: post.author
      ? {
          id: post.author._id.toString(),
          username: post.author.username,
          profilePicture: post.author.profilePicture ?? null,
        }
      : null,
  };
};


/**
 * 投稿の詳細を取得（`populate()` なし）
 * @param {string} postId - 投稿 ID
 * @returns {Promise<import('mongoose').Document|null>} - MongoDBの生の投稿ドキュメント、見つからない場合はnull
 */
export const findPostByIdRepository = async (postId) => {
  return await Post.findById(postId);
};


/**
 * ユーザーの投稿一覧を取得（フォーマット済み）
 * @param {string} userId - ユーザー ID
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
 * }>>} - フォーマット済みの投稿オブジェクト配列
 */
export const getUserPostsRepository = async (userId) => {
  const posts = await Post.find({ author: userId }).populate("author", "_id username profilePicture").lean();
  const formattedPosts = posts.map(formatPost);
  return formattedPosts;
};

/**
 * クラブの投稿一覧を取得（フォーマット済み）
 * @param {string} clubId - クラブ ID
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
 * }>>} - フォーマット済みの投稿オブジェクト配列
 */
export const getClubPostsRepository = async (clubId) => {
  const posts = await Post.find({ club: clubId }).populate("author", "_id username profilePicture").lean();
  const formattedPosts = posts.map(formatPost);
  return formattedPosts;
};

/**
 * ホームフィードの投稿一覧を取得（フォーマット済み）
 * @param {string[]} userIds - ユーザー ID 配列（フォロー中のユーザー + 自分）
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
 * }>>} - フォーマット済みの投稿オブジェクト配列
 */
export const getHomePostsRepository = async (userIds) => {
  const posts = await Post.find({ author: { $in: userIds } }).populate("author", "_id username profilePicture").lean();
  const formattedPosts = posts.map(formatPost);
  return formattedPosts;
};

/**
 * 投稿を更新
 * @param {string} postId - 投稿 ID
 * @param {object} updateData - 更新するデータ
 * @returns {Promise<void>} - 更新処理の完了を示すPromise
 */
export const updatePostRepository = async (postId, updateData) => {
  await Post.findByIdAndUpdate(postId, updateData, { new: true });
};
