// src/utils/periodUtils.js

import { addDays, differenceInDays, isValid, parseISO } from 'date-fns';

/**
 * 生理記録と現在の生理開始日に基づいて、平均周期と次回の予測を計算します。
 * @param {Array} records - 完了した生理記録の配列
 * @param {string|null} ongoingPeriodStartDate - 現在進行中の生理開始日 (YYYY-MM-DD)
 * @returns {Object} { averageCycle, nextPredictedDate }
 */
export const calculateCycleInfo = (records, ongoingPeriodStartDate) => {
  const sortedRecords = [...records].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  let lastStartDate;

  // 最新の生理開始日を特定する
  if (ongoingPeriodStartDate) {
    lastStartDate = parseISO(ongoingPeriodStartDate);
  } else if (sortedRecords.length > 0) {
    lastStartDate = parseISO(sortedRecords[sortedRecords.length - 1].startDate);
  }

  // 最新の開始日が見つからない場合は予測不可
  if (!lastStartDate || !isValid(lastStartDate)) {
    return { averageCycle: 28, nextPredictedDate: null };
  }

  let averageCycle = 28; // デフォルト周期

  // 記録が2件以上ある場合のみ平均周期を計算
  if (sortedRecords.length >= 2) {
    let totalCycleDays = 0;
    let cycleCount = 0;

    for (let i = 1; i < sortedRecords.length; i++) {
      const previousStartDate = parseISO(sortedRecords[i - 1].startDate);
      const currentStartDate = parseISO(sortedRecords[i].startDate);
      
      if(isValid(previousStartDate) && isValid(currentStartDate)) {
        const cycleLength = differenceInDays(currentStartDate, previousStartDate);
        // 一般的な周期の範囲内のみを計算対象とする
        if (cycleLength >= 21 && cycleLength <= 45) {
          totalCycleDays += cycleLength;
          cycleCount++;
        }
      }
    }
    if (cycleCount > 0) {
      averageCycle = Math.round(totalCycleDays / cycleCount);
    }
  }

  // 最新の生理開始日と計算した平均周期を元に次回予定日を算出
  const nextPredictedDate = addDays(lastStartDate, averageCycle);

  return {
    averageCycle,
    nextPredictedDate: nextPredictedDate.toISOString(),
  };
};