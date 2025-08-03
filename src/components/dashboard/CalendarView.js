// src/components/dashboard/CalendarView.js

import React, { useMemo } from 'react';
import { useLogs } from '../../contexts/LogContext';
import { ja } from 'date-fns/locale';
// react-iconsから使用するアイコンをインポート
import { FaRegSmile, FaRegMeh, FaRegFrown } from 'react-icons/fa';
import { BsFillCircleFill } from "react-icons/bs";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";

import styles from '../../styles/CalendarView.module.css';

const CalendarView = ({ setSelectedDate, setActiveTab }) => {
    const { logs } = useLogs();

    const calendarEvents = useMemo(() => {
        if (!logs) return [];
        return logs
            .filter(log => log.isPooped === 'yes' || log.mood)
            .map(log => ({
                date: log.date,
                className: 'calendar-event',
                extendedProps: { // レンダリング用のデータを渡す
                    isPooped: log.isPooped === 'yes',
                    mood: log.mood
                }
            }));
    }, [logs]);

    // アイコンをレンダリングする関数
    const renderEventContent = (eventInfo) => {
        const { isPooped, mood } = eventInfo.event.extendedProps;

        const moodIcons = {
            '絶好調': <FaRegSmile style={{ color: '#ef476f' }} />,
            '好調':    <FaRegSmile style={{ color: '#f7a325' }} />,
            '普通':    <FaRegMeh   style={{ color: '#a3a3a3' }} />,
            '不調':    <FaRegFrown style={{ color: '#577399' }} />,
            '絶不調':  <FaRegFrown style={{ color: '#2d3142' }} />
        };

        return (
            <div className="calendar-event-icons">
                {isPooped && <BsFillCircleFill style={{ color: '#8B4513' }} />}
                {mood && moodIcons[mood]}
            </div>
        );
    };

    const handleDateClick = (clickInfo) => {
        setSelectedDate(clickInfo.date);
        setActiveTab('log');
    };

    const dayCellContent = (arg) => {
        return arg.dayNumberText.replace('日', '');
    };

    return (
        <div className={styles.calendarContainer}>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={ja}
                events={calendarEvents}
                dateClick={handleDateClick}
                dayCellContent={dayCellContent}
                eventContent={renderEventContent} // レンダリング関数を渡す
                headerToolbar={false}
                height="auto"
                contentHeight="auto"
                aspectRatio={1.3}
            />
            <p className={styles.instruction}>日付をクリックすると、その日の記録ページに移動します。</p>
        </div>
    );
};

export default CalendarView;