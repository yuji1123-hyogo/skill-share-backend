import User from "../models/User.js";
import Club from "../models/Club.js";

/**
 * ユーザーとクラブの全タグを取得
 * @returns {Promise<string[]>} - ユニークなタグのリスト
 */
export const getAllTagsRepository = async () => {
    // ユーザーのタグを取得
    const users = await User.find({}, "tags").lean();
    const userTags = users.flatMap(user => user.tags.map(tag => tag.name));

    // クラブのタグを取得
    const clubs = await Club.find({}, "tags").lean();
    const clubTags = clubs.flatMap(club => club.tags.map(tag => tag.name));

    // タグを統合してユニークなリストを作成
    return [...new Set([...userTags, ...clubTags])];
};
