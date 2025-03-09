import { getAllTagsRepository } from "../repository/tagRepository.js";


/**
 * タグの更新処理
 * @param {Array} existingTags - 現在のタグ（[{ name: "tech", level: 2 }, ...]）
 * @param {Array} newTags - 更新リクエストのタグ（["tech", "ai"]）
 */
export const processTagsForUpdate = ({existingTags =[], newTags}) => {
    //重複を削除
    const updatedTagNames = new Set(newTags);
  
    // (1) 既存タグで `newTags` に含まれているもののみ残す
    const retainedTags = existingTags.filter(tag => updatedTagNames.has(tag.name));
  
    // (2) 新しいタグを追加（既存にないもの）
    const addedTags = [...updatedTagNames]
      .filter(tagName => !retainedTags.some(tag => tag.name === tagName))
      .map(tagName => ({
        name: tagName,
        level: 1,
        currentExperience: 0,
        nextLevelExperience: 100
      }));
  
    return [...retainedTags, ...addedTags];
  };
  



/**
 * Levenshtein Distance（編集距離）を計算
 * @param {string} str1 - 比較対象の文字列
 * @param {string} str2 - 検索クエリ
 * @returns {number} - 文字列の編集距離
 */
const calculateLevenshteinDistance = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const dp = Array.from(Array(len1 + 1), () => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j],    // 削除
                    dp[i][j - 1],    // 挿入
                    dp[i - 1][j - 1] // 置換
                ) + 1;
            }
        }
    }

    return dp[len1][len2];
};

/**
 * タグ検索（編集距離を考慮）
 * @param {string} query - 検索クエリ
 * @param {number} threshold - 許容する編集距離
 * @param {number} limit - 最大取得件数
 * @returns {Promise<string[]>} - 検索結果のタグリスト
 */
export const searchTagsService = async (query, threshold = 2, limit = 10) => {
    const allTags = await getAllTagsRepository();
    
    // Levenshtein Distance を計算し、近いものを抽出
    const matchedTags = allTags
        .map(tag => ({ tag, distance: calculateLevenshteinDistance(tag.toLowerCase(), query.toLowerCase()) }))
        .filter(({ distance }) => distance <= threshold)
        .sort((a, b) => a.distance - b.distance) // 近い順にソート
        .slice(0, limit)
        .map(({ tag }) => tag);

    return matchedTags;
};
