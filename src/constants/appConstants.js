// src/constants/appConstants.js

export const MOOD_OPTIONS = {
  '絶好調': '😊',
  '好調': '🙂',
  '普通': '😐',
  '不調': '😥',
  '絶不調': '😢'
};

// 新しく排便のオプションを定義
export const POOP_OPTIONS = {
  'あり': '〇',
  'なし': '×'
};

// --- [ここから新規追加] アクティビティ・症状の選択肢 ---
export const SYMPTOM_OPTIONS = {
  // key: 保存用のID, value: ボタンに表示するテキスト
  'exercise': '💪 運動',
  'headache': '🤕 頭痛',
  'hangover': '🤢 二日酔い'
};
// --- [ここまで新規追加] ---