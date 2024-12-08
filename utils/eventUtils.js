const Event = require("../models/Event");
const Club = require("../models/Club");
const User = require("../models/User");
const { addExperience } = require("./levelCulc"); // レベル計算用

// イベントを作成する
async function createEvent(data) {
  const { name, description, date, clubId, tags,user } = data;

  // クラブが存在するか確認
  const club = await Club.findById(clubId);
  if (!club) throw new Error("クラブが見つかりません");


  // タグの確認
  // タグの確認: 空または未定義の場合、汎用タグを設定
  const finalTags = (!tags || tags.length === 0) ? ["general"] : tags;
    

  // イベントの新規作成
  const event = new Event({
    name,
    description,
    date,
    club: clubId,
    tags:finalTags, // 汎用タグまたは指定されたタグ
    participants:[{user}]
  });

  // 保存
  await event.save();

  // クラブにイベントを追加
  club.events.push(event._id);
  await club.save();

  return {event,club};
}

// イベントに参加する
async function addParticipant(eventId, userId) {
  const event = await Event.findById(eventId)
  .populate("participants.user").populate("votes.candidate","username").populate("club","name");
  if (!event) throw new Error("イベントが見つかりません");

  // 既に参加している場合はエラー
  if (event.participants.some((p) => p.user.toString() === userId)) {
    throw new Error("すでに参加しています");
  }

  // 参加者をイベントに追加
  event.participants.push({ user: userId });
  await event.save();

  // ユーザーにイベント参加履歴を追加
  const user = await User.findById(userId);
  user.eventsParticipated.push(eventId);
  await user.save();

  return event;
}

// タグでイベントを検索
async function getEventsByTags(taglist) {
  // 指定されたタグIDを持つイベントを検索
  const events = await Event.find({ tags: { $in: taglist } }).populate("participants.user").populate("votes.candidate","username").populate("club","name");
  return events;
}


async function distributeExperience(eventId, experience = 100, mvpBonus=100, clubExperienceMultiplier = 1.5) {
    // イベントと参加者データを取得
    const event = await Event.findById(eventId)
    .populate("participants.user")
    .populate("votes.candidate","username")
    .populate("club");

    event.status = "completed"

    console.log("イベント",event)
    if (!event) throw new Error("イベントが見つかりません");

    const mvpUserId = event.mvp
    const eventTags = event.tags;

    // タグごとに経験値を分配
    for (const eventTag of eventTags) {
        // 参加者に対する処理
        for (const participant of event.participants) {
            const user = participant.user;
            const userTags = user.hobbies;

            userTags.forEach((hobby) => {
                console.log("hoby",hobby)
                if (eventTag === hobby.name) { // hobby の名前が一致する場合
                    const calculatedExperience = 
                    user._id.toString() === mvpUserId 
                        ? experience + mvpBonus 
                        : experience;

                    // 経験値計算とレベルアップ処理
                    const updatedHobby = addExperience({
                        currentExperience: hobby.currentExperience,
                        level: hobby.level,
                        nextLevelExperience: hobby.nextLevelExperience,
                    }, calculatedExperience);
                    
                    console.log("updatehoby",updatedHobby)
                    // ユーザーのタグデータを更新
                    hobby.level = updatedHobby.level;
                    hobby.currentExperience = updatedHobby.currentExperience;
                    hobby.nextLevelExperience = updatedHobby.nextLevelExperience;
                }
            });

            // 保存
            await user.save();
        }

        // クラブのタグに対する処理
        const clubTags = event.club.tags;
        clubTags.forEach((clubTag) => {
            if (clubTag.name === eventTag) { // タグの名前が一致する場合
                const updatedTag = addExperience({
                    currentExperience: clubTag.currentExperience,
                    level: clubTag.level,
                    nextLevelExperience: clubTag.nextLevelExperience,
                }, experience * clubExperienceMultiplier);

                // クラブタグデータを更新
                clubTag.level = updatedTag.level;
                clubTag.currentExperience = updatedTag.currentExperience;
                clubTag.nextLevelExperience = updatedTag.nextLevelExperience;
            }
        });
    }

    
    // クラブのデータを保存
    await event.club.save();
}
  




// MVP に投票する
async function voteForMVP(eventId, voterId, candidateId) {
  const event = await Event.findById(eventId)
  if (!event) throw new Error("イベントが見つかりません");

  // 既に投票済みかチェック
  if (event.votes.some((vote) => vote.voter.toString() === voterId)) {
    throw new Error("すでに投票済みです");
  }

  // 投票を追加
  event.votes.push({ voter: voterId, candidate: candidateId });
  await event.save();

  const updatedEvent = await Event.findById(eventId)
  .populate("participants.user")
  .populate("votes.candidate", "username")
  .populate("club", "name")
  .populate("mvp","username")

  return updatedEvent;
}



//MVPの決定
async function determineMVP(eventId) {
    // イベントを取得
    const event = await Event.findById(eventId)
    .populate("participants.user")
    .populate("votes.candidate", "username")
    .populate("club", "name")
    .populate("mvp","username")
    if (!event) throw new Error("イベントが見つかりません");
  
    if (event.votes.length === 0) {
      throw new Error("投票がありません");
    }
  
    
    
    // 投票を集計
    const voteCounts = event.votes.reduce((accumulator, vote) => {
      const candidateId = vote.candidate._id.toString();
      if (!accumulator[candidateId]) {
        accumulator[candidateId] = 0;
      }
      accumulator[candidateId]++;
      return accumulator;
    }, {});
  
    

    // 最多得票数を算出
    const maxVotes = Math.max(...Object.values(voteCounts));
  
    // 最多得票者をリストアップ
    const topCandidates = Object.keys(voteCounts).filter(
      (candidateId) => voteCounts[candidateId] === maxVotes
    );

  
    // 同票の場合ランダムに選択
    const mvpId = topCandidates[Math.floor(Math.random() * topCandidates.length)];
    const mvp = event.votes.find((vote) => vote.candidate._id.toString() === mvpId)?.candidate;

    // MVP をイベントに保存
    event.mvp = mvpId;
    await event.save();

    const updatedEvent = await Event.findById(eventId)
    .populate("participants.user")
    .populate("votes.candidate", "username")
    .populate("club", "name")
    .populate("mvp","username")
  
    return updatedEvent
}



// ユーザーの趣味タグに基づくイベントのおすすめを取得
async function recommendEventsForUser(userId) {
  const user = await User.findById(userId).populate("hobbies.name");
  if (!user) throw new Error("ユーザーが見つかりません");
  // ユーザーの趣味タグを取得
  const userTags = user.hobbies.map((hobby) => hobby.name);
  // 趣味タグに関連するイベントを検索
  const events = await Event.find({ tags: { $in: userTags } }).populate("participants.user").populate("votes.candidate","username").populate("club","name");
  return events;
}




async function updateEventStatus(eventId) {
    const event = await Event.findById(eventId).populate("participants.user").populate("votes.candidate","username").populate("club","name");
    if (!event) throw new Error("イベントが見つかりません");
  
    const now = new Date();
  
    console.log(event.status)
    if (event.status === "upcoming") {
      event.status = "ongoing"; // 開催
    } else if(event.status === "ongoing") {
        console.log("処理開始")
      event.status = "completed"; // 終了
    } 

    await event.save();
    return event;
  }
// エクスポート
module.exports = {
  determineMVP,
  createEvent,
  addParticipant,
  getEventsByTags,
  distributeExperience,
  voteForMVP,
  recommendEventsForUser,
  updateEventStatus
};
