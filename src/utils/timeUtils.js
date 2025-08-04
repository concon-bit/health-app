// src/utils/timeUtils.js

/**
 * 現在時刻が指定されたタイミングの終了時間を過ぎているか判定します。
 * @param {string} timing - 'morning', 'noon', 'night'
 * @returns {boolean}
 */
export const isPastDue = (timing) => {
  const now = new Date();
  const currentHour = now.getHours();

  const dueTimes = {
    morning: 12, // 朝の薬は昼の12時まで
    noon: 17,    // 昼の薬は夕方5時まで
    night: 22,   // 夜の薬は夜10時まで
  };

  if (dueTimes[timing] && currentHour >= dueTimes[timing]) {
    return true;
  }
  return false;
};