// src/components/features/profile/DatePicker.js

import React from 'react';
import styles from './ProfileDashboard.module.css';

const DatePicker = ({ value, onChange }) => {
  const [year, month, day] = value ? value.split('-') : ['', '', ''];

  const handleDateChange = (part, val) => {
    let newYear = year || '1990';
    let newMonth = month || '01';
    let newDay = day || '01';

    if (part === 'year') newYear = val;
    if (part === 'month') newMonth = val;
    if (part === 'day') newDay = val;

    onChange({
      target: {
        name: 'birthdate',
        value: `${newYear}-${newMonth}-${newDay}`,
      },
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className={styles.datePickerContainer}>
      <select value={year} onChange={(e) => handleDateChange('year', e.target.value)}>
        <option value="">年</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month} onChange={(e) => handleDateChange('month', e.target.value.padStart(2, '0'))}>
        <option value="">月</option>
        {months.map(m => <option key={m} value={String(m).padStart(2, '0')}>{m}</option>)}
      </select>
      <select value={day} onChange={(e) => handleDateChange('day', e.target.value.padStart(2, '0'))}>
        <option value="">日</option>
        {days.map(d => <option key={d} value={String(d).padStart(2, '0')}>{d}</option>)}
      </select>
    </div>
  );
};

export default DatePicker;