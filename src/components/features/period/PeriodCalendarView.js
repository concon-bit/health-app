// src/components/features/period/PeriodCalendarView.js

import React, { useMemo, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import jaLocale from '@fullcalendar/core/locales/ja';
import { useSelector } from 'react-redux';
import { addDays, format, isWithinInterval, startOfToday, parseISO, isValid } from 'date-fns';
import PeriodDetailModal from './PeriodDetailModal';
import styles from './PeriodCalendar.module.css';
import { FaMoon, FaRegCircle } from 'react-icons/fa'; // FaPencilAltを削除

const PeriodCalendarView = () => {
  const { records, cycleInfo, ongoingPeriodStartDate } = useSelector((state) => state.period);
  const [modalDate, setModalDate] = useState(null);

  const handleDateClick = (clickInfo) => {
    setModalDate(clickInfo.date);
  };
  
  // 日付から「日」を削除するための関数
  const dayCellContent = (arg) => {
    return arg.dayNumberText.replace('日', '');
  };

  // events方式で、月のアイコンと排卵日のアイコンのみを生成
  const calendarEvents = useMemo(() => {
    const events = [];
    const today = startOfToday();
    
    // 記録済みの生理日をイベントとして追加
    records.forEach(record => {
      const start = parseISO(record.startDate);
      const end = parseISO(record.endDate);
      if (isValid(start) && isValid(end)) {
        let currentDate = new Date(start);
        while (currentDate <= end) {
          events.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            extendedProps: { iconType: 'period' },
            className: 'calendar-event'
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });

    // 進行中の生理日をイベントとして追加
    if (ongoingPeriodStartDate) {
      const start = parseISO(ongoingPeriodStartDate);
      if (isValid(start)) {
        let currentDate = new Date(start);
        while (currentDate <= today) {
           events.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            extendedProps: { iconType: 'period' },
            className: 'calendar-event'
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    }

    // 排卵予測日をイベントとして追加
    if (cycleInfo.nextPredictedDate) {
      const predictedStart = parseISO(cycleInfo.nextPredictedDate);
      if (isValid(predictedStart)) {
          const ovulationDay = addDays(predictedStart, -14);
          events.push({
            date: format(ovulationDay, 'yyyy-MM-dd'),
            extendedProps: { iconType: 'ovulation' },
            className: 'calendar-event'
          });
      }
    }

    // 鉛筆アイコンのロジックはここで完全に削除

    return events;
  }, [records, cycleInfo, ongoingPeriodStartDate]);

  // renderEventContentから鉛筆アイコンの描画ロジックを削除
  const renderEventContent = (eventInfo) => {
    const { iconType } = eventInfo.event.extendedProps;
    let icon = null;
    if (iconType === 'period') icon = <FaMoon className={styles.periodIcon} />;
    if (iconType === 'ovulation') icon = <FaRegCircle className={styles.ovulationIcon} />;
    
    if (!icon) return null;

    return (
        <div className="calendar-event-icons">
            {icon}
        </div>
    );
  };
  
  const dayCellClassNames = useCallback((arg) => {
    const today = startOfToday();
    const classNames = [];
    const date = arg.date;

    for (const record of records) {
      const start = parseISO(record.startDate);
      const end = parseISO(record.endDate);
      if (isValid(start) && isValid(end) && isWithinInterval(date, { start, end })) {
        classNames.push('day-period-bg');
        break;
      }
    }

    if (ongoingPeriodStartDate) {
        const start = parseISO(ongoingPeriodStartDate);
        if(isValid(start) && isWithinInterval(date, {start, end: today})) {
            if(!classNames.includes('day-period-bg')) {
                classNames.push('day-period-bg');
            }
        }
    }

    if (cycleInfo.nextPredictedDate) {
      const predictedStart = parseISO(cycleInfo.nextPredictedDate);
      if (isValid(predictedStart)) {
        const ovulationDay = addDays(predictedStart, -14);
        const fertileStart = addDays(ovulationDay, -5);
        const fertileEnd = addDays(ovulationDay, 1);
        if(isWithinInterval(date, { start: fertileStart, end: fertileEnd })) {
            classNames.push('day-fertile-bg');
        }
        const predictedEnd = addDays(predictedStart, 4);
        if (isWithinInterval(date, { start: predictedStart, end: predictedEnd })) {
          classNames.push('day-predicted-period-bg');
        }
      }
    }
    return classNames;
  }, [records, ongoingPeriodStartDate, cycleInfo]);

  return (
    <div className={styles.calendarPageContainer}>
      {modalDate && <PeriodDetailModal date={modalDate} onClose={() => setModalDate(null)} />}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={jaLocale}
        dayCellClassNames={dayCellClassNames}
        dayCellContent={dayCellContent}
        events={calendarEvents}
        eventContent={renderEventContent}
        dateClick={handleDateClick}
        height="auto"
        aspectRatio={1.5}
        headerToolbar={{
            left: 'prev',
            center: 'title',
            right: 'next'
        }}
        showNonCurrentDates={false}
      />
    </div>
  );
};

export default PeriodCalendarView;