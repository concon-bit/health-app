// src/constants/appConstants.js

export const MOOD_OPTIONS = {
  '絶好調': '絶好調',
  '好調': '好調',
  '普通': '普通',
  '不調': '不調',
  '絶不調': '絶不調'
};

export const POOP_OPTIONS = {
  'あり': 'あり',
  'なし': 'なし'
};

// --- [修正] 'exercise'を削除 ---
export const SYMPTOM_OPTIONS = {
  'headache': '頭痛',
  'hangover': '二日酔い'
};

// --- [元に戻す] 睡眠、ストレス、飲酒の定義はそのまま ---
export const SLEEP_OPTIONS = {
  'good': '良い',
  'normal': '普通',
  'bad': '悪い'
};

export const STRESS_OPTIONS = {
  'low': '低い',
  'medium': '中',
  'high': '高い'
};

export const ALCOHOL_OPTIONS = {
  'yes': 'あり',
  'no': 'なし'
};