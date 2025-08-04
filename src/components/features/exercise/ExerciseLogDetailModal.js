// src/components/features/exercise/ExerciseLogDetailModal.js

import React from 'react';
import { format } from 'date-fns';
import { FaDumbbell, FaRunning, FaHeartbeat } from 'react-icons/fa';
import styles from './ExerciseLogDetailModal.module.css';

const ExerciseLogDetailModal = ({ logData, onClose }) => {
  if (!logData || !logData.logs) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h3>{format(new Date(logData.date + 'T00:00:00'), 'yyyy年M月d日')} の記録</h3>
        
        {logData.logs.map(log => (
          <div key={log.id} className={styles.logItem}>
            <div className={styles.logHeader}>
              {log.type === 'strength' && <FaDumbbell />}
              {log.type === 'cardio' && <FaRunning />}
              {log.type === 'yoga' && <FaHeartbeat />}
              <span>{log.name || '名称未設定'}</span>
            </div>
            {log.type === 'strength' && (
              <ul className={styles.setList}>
                {log.sets.map((set, index) => (
                  <li key={index}>
                    {index + 1} set: {set.weight || '-'} kg × {set.reps || '-'} 回
                  </li>
                ))}
              </ul>
            )}
            {(log.type === 'cardio' || log.type === 'yoga') && (
              <p className={styles.detailText}>
                {log.duration || '-'} 分 {log.type === 'cardio' && ` / ${log.distance || '-'} km`}
              </p>
            )}
          </div>
        ))}
        {logData.logs.length === 0 && <p>この日の運動記録はありません。</p>}
      </div>
    </div>
  );
};

export default ExerciseLogDetailModal;