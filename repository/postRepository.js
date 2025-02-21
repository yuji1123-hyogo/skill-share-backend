import Post from "../models/Post.js";


//返却する投稿内容の整形(事前にauthorをpopulateしている)
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
 * ✅ 投稿を作成（`author` を `populate()` する）
 * @param {object} postData - 投稿データ
 * @returns {Promise<object>} - 作成された投稿（`author` の詳細情報付き）
 */
export const createPostRepository = async (postData) => {
  const newPost = new Post(postData);
  await newPost.save(); // 一旦保存

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
 * ✅ `author` を `populate()` した投稿の詳細を取得（APIレスポンス用）
 * @param {string} postId - 投稿 ID
 * @returns {Promise<object | null>} - `author` の詳細情報を含む投稿データ
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
 * ✅ 投稿の詳細を取得（`populate()` なし）
 * @param {string} postId - 投稿 ID
 * @returns {Promise<object | null>} - 投稿データ
 */
export const findPostByIdRepository = async (postId) => {
  return await Post.findById(postId);
};


/**
 * ✅ ユーザーの投稿一覧を取得（ID のみ）
 * @param {string} userId - ユーザー ID
 * @returns {Promise<string[]>} - 投稿 ID の配列
 */
export const getUserPostsRepository = async (userId) => {
  const posts = await Post.find({ author: userId }).populate("author", "_id username profilePicture").lean();
  const formattedPosts = posts.map(formatPost);
  return formattedPosts;
};

/**
 * ✅ クラブの投稿一覧を取得（ID のみ）
 * @param {string} clubId - クラブ ID
 * @returns {Promise<string[]>} - 投稿 ID の配列
 */
export const getClubPostsRepository = async (clubId) => {
  const posts = await Post.find({ club: clubId }).populate("author", "_id username profilePicture").lean();
  const formattedPosts = posts.map(formatPost);
  return formattedPosts;
};

/**
 * ✅ ホームフィードの投稿一覧を取得（ID のみ）
 * @param {string[]} userIds - ユーザー ID 配列（フォロー中のユーザー + 自分）
 * @returns {Promise<string[]>} - 投稿 ID の配列
 */
export const getHomePostsRepository = async (userIds) => {
  const posts = await Post.find({ author: { $in: userIds } }).populate("author", "_id username profilePicture").lean();
  const formattedPosts = posts.map(formatPost);
  return formattedPosts;
};

/**
 * ✅ 投稿の `comments` フィールドを更新
 * @param {string} postId - 投稿 ID
 * @param {object} updateData - 更新するデータ
 */
export const updatePostRepository = async (postId, updateData) => {
  await Post.findByIdAndUpdate(postId, updateData, { new: true });
};
