// src/components/features/period/PeriodDetailModal.js

import React, { useState } from 'react';
import styles from './PeriodDetailModal.module.css'; // パスを修正
import { useDispatch, useSelector } from 'react-redux';
import { updateDailyPeriodLog, savePeriodLogs } from '../../../redux/periodSlice'; // パスを修正
import { PERIOD_SYMPTOMS, PERIOD_MOODS, PERIOD_FLOW } from '../../../constants/periodConstants'; // パスを修正
import { format } from 'date-fns';

const PeriodDetailModal = ({ date, onClose }) => {
  const dispatch = useDispatch();
  const dateStr = format(date, 'yyyy-MM-dd');
  const existingLog = useSelector((state) => state.period.dailyLogs[dateStr]) || {};
  const [symptoms, setSymptoms] = useState(existingLog.symptoms || []);
  const [moods, setMoods] = useState(existingLog.moods || []);
  const [flow, setFlow] = useState(existingLog.flow || null);

  const handleToggle = (setter, state, value) => {
    setter(state.includes(value) ? state.filter(v => v !== value) : [...state, value]);
  };
  const handleSave = () => {
    dispatch(updateDailyPeriodLog({ date: dateStr, logData: { symptoms, moods, flow } }));
    dispatch(savePeriodLogs());
    onClose();
  };

  const renderTagGroup = (title, options, state, setter) => (
    <div className={styles.tagSection}>
      <h4>{title}</h4>
      <div className={styles.tagGroup}>
        {Object.entries(options).map(([key, label]) => (
          <button key={key} className={`${styles.tagButton} ${state.includes(key) ? styles.selected : ''}`}
            onClick={() => handleToggle(setter, state, key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderRadioGroup = (title, options, state, setter) => (
     <div className={styles.tagSection}>
      <h4>{title}</h4>
      <div className={styles.tagGroup}>
        {Object.entries(options).map(([key, label]) => (
          <button key={key} className={`${styles.tagButton} ${state === key ? styles.selected : ''}`}
            onClick={() => setter(key)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h3>{format(date, 'yyyy年M月d日')}</h3>
        {renderTagGroup("症状", PERIOD_SYMPTOMS, symptoms, setSymptoms)}
        {renderTagGroup("気分", PERIOD_MOODS, moods, setMoods)}
        {renderRadioGroup("経血量", PERIOD_FLOW, flow, setFlow)}
        <div className={styles.actions}>
          <button className={styles.saveButton} onClick={handleSave}>この日の記録を保存</button>
        </div>
      </div>
    </div>
  );
};

export default PeriodDetailModal;