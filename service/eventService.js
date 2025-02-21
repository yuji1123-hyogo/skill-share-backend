import {
    getEventByIdRepository,
    addParticipantRepository,
    updateEventStatusRepository,
    voteForMvpRepository,
    createEventRepository,
    determineMvpRepository,
    findEventByIdRepository,
    updateEventExpDistributedRepository,
    getEventWithUserDetailsRepository,
  } from "../repository/eventRepository.js";
  
  import { findClubByIdRepository, updateClubRepository, updateClubTagsRepository } from "../repository/clubRepository.js";
  import { findUserByIdPublicRepository, updateUserTagsRepository } from "../repository/userRepository.js";
  
  /**
   * ✅ イベント作成
   */
  export const createEventService = async (eventData) => {
    const event = await createEventRepository(eventData);
  
    // クラブの `events` フィールドにイベント ID を追加
    await updateClubRepository(eventData.club, { $addToSet: { events: event._id } });
  
    // ✅ `populate()` したイベントを返す
    return await getEventWithUserDetailsRepository(event._id);
  };
  
  
  /**
   * ✅ イベント詳細取得
   */
  export const getEventByIdService = async (eventId) => {
    // ✅ `populate()` あり
    const event = await getEventWithUserDetailsRepository(eventId); 
    if (!event) throw { status: 404, message: "イベントが見つかりません" };
    return event;
  };
  






/**
 * ✅ イベント参加
 */
export const participateEventService = async (eventId, userId) => {
  const event = await getEventByIdRepository(eventId); // ✅ `populate()` なし
  if (!event) throw { status: 404, message: "イベントが見つかりません" };

  if (event.participants.includes(userId)) {
    throw { status: 403, message: "既に参加済みです" };
  }

  await addParticipantRepository(eventId, userId);

  // ✅ `populate()` されたイベントを返す
  return await getEventWithUserDetailsRepository(eventId);
};



  /**
 * ✅ 次のイベントステータスを決定
 * @param {string} currentStatus - 現在のステータス
 * @returns {string | null} - 次のステータス (変更不可なら `null`)
 */
const getNextEventStatus = (currentStatus) => {
  const statusFlow = {
      "upcoming": "ongoing",
      "ongoing": "completed",
      "completed": null, // `completed` のイベントは変更不可
  };

  return statusFlow[currentStatus] || null;
};


/**
 * ✅ イベントステータスを次のステータスに更新（リクエストのデータ不要）
 * @param {string} eventId - イベント ID
 * @param {string} userId - 操作を行うユーザー ID
 * @returns {Promise<object>} - 更新後のイベント
 */
export const updateEventStatusService = async (eventId, userId) => {
  const event = await getEventByIdRepository(eventId); // ✅ `populate()` なし
  if (!event) throw { status: 404, message: "イベントが見つかりません" };

  if (event.host.toString() !== userId) {
    throw { status: 403, message: "イベント管理者以外はステータスを変更できません" };
  }

  const nextStatus = getNextEventStatus(event.status);
  if (!nextStatus) {
    throw { status: 400, message: "このイベントのステータスは既に完了しており、更新できません" };
  }

  await updateEventStatusRepository(eventId, nextStatus);

  // ✅ `populate()` されたイベントを返す
  return await getEventWithUserDetailsRepository(eventId);
};





  
  /**
   * ✅ MVP 投票
   */
  export const voteForMvpService = async (eventId, voterId, candidateId) => {
    const event = await getEventByIdRepository(eventId); // ✅ `populate()` なし
    if (!event) throw { status: 404, message: "イベントが見つかりません" };
  
    if (event.status !== "ongoing") {
      throw { status: 403, message: "イベント開催中にのみ投票できます" };
    }
  
    if (!event.participants.includes(voterId)) {
      throw { status: 403, message: "イベント参加者のみが投票できます" };
    }
  
    if (!event.participants.includes(candidateId)) {
      throw { status: 400, message: "候補者はイベントの参加者である必要があります" };
    }
  
    await voteForMvpRepository(eventId, voterId, candidateId);
  
    // ✅ 修正: `populate()` したイベントを返す
    return await getEventWithUserDetailsRepository(eventId);
  };
  



  /**
   * ✅ MVP の決定
   */
  export const determineMvpService = async (eventId, userId) => {
    const event = await getEventByIdRepository(eventId); // ✅ `populate()` なし
    if (!event) throw { status: 404, message: "イベントが見つかりません" };
  
    if (event.status !== "completed") {
      throw { status: 400, message: "イベント終了後にのみ実行できます" };
    }
  
    if (!event.participants.includes(userId)) {
      throw { status: 403, message: "イベント参加者のみ実行できます" };
    }
  
    // MVP の決定
    let mvpId;
    if (event.votes.length === 0) {
      mvpId = event.participants[Math.floor(Math.random() * event.participants.length)];
    } else {
      const voteCounts = {};
      event.votes.forEach(({ candidate }) => {
        voteCounts[candidate] = (voteCounts[candidate] || 0) + 1;
      });
      const maxVotes = Math.max(...Object.values(voteCounts));
      const topCandidates = Object.keys(voteCounts).filter(candidate => voteCounts[candidate] === maxVotes);
      mvpId = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    }
  
    await determineMvpRepository(eventId, mvpId);
  
    // ✅ `populate()` されたイベントを返す
    return await getEventWithUserDetailsRepository(eventId);
  };
  
  




  export const distributeExpService = async (eventId, userId) => {
    const event = await findEventByIdRepository(eventId);
    if (!event) throw { status: 404, message: "イベントが見つかりません" };

    // ✅ 経験値分配の条件チェック
    if (event.status !== "completed") {
        throw { status: 400, message: "イベントが終了していないため、経験値を分配できません" };
    }
    if (event.expDistributed) {
      throw { status: 400, message: "このイベントの経験値はすでに分配済みです" };
    }
    if (!event.mvp) {
        throw { status: 400, message: "MVPが確定していないため、経験値を分配できません" };
    }
    if (!event.participants.includes(userId)) {
        throw { status: 403, message: "イベント参加者のみが経験値分配を実行できます" };
    }

    const eventTags = event.eventtags;
    const participants = event.participants;
    const mvp = event.mvp;
    const eventClubId = event.club; // ✅ イベントのクラブID

    const updatedUsers = new Set();
    let clubUpdated = false;

    // ✅ 参加者ごとにタグを更新
    for (const participantId of participants) {
        const user = await findUserByIdPublicRepository(participantId);
        if (!user) continue;

        // ✅ ユーザーのタグ更新
        let userUpdated = false;
        user.tags.forEach(tag => {
            if (eventTags.includes(tag.name)) {
                tag.currentExperience += participantId === mvp ? 200 : 100; // MVPはボーナス
                if (tag.currentExperience >= tag.nextLevelExperience) {
                    tag.level += 1;
                    tag.currentExperience = 0;
                    tag.nextLevelExperience *= 1.5; // レベルアップ時の必要EXP増加
                }
                userUpdated = true;
            }
        });

        if (userUpdated) {
            await updateUserTagsRepository(participantId, user.tags);
            updatedUsers.add(participantId);
        }
    }

    // ✅ イベントのクラブのタグを更新
    const club = await findClubByIdRepository(eventClubId);
    if (club) {
        club.tags.forEach(tag => {
            if (eventTags.includes(tag.name)) {
                tag.currentExperience += 100; // クラブのタグにも経験値を加算
                if (tag.currentExperience >= tag.nextLevelExperience) {
                    tag.level += 1;
                    tag.currentExperience = 0;
                    tag.nextLevelExperience *= 1.5;
                }
                clubUpdated = true;
            }
        });

        if (clubUpdated) {
            await updateClubTagsRepository(eventClubId, club.tags);
        }
    }

    // ✅ 経験値分配フラグを `true` に更新
    await updateEventExpDistributedRepository(eventId);

    return {
        message: "経験値が分配されました",
        updatedUsers: [...updatedUsers],
        updatedClub: clubUpdated ? eventClubId : null // ✅ 更新されたクラブIDを返す
    };
};

  