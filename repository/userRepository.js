import User from "../models/User.js";

/**
 * ユーザーを新規作成
 * @param {string} username - ユーザー名
 * @param {string} email - メールアドレス
 * @param {string} hashedPassword - ハッシュ化されたパスワード
 * @returns {Promise<User>}
 */
export const createUserrepository = async (username, email, hashedPassword) => {
  const newUser = new User({ username, email, password: hashedPassword });
  return await newUser.save();
};


//重複チェック用
/**
 * メールアドレスからユーザーを検索
 * @param {string} email - 検索するメールアドレス
 * @returns {Promise<User | null>}
 */
export const findUserByEmailRepository = async (email) => {
  return await User.findOne({ email });
};

/**
 * ユーザー名からユーザーを検索
 * @param {string} username - 検索するユーザー名
 * @returns {Promise<User | null>}
 */
export const findUserByUsernameRepository = async (username) => {
  return await User.findOne({ username });
};




/**
 * ✅ 特定のユーザー情報を取得
 * @param {string} userId - ユーザー ID
 * @returns {Promise<object | null>} - ユーザー情報
 */
export const findUserByIdPublicRepository = async (userId) => {
  const user = await User.findById(userId).select("-email");
  return {
    id: user._id.toString(),
    username: user.username,
    profilePicture: user.profilePicture,
    bio: user.bio,
    tags: user.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],
    location: user.location ? {
      id: user.location._id.toString(),
      type: user.location.type,
      coordinates: user.location.coordinates,
      address: user.location.address,
    } : null,
    clubs: user.clubs?.map((club) => club.toString()) ?? [],
    posts: user.posts?.map((post) => post.toString()) ?? [],
    following: user.following?.map((user) => user.toString()) ?? [],
  }
};

/**
 * ✅ ユーザーのフォロー状態を更新（フォロー/フォロー解除）
 * @param {string} userId - 操作を行うユーザー ID
 * @param {string} targetUserId - フォローする/解除するユーザー ID
 * @param {"follow" | "unfollow"} action - "follow" or "unfollow"
 * @returns {Promise<User>}
 */
export const updateFollowStatusRepository = async (userId, targetUserId, action) => {
  const update =
    action === "follow"
      ? { $addToSet: { following: targetUserId } } // フォロー
      : { $pull: { following: targetUserId } }; // フォロー解除

  return await User.findByIdAndUpdate(userId, update, { new: true });
};


/**
 * ✅ 参加しているクラブ一覧を取得
 * @param {string} userId - ユーザー ID
 * @returns {Promise<string[]>} - クラブ ID 配列
 */
export const getUserClubsRepository = async (userId) => {
  const clubIdListWithUserId = await User.findById(userId).select("clubs").lean();
  if(!clubIdListWithUserId){
    return []
  }
  const clubIdList = clubIdListWithUserId.clubs
  return clubIdList;
};

/**
 * ✅ ユーザー情報を更新
 * @param {string} userId - ユーザー ID
 * @param {object} updateData - 更新するデータ
 * @returns {Promise<object | null>} - 更新後のユーザー情報
 */
export const updateUserRepository = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};


/**
 * ✅ ユーザー検索
 * @param {object} query - 検索クエリ
 */
export const searchUsersRepository = async (query) => {
  const users = await User.find(query)

  return users.map(user => ({
    id: user._id.toString(),
    username: user.username,
    profilePicture: user.profilePicture,
    bio: user.bio,
    tags: user.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],
    location: user.location ? {
      id: user.location._id.toString(),
      type: user.location.type,
      coordinates: user.location.coordinates,
      address: user.location.address,
    } : null,
    clubs: user.clubs?.map((club) => club.toString()) ?? [],
    posts: user.posts?.map((post) => post.toString()) ?? [],
    following: user.following?.map((user) => user.toString()) ?? [],
  }));
};


/**
 * ✅ ユーザーのタグ情報を更新
 * @param {string} userId - ユーザーのID
 * @param {Array} updatedTags - 更新後のタグリスト
 * @returns {Promise<object | null>} - 更新後のユーザーデータ or null
 */
export const updateUserTagsRepository = async (userId, updatedTags) => {
  return await User.findByIdAndUpdate(userId, { tags: updatedTags }, { new: true });
};


/**
 * ✅ フォローリストを取得
 * @param {string} userId - ユーザーID
 * @returns {Promise<Array<{ id: string, username: string, profilePicture?: string }>>}
 */
export const getFollowListRepository = async (userId) => {
  const user = await User.findById(userId)
  if (!user) throw { status: 404, message: "ユーザーが見つかりません" };

  return user.following.map(followedUser => followedUser.toString());
};