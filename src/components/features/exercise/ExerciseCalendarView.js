// src/components/features/exercise/ExerciseCalendarView.js

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from '@fullcalendar/core/locales/ja';
import { FaDumbbell } from 'react-icons/fa';
import { fetchAllExerciseLogs } from '../../../redux/exerciseSlice';
import { toggleExerciseCalendar } from '../../../redux/uiSlice';
import styles from './ExerciseCalendar.module.css';
import ExerciseLogDetailModal from './ExerciseLogDetailModal';

const ExerciseCalendarView = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.currentUser?.uid);
  const allLogs = useSelector(state => state.exercise.allItems);
  const [selectedLogData, setSelectedLogData] = useState(null);

  useEffect(() => {
    if (userId && allLogs.length === 0) {
      dispatch(fetchAllExerciseLogs(userId));
    }
  }, [userId, dispatch, allLogs.length]);

  const calendarEvents = useMemo(() => {
    return allLogs
      .filter(dayLog => dayLog.logs && dayLog.logs.length > 0)
      .map(dayLog => ({
        date: dayLog.date,
        className: 'calendar-event',
        extendedProps: { logData: dayLog }
      }));
  }, [allLogs]);
  
  const renderEventContent = () => (
    <div className="calendar-event-icons">
      <FaDumbbell className={styles.exerciseIcon} />
    </div>
  );

  const handleDateClick = (clickInfo) => {
    const logForDate = clickInfo.event 
      ? clickInfo.event.extendedProps.logData 
      : allLogs.find(log => log.date === clickInfo.dateStr);
    setSelectedLogData(logForDate || { date: clickInfo.dateStr, logs: [] });
  };

  const dayCellContent = (arg) => arg.dayNumberText.replace('日', '');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>運動カレンダー</h3>
        <button onClick={() => dispatch(toggleExerciseCalendar())}>リストに戻る</button>
      </div>
      <div className={styles.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          events={calendarEvents}
          eventContent={renderEventContent}
          dayCellContent={dayCellContent}
          dateClick={handleDateClick}
          eventClick={(info) => handleDateClick(info)}
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
          height="auto"
          aspectRatio={1.5}
        />
      </div>
      {selectedLogData && <ExerciseLogDetailModal logData={selectedLogData} onClose={() => setSelectedLogData(null)} />}
    </div>
  );
};

export default ExerciseCalendarView;