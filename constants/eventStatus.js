export const EVENT_STATUS = {
  UPCOMING: "upcoming",      // 開催前
  IN_PROGRESS: "ongoing", // 開催中
  COMPLETED: "completed",    // 終了
};

// 値の変更を防止
Object.freeze(EVENT_STATUS); 