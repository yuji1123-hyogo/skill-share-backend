import Club from "../models/Club.js";
import Event from "../models/Event.js";

//イベントの整形(事前にhost,participants,mvpをpopulateしている)
const formatEvent = (event) => {
  return {
    id: event._id.toString(),
    name: event.name,
    description: event.description ?? null,
    date: event.date?.toISOString() ?? null,
    location: event.location ?? null,
    picture: event.picture ?? null,
    status: event.status,
    club: event.club?.toString() ?? null,
    expDistributed: event.expDistributed ?? false,
    eventtags: event.eventtags ?? [],
    createdAt: event.createdAt?.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
    sharedArticles: event.sharedArticles ?? [],
    feedbacks: event.feedbacks ?? [],

    // `host` を手動で変換
    host: event.host
      ? {
          id: event.host._id.toString(),
          username: event.host.username,
          profilePicture: event.host.profilePicture ?? null,
        }
      : null,

    // `participants` を手動で変換
    participants: Array.isArray(event.participants)
      ? event.participants.map((p) =>
          p
            ? {
                id: p._id.toString(),
                username: p.username,
                profilePicture: p.profilePicture ?? null,
              }
            : null
        )
      : [],

    // `mvp` を手動で変換
    mvp: event.mvp
      ? {
          id: event.mvp._id.toString(),
          username: event.mvp.username,
          profilePicture: event.mvp.profilePicture ?? null,
        }
      : null,

    // `votes` の `voter` & `candidate` を `ObjectId` の文字列に変換
    votes: Array.isArray(event.votes)
      ? event.votes.map((vote) => ({
          voter: vote.voter?.toString() ?? null,
          candidate: vote.candidate?.toString() ?? null,
        }))
      : [],
  };
};


//クラブの整形
const formatClub = (club) => {
  return {
    id: club._id.toString(),
    name: club.name,
    description: club.description ?? null,
    themeImage: club.themeImage ?? null,
    createdAt: club.createdAt?.toISOString(),
    
    // `tags` を変換
    tags: club.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],

    //locationを変換
    location: club.location ? {
      id: club.location._id.toString(),
      type: club.location.type,
      coordinates: club.location.coordinates,
      address: club.location.address,
    } : null,

    // `events`・`posts` を `ObjectId` の `toString()` に変換
    events: club.events?.map((e) => e.toString()) ?? [],
    posts: club.posts?.map((p) => p.toString()) ?? [],

    // `members` を手動で変換
    members: club.members?.map((member) =>
      member
        ? {
            id: member._id.toString(),
            username: member.username,
            profilePicture: member.profilePicture ?? null,
          }
        : null
    ) ?? [],
  };
};

/**
 * ✅ クラブを作成（`members` を `populate()` する）
 * @param {string} name - クラブ名
 * @param {string} description - クラブの説明
 * @param {string} themeImage - クラブのテーマ画像
 * @param {Array} tags - クラブのタグリスト
 * @param {string} ownerId - クラブ作成者の ID
 * @returns {Promise<object>} - 作成されたクラブ（`members` の詳細情報付き）
 */
export const createClubRepository = async ({name, description, themeImage, tags, ownerId,location}) => {
  const newClub = new Club({
    name,
    description,
    themeImage,
    tags,
    members: [ownerId], // 作成者をメンバーに追加
    location,
  });

  await newClub.save(); // クラブを保存

  return newClub._id
};

/**
 * ✅ `members` を `populate()` したクラブの詳細を取得（APIレスポンス用）
 * @param {string} clubId - クラブ ID
 * @returns {Promise<object | null>} - `members` の詳細情報を含むクラブデータ
 */
export const getClubWithMemberDetailsRepository = async (clubId) => {
  const club = await Club.findById(clubId)
    .populate("members", "_id username profilePicture")
    .lean();

  if (!club) return null;

  return {
    id: club._id.toString(),
    name: club.name,
    description: club.description ?? null,
    themeImage: club.themeImage ?? null,
    createdAt: club.createdAt?.toISOString(),
    
    // `tags` を変換
    tags: club.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],

    //locationを変換
    location: club.location ? {
      id: club.location._id.toString(),
      type: club.location.type,
      coordinates: club.location.coordinates,
      address: club.location.address,
    } : null,

    // `events`・`posts` を `ObjectId` の `toString()` に変換
    events: club.events?.map((e) => e.toString()) ?? [],
    posts: club.posts?.map((p) => p.toString()) ?? [],

    // `members` を手動で変換
    members: club.members?.map((member) =>
      member
        ? {
            id: member._id.toString(),
            username: member.username,
            profilePicture: member.profilePicture ?? null,
          }
        : null
    ) ?? [],
  };
};


/**
 * ✅ クラブの詳細を取得（`populate()` なし）
 * @param {string} clubId - クラブ ID
 * @returns {Promise<object | null>} - クラブデータ
 */
export const findClubByIdRepository = async (clubId) => {
  return await Club.findById(clubId);
};
/**
 * ✅ クラブのメンバー一覧（ID のみ）を取得
 * @param {string} clubId - クラブ ID
 * @returns {Promise<string[]>} - メンバー ID の配列
 */
export const getClubMemberIdsRepository = async (clubId) => {
  const club = await Club.findById(clubId).select("members").lean();
  return club?.members?.map((member) => member.toString()) ?? [];
};

/**
 * ✅ クラブのイベント一覧を取得（lean & 必要フィールドのみ）
 * @param {string} clubId - クラブ ID
 */
export const getClubEventsRepository = async (clubId) => {
  const events = await Event.find({ club: clubId }).populate("host", "_id username profilePicture").populate("participants", "_id username profilePicture").populate("mvp", "_id username profilePicture").lean();
  return events.map(formatEvent);
};

/**
 * ✅ クラブ情報を更新
 * @param {string} clubId - クラブ ID
 * @param {object} updateData - 更新データ
 * @returns {Promise<object | null>} - 更新後のクラブデータ
 */
export const updateClubRepository = async (clubId, updateData) => {
  console.log("updateclubrepository",updateData)
  return await Club.findByIdAndUpdate(clubId, updateData, { new: true });
};

/**
 * ✅ クラブ名の存在チェック
 * @param {string} name - クラブ名
 * @returns {Promise<boolean>} - クラブが存在するかどうか
 */
export const clubNameExistsRepository = async (name) => {
  const existingClub = await Club.findOne({ name });
  return !!existingClub;
};

/**
 * ✅ クエリに基づいてクラブの ID を検索
 * @param {object} query - 検索クエリ
 * @returns {Promise<Array<string>>} - クラブの ID リスト
 */
export const searchClubsRepository = async (query) => {
  const clubs = await Club.find(query);
  return clubs.map(club => ({
    id: club._id.toString(),
    name: club.name,
    description: club.description ?? null,
    themeImage: club.themeImage ?? null,
    createdAt: club.createdAt?.toISOString(),
    
    // `tags` を変換
    tags: club.tags?.map((tag) => ({
      id: tag._id.toString(),
      name: tag.name,
      level: tag.level,
      currentExperience: tag.currentExperience,
      nextLevelExperience: tag.nextLevelExperience,
    })) ?? [],

    //locationを変換
    location: club.location ? {
      id: club.location._id.toString(),
      type: club.location.type,
      coordinates: club.location.coordinates,
      address: club.location.address,
    } : null,

    // `events`・`posts` を `ObjectId` の `toString()` に変換
    events: club.events?.map((e) => e.toString()) ?? [],
    posts: club.posts?.map((p) => p.toString()) ?? [],

    // `members` を手動で変換
    members: club.members?.map((member) =>
      member
        ? {
            id: member._id.toString(),
            username: member.username,
            profilePicture: member.profilePicture ?? null,
          }
        : null
    ) ?? [],
  }));
};
/**
 * ✅ クラブのタグ情報を更新
 * @param {string} clubId - クラブ ID
 * @param {Array} updatedTags - 更新後のタグリスト
 * @returns {Promise<object | null>} - 更新後のクラブデータ
 */
export const updateClubTagsRepository = async (clubId, updatedTags) => {
  return await Club.findByIdAndUpdate(clubId, { tags: updatedTags }, { new: true });
};


//地図情報で検索
export const searchClubsByLocationRepository = async (coordinates) => {
  const clubs = await Club.find({ location: { $geoWithin: { $centerSphere: [coordinates, 10000] } } });
  return clubs.map(formatClub);
};

