// src/components/features/health/CalendarView.js

import React, { useState, useMemo, useCallback } from 'react';
import jaLocale from '@fullcalendar/core/locales/ja'; // <<< [修正] 正式なロケールファイルをインポート
import { MOOD_ICONS, POOP_CALENDAR_ICON } from '../../../constants/iconConstants';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import styles from './CalendarView.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveHealthTab, setSelectedDate } from '../../../redux/uiSlice';
import LogDetailModal from './LogDetailModal';

const CalendarView = () => {
    const { items: logs } = useSelector((state) => state.logs);
    const [selectedLog, setSelectedLog] = useState(null);
    const dispatch = useDispatch();

    const logsByDate = useMemo(() => {
        const map = new Map();
        if (logs) {
            logs.forEach(log => map.set(log.date, log));
        }
        return map;
    }, [logs]);

    const calendarEvents = useMemo(() => {
        if (!logs) return [];
        return logs
            .filter(log => log.isPooped === 'yes' || log.mood)
            .map(log => ({
                date: log.date, 
                className: 'calendar-event',
                extendedProps: { logData: log }
            }));
    }, [logs]);

    const renderEventContent = (eventInfo) => {
        const { isPooped, mood } = eventInfo.event.extendedProps.logData;
        return (
            <div className="calendar-event-icons">
                {isPooped && isPooped === 'yes' && POOP_CALENDAR_ICON}
                {mood && MOOD_ICONS[mood]}
            </div>
        );
    };
    
    const handleDateClick = (clickInfo) => {
        const logForDate = logsByDate.get(clickInfo.dateStr);
        if (logForDate) {
            setSelectedLog(logForDate);
        } else {
            dispatch(setSelectedDate(clickInfo.date.toISOString()));
            dispatch(setActiveHealthTab('log'));
        }
    };

    const handleCloseModal = () => {
        setSelectedLog(null);
    };
    
    const dayCellContent = (arg) => { return arg.dayNumberText.replace('日', ''); };

    const getDayCellClassNames = useCallback((arg) => {
        const log = logsByDate.get(arg.dateStr);
        if (!log || !log.mood) return [];

        switch (log.mood) {
            case '絶好調':
            case '好調':
                return ['day-bg-good'];
            case '普通':
                return ['day-bg-ok'];
            case '不調':
            case '絶不調':
                return ['day-bg-bad'];
            default:
                return [];
        }
    }, [logsByDate]);

    return (
        <div className={styles.calendarContainer}>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={jaLocale} // <<< [修正] インポートしたロケールファイルを指定
                events={calendarEvents}
                dateClick={handleDateClick}
                dayCellContent={dayCellContent}
                eventContent={renderEventContent}
                dayCellClassNames={getDayCellClassNames}
                headerToolbar={{
                    left: 'prev',
                    center: 'title',
                    right: 'next'
                }}
                height="auto"
                aspectRatio={1.5}
            />
            <p className={styles.instruction}>日付をクリックすると、詳細の確認ができます。</p>
            {selectedLog && <LogDetailModal log={selectedLog} onClose={handleCloseModal} />}
        </div>
    );
};

export default CalendarView;