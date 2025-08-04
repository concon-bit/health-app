// src/utils/calorieUtils.js

// 運動の種類ごとのMETs（運動強度）の目安。値が大きいほど強度が強い。
// 出典：国立健康・栄養研究所「改訂版『身体活動のメッツ（METs）表』」など
const METS_TABLE = {
  // 筋力トレーニング
  strength_general: 3.5, // 軽度～中程度の一般的な筋トレ
  strength_vigorous: 6.0, // ハードな筋トレ

  // 有酸素運動
  walking_normal: 3.5, // 普通の歩行
  walking_brisk: 5.0, // 早歩き
  running_slow: 8.0, // ジョギング
  running_fast: 12.5, // ランニング(10km/h程度)
  cycling_leisure: 4.0, // サイクリング（ゆっくり）
  swimming_freestyle: 7.0, // 水泳（クロール）
  
  // その他
  yoga: 2.5, // ヨガ
  stretching: 2.3, // ストレッチ
};

/**
 * 消費カロリーを計算します (あくまでも概算値です)
 * @param {string} exerciseType - METS_TABLEのキー
 * @param {number} durationMinutes - 運動時間（分）
 * @param {number} bodyWeightKg - 体重 (kg)
 * @returns {number} 消費カロリー (kcal)
 */
export const calculateCaloriesBurned = (exerciseType, durationMinutes, bodyWeightKg) => {
  if (!METS_TABLE[exerciseType] || !durationMinutes || !bodyWeightKg) {
    return 0;
  }
  
  const mets = METS_TABLE[exerciseType];
  const durationHours = durationMinutes / 60;
  
  // 計算式: METs × 体重(kg) × 運動時間(h) × 1.05
  const calories = mets * bodyWeightKg * durationHours * 1.05;
  
  return Math.round(calories);
};