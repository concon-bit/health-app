import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // カレンダーのデフォルトスタイル

function CalendarView({ logs, selectedDate, setSelectedDate }) {
  // 記録がある日付に印をつけるための関数
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      if (logs.find(log => log.date === dateStr)) {
        return 'highlight'; // CSSでスタイルを当てるためのクラス名
      }
    }
    return null;
  };

  return (
    <Calendar
      onChange={setSelectedDate}
      value={selectedDate}
      tileClassName={tileClassName}
      locale="ja-JP" // 日本語化
    />
  );
}

export default CalendarView;