// src/components/features/medication/MedicationCalendarView.js

import React, { useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import jaLocale from '@fullcalendar/core/locales/ja';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMonthDoseHistory } from '../../../redux/medicationSlice';
import { FaCapsules, FaExclamationTriangle } from 'react-icons/fa';
import styles from './MedicationCalendar.module.css';

const MedicationCalendarView = ({ onBack }) => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.currentUser.uid);
  const { monthlyHistory, monthlyHistoryLoading, items: medications } = useSelector((state) => state.medications);

  useEffect(() => {
    if (userId) {
      dispatch(fetchMonthDoseHistory({ userId, date: new Date().toISOString() }));
    }
  }, [dispatch, userId]);

  const handleDatesSet = (dateInfo) => {
    if (userId) {
      dispatch(fetchMonthDoseHistory({ userId, date: dateInfo.startStr }));
    }
  };

  const calendarEvents = useMemo(() => {
    const scheduledDosesCount = medications.reduce((count, med) => {
        if (med.timings) {
            return count + med.timings.filter(t => t !== 'as_needed').length;
        }
        return count;
    }, 0);

    if (scheduledDosesCount === 0) return [];
    
    const eventsByDate = {};
    monthlyHistory.forEach(record => {
        if (!eventsByDate[record.date]) {
            eventsByDate[record.date] = { takenCount: 0, skipped: false };
        }
        if (record.status === 'taken') {
            eventsByDate[record.date].takenCount++;
        }
        if (record.status === 'skipped') {
            eventsByDate[record.date].skipped = true;
        }
    });
    
    return Object.entries(eventsByDate).map(([date, data]) => {
        let iconType = 'unknown';
        if (data.skipped || data.takenCount < scheduledDosesCount) {
            iconType = 'skipped';
        } else if (data.takenCount >= scheduledDosesCount) {
            iconType = 'taken';
        }
        if (iconType !== 'unknown') {
            return { date, extendedProps: { iconType }, className: 'calendar-event' };
        }
        return null;
    }).filter(Boolean);
  }, [monthlyHistory, medications]);

  const renderEventContent = (eventInfo) => {
    const { iconType } = eventInfo.event.extendedProps;
    if (iconType === 'taken') {
        return <div className="calendar-event-icons"><FaCapsules className={styles.takenIcon} title="服薬済み" /></div>;
    }
    if (iconType === 'skipped') {
        return <div className="calendar-event-icons"><FaExclamationTriangle className={styles.skippedIcon} title="飲み忘れ/記録なし" /></div>;
    }
    return null;
  };

  const dayCellContent = (arg) => {
    return arg.dayNumberText.replace('日', '');
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <h3>服薬カレンダー</h3>
        <button onClick={onBack}>リストに戻る</button>
      </div>
      <div className={`${styles.calendarWrapper} ${monthlyHistoryLoading === 'pending' ? styles.loading : ''}`}>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          events={calendarEvents}
          eventContent={renderEventContent}
          dayCellContent={dayCellContent}
          datesSet={handleDatesSet}
          headerToolbar={{
            left: 'prev',
            center: 'title',
            right: 'next'
          }}
          height="auto"
          aspectRatio={1.5}
        />
      </div>
      <div className={styles.legend}>
        <div><FaCapsules className={styles.takenIcon} /> 服薬済み</div>
        <div><FaExclamationTriangle className={styles.skippedIcon} /> 飲み忘れ/記録なし</div>
      </div>
    </div>
  );
};

export default MedicationCalendarView;