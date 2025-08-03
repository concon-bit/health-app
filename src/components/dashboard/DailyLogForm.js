// src/components/dashboard/DailyLogForm.js

import React, { useState, useEffect, useMemo } from 'react';
import { useLogs } from '../../contexts/LogContext';
import { format } from 'date-fns';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
// [修正] SYMPTOM_OPTIONS をインポート
import { MOOD_OPTIONS, POOP_OPTIONS, SYMPTOM_OPTIONS } from '../../constants/appConstants';
import styles from '../../styles/DailyLogForm.module.css';

const DailyLogForm = ({ selectedDate }) => {
  const { logs, saveLog, loading } = useLogs();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSubItems, setShowSubItems] = useState(false);

  const initialFormState = useMemo(() => ({
    temp: 36.5,
    isPooped: null,
    mood: '',
    memo: '',
    waterIntake: 1500,
    medication: {
      morning: false,
      noon: false,
      night: false,
    },
    // [修正] tags を symptoms に変更。オブジェクト形式で管理
    symptoms: {},
  }), []);

  const [formData, setFormData] = useState(initialFormState);

  const dateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);

  useEffect(() => {
    const logForDate = logs.find(log => log.date === dateStr);
    if (logForDate) {
      setFormData({
        ...initialFormState,
        ...logForDate,
        temp: logForDate.temp !== undefined ? parseFloat(logForDate.temp) : 36.5,
        waterIntake: logForDate.waterIntake !== undefined ? logForDate.waterIntake : 1500,
        medication: logForDate.medication || initialFormState.medication,
        // [修正] 過去の症状記録も読み込む
        symptoms: logForDate.symptoms || {},
      });
    } else {
      setFormData(initialFormState);
    }
    setShowSuccess(false);
    setShowSubItems(false);
  }, [dateStr, logs, initialFormState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showSuccess) return;

    const logToSave = {
        date: dateStr,
        ...formData
    };
    const success = await saveLog(logToSave);

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }
  };

  const handleSliderChange = (val) => {
    if (typeof val === 'number') {
      setFormData(prev => ({ ...prev, temp: val }));
    }
  };

  const handleWaterSliderChange = (val) => {
    if (typeof val === 'number') {
      setFormData(prev => ({ ...prev, waterIntake: val }));
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>{format(selectedDate, 'yyyy年M月d日')} の記録</h3>
      <form onSubmit={handleSubmit}>

        {/* (体温、水分量、体調、排便のセクションは変更なし) */}
        <div className={styles.formGroup}>
          <div className={styles.tempLabel}>体温</div>
          <div className={styles.tempContainer}><div className={styles.tempDisplay}>{typeof formData.temp === 'number' ? formData.temp.toFixed(1) : '...'}<span>°C</span></div><Slider min={35.0} max={42.0} step={0.1} value={formData.temp} onChange={handleSliderChange} trackStyle={{ backgroundColor: '#fecdd3' }} handleStyle={{ borderColor: '#ef476f', backgroundColor: '#ef476f', boxShadow: 'none' }} railStyle={{ backgroundColor: '#e5e7eb' }} /></div>
        </div>
        <div className={styles.formGroup}>
          <div className={styles.tempLabel}>水分摂取量</div>
          <div className={styles.tempContainer}><div className={styles.tempDisplay}>{formData.waterIntake}<span>ml</span></div><Slider min={0} max={4000} step={100} value={formData.waterIntake} onChange={handleWaterSliderChange} trackStyle={{ backgroundColor: '#bae6fd' }} handleStyle={{ borderColor: '#38bdf8', backgroundColor: '#38bdf8', boxShadow: 'none' }} railStyle={{ backgroundColor: '#e5e7eb' }} /></div>
        </div>
        <div className={styles.formGroup}>
          <label>今日の体調</label>
          <div className={styles.buttonGroup}>{Object.entries(MOOD_OPTIONS).map(([moodValue, icon]) => (<button key={moodValue} type="button" className={`${styles.iconButton} ${formData.mood === moodValue ? styles.selected : ''}`} onClick={() => setFormData(prev => ({ ...prev, mood: moodValue }))}><span className={styles.buttonIcon}>{icon}</span><span className={styles.buttonLabel}>{moodValue}</span></button>))}</div>
        </div>
        <div className={styles.formGroup}>
          <label>排便</label>
          <div className={styles.buttonGroup}>{Object.entries(POOP_OPTIONS).map(([poopValue, icon]) => (<button key={poopValue} type="button" className={`${styles.iconButton} ${styles.poopButton} ${formData.isPooped === (poopValue === 'あり' ? 'yes' : 'no') ? styles.selected : ''}`} onClick={() => setFormData(prev => ({ ...prev, isPooped: (poopValue === 'あり' ? 'yes' : 'no') }))}><span className={styles.buttonIcon}>{icon}</span><span className={styles.buttonLabel}>{poopValue}</span></button>))}</div>
        </div>

        <div className={styles.subSection}>
          <button type="button" className={styles.toggleButton} onClick={() => setShowSubItems(!showSubItems)}>その他項目を記録する {showSubItems ? '▲' : '▼'}</button>
          {showSubItems && (
            <div className={styles.subContent}>
              <div className={styles.formGroup}>
                <label>服薬記録</label>
                <div className={styles.buttonGroup}>{['morning', 'noon', 'night'].map((time) => (<button key={time} type="button" className={`${styles.iconButton} ${formData.medication?.[time] ? styles.selected : ''}`} onClick={() => setFormData((prev) => ({ ...prev, medication: { ...prev.medication, [time]: !prev.medication?.[time], }, }))}><span className={styles.buttonLabel} style={{ marginTop: 0 }}>{time === 'morning' ? '朝' : time === 'noon' ? '昼' : '夜'}</span></button>))}</div>
              </div>

              {/* --- [ここから修正] 症状・アクティビティ選択ボタン --- */}
              <div className={styles.formGroup}>
                <label>症状・アクティビティ</label>
                <div className={styles.buttonGroup}>
                  {Object.entries(SYMPTOM_OPTIONS).map(([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      className={`${styles.iconButton} ${formData.symptoms?.[key] ? styles.selected : ''}`}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          symptoms: {
                            ...prev.symptoms,
                            [key]: !prev.symptoms?.[key],
                          },
                        }))
                      }
                    >
                      <span className={styles.buttonLabel} style={{ marginTop: 0 }}>{value}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* --- [ここまで修正] --- */}

            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label>メモ</label>
          <textarea name="memo" placeholder="その他、気になる症状など" value={formData.memo || ''} onChange={(e) => setFormData(prev => ({...prev, memo: e.target.value}))} rows="3"></textarea>
        </div>
        <button type="submit" className={`${styles.saveButton} ${showSuccess ? styles.success : ''}`} disabled={loading || showSuccess}>
          {loading ? '保存中...' : (showSuccess ? '保存しました ✔' : '記録・更新')}
        </button>
      </form>
    </div>
  );
};

export default DailyLogForm;