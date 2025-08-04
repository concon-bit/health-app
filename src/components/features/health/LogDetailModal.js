// src/components/features/health/LogDetailModal.js

import React from 'react';
import { format } from 'date-fns';
import { MOOD_OPTIONS, SYMPTOM_OPTIONS } from '../../../constants/appConstants'; // POOP_OPTIONS を削除
import { MOOD_ICONS, POOP_ICONS } from '../../../constants/iconConstants'; // SYMPTOM_ICONS を削除
import styles from './LogDetailModal.module.css';

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  const getSymptomText = (symptoms) => {
    if (!symptoms || Object.keys(symptoms).length === 0) return '記録なし';
    return Object.entries(symptoms)
      .filter(([, value]) => value)
      .map(([key]) => SYMPTOM_OPTIONS[key])
      .join(', ') || '記録なし';
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h3>{format(new Date(log.date + 'T00:00:00'), 'yyyy年M月d日')} の記録</h3>
        <div className={styles.detailGrid}>
          <div className={styles.detailItem}><span className={styles.label}>体温</span><span className={styles.value}>{log.temp ? `${log.temp}°C` : '未記録'}</span></div>
          <div className={styles.detailItem}><span className={styles.label}>水分</span><span className={styles.value}>{log.waterIntake ? `${log.waterIntake}ml` : '未記録'}</span></div>
          <div className={styles.detailItem}><span className={styles.label}>今日の体調</span><span className={styles.value}>{log.mood && MOOD_ICONS[log.mood]}{log.mood ? MOOD_OPTIONS[log.mood] : '未記録'}</span></div>
          <div className={styles.detailItem}><span className={styles.label}>排便</span><span className={styles.value}>{log.isPooped && POOP_ICONS[log.isPooped === 'yes' ? 'あり' : 'なし']}{log.isPooped ? (log.isPooped === 'yes' ? 'あり' : 'なし') : '未記録'}</span></div>
        </div>
        <div className={styles.memoSection}><h4>症状・アクティビティ</h4><p>{getSymptomText(log.symptoms)}</p></div>
        <div className={styles.memoSection}><h4>メモ</h4><p>{log.memo || 'メモはありません'}</p></div>
      </div>
    </div>
  );
};

export default LogDetailModal;