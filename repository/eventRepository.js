import Event from "../models/Event.js";


/**
 * イベント作成
 */
export const createEventRepository = async (eventData) => {
  return await Event.create(eventData);
};


export const getEventWithUserDetailsRepository = async (eventId) => {
  const event = await Event.findById(eventId)
    .populate("host", "_id username profilePicture")
    .populate("participants", "_id username profilePicture")
    .populate("mvp", "_id username profilePicture")
    .lean(); // Mongoose Document ではなくプレーンオブジェクトに変換

  if (!event) return null;

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



/**
 * イベント詳細取得
 */
export const getEventByIdRepository = async (eventId) => {
  return await Event.findById(eventId);
};


/**
 * イベント参加
 */
export const addParticipantRepository = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  if (!event || event.participants.includes(userId)) return null;

  event.participants.push(userId);
  await event.save();

  return event; // 更新後のイベント情報を返す
};


/**
 * イベントステータス更新
 */
export const updateEventStatusRepository = async (eventId, status) => {
  return await Event.findByIdAndUpdate(eventId, { status }, { new: true });
};

/**
 * MVP 投票
 */
export const voteForMvpRepository = async (eventId, voterId, candidateId) => {
  const event = await Event.findById(eventId);
  if (!event || !event.participants.includes(candidateId)) return false;

  // 既に投票済みかチェック
  const hasVoted = event.votes.some(vote => vote.voter.toString() === voterId);
  if (hasVoted) return false;

  event.votes.push({ voter: voterId, candidate: candidateId });
  await event.save();
  return true;
};

/**
 * MVP 決定 
 */
export const determineMvpRepository = async (eventId, mvpId) => {
  return await Event.findByIdAndUpdate(eventId, { mvp: mvpId }, { new: true });
};


/**
 * イベントをIDで取得
 * @param {string} eventId - イベントのID
 * @returns {Promise<object | null>} - イベントデータ or null
 */
export const findEventByIdRepository = async (eventId) => {
  return await Event.findById(eventId);
};

/**
 * イベントの経験値分配フラグを `true` に更新
 */
export const updateEventExpDistributedRepository = async (eventId) => {
  return await Event.findByIdAndUpdate(eventId, { expDistributed: true }, { new: true });
};