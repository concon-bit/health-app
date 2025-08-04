// src/components/features/period/PeriodDashboard.js

import React, { useState, useMemo } from 'react';
import styles from './PeriodDashboard.module.css'; // パスを修正
import PeriodCalendarView from './PeriodCalendarView';
import PeriodDetailModal from './PeriodDetailModal';
import { useSelector, useDispatch } from 'react-redux';
import { format, differenceInDays, isAfter, addDays, isValid } from 'date-fns';
import { startPeriod, endPeriodAndLog, savePeriodLogs } from '../../../redux/periodSlice'; // パスを修正
import { FaPencilAlt } from 'react-icons/fa';

const PeriodDashboard = () => {
  const dispatch = useDispatch();
  const { cycleInfo, ongoingPeriodStartDate, records } = useSelector((state) => state.period);
  const showCalendar = useSelector((state) => state.ui.showPeriodCalendar);
  const [detailModalDate, setDetailModalDate] = useState(null);

  const daysRemaining = cycleInfo.nextPredictedDate && isValid(new Date(cycleInfo.nextPredictedDate))
    ? differenceInDays(new Date(cycleInfo.nextPredictedDate), new Date())
    : null;

  const averageDays = useMemo(() => {
    if (!records || records.length === 0) return 0;
    const totalDays = records.reduce((sum, record) => {
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
        if (isValid(startDate) && isValid(endDate)) {
          return sum + differenceInDays(endDate, startDate) + 1;
        }
        return sum;
    }, 0);
    return Math.round(totalDays / records.length);
  }, [records]);

  const handlePeriodButtonClick = () => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    if (ongoingPeriodStartDate) {
      if (isAfter(new Date(ongoingPeriodStartDate), today)) {
          alert("終了日は開始日以降に設定してください。");
          return;
      }
      dispatch(endPeriodAndLog(todayStr));
    } else {
      dispatch(startPeriod(todayStr));
    }
    dispatch(savePeriodLogs());
  };

  if (showCalendar) {
      return <PeriodCalendarView />;
  }

  return (
    <div className={styles.container}>
      {detailModalDate && <PeriodDetailModal date={detailModalDate} onClose={() => setDetailModalDate(null)} />}
      <div className={styles.summaryCard}>
        <div className={styles.summaryItem}><label>生理予定日</label><p className={styles.mainDate}>{cycleInfo.nextPredictedDate && isValid(new Date(cycleInfo.nextPredictedDate)) ? format(new Date(cycleInfo.nextPredictedDate), 'M/d') : '--'}</p><p className={styles.subText}>{daysRemaining !== null && daysRemaining >= 0 ? `あと${daysRemaining}日` : (daysRemaining !== null ? '生理中です' : '予測計算中')}</p></div>
        <div className={styles.summaryItem}><label>排卵予定日</label><p className={styles.mainDate}>{cycleInfo.nextPredictedDate && isValid(new Date(cycleInfo.nextPredictedDate)) ? format(addDays(new Date(cycleInfo.nextPredictedDate), -14), 'M/d') : '--'}</p><p className={styles.subText}>&nbsp;</p></div>
        <div className={styles.summaryItem}><label>妊娠可能性</label><div className={styles.fertilityCircle}><p>やや高い</p></div></div>
      </div>
      <div className={styles.cycleInfoBox}>
          <span>平均周期 <strong>{cycleInfo.averageCycle || '-'}</strong>日</span>
          <span>平均日数 <strong>{averageDays || '-'}</strong>日</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.logButton} onClick={handlePeriodButtonClick}>
          {ongoingPeriodStartDate ? `生理が終わった (${format(new Date(ongoingPeriodStartDate), 'M/d')} 開始)` : '生理が始まった'}
        </button>
      </div>
      <button className={styles.fab} onClick={() => setDetailModalDate(new Date())}><FaPencilAlt /><span>入力する</span></button>
    </div>
  );
};

export default PeriodDashboard;