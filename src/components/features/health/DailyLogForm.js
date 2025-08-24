// src/components/features/health/DailyLogForm.js

import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { MOOD_OPTIONS, POOP_OPTIONS, SYMPTOM_OPTIONS, SLEEP_OPTIONS, STRESS_OPTIONS, ALCOHOL_OPTIONS } from '../../../constants/appConstants';
import { MOOD_ICONS, POOP_ICONS, SYMPTOM_ICONS, SLEEP_ICONS, STRESS_ICONS, ALCOHOL_ICONS } from '../../../constants/iconConstants';
import { FaChevronLeft, FaChevronRight, FaLock, FaLockOpen } from 'react-icons/fa';
import styles from './DailyLogForm.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { changeDateBy } from '../../../redux/uiSlice';
import { saveLog as saveLogAction } from '../../../redux/logsSlice';

const DailyLogForm = () => {
  const dispatch = useDispatch();
  const selectedDateISO = useSelector((state) => state.ui.selectedDate);
  const { items: logs, loading: logLoading } = useSelector((state) => state.logs) || { items: [] };
  const { currentUser, profile: userProfile } = useSelector((state) => state.user);
  const selectedDate = useMemo(() => new Date(selectedDateISO), [selectedDateISO]);
  const dateStr = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSubItems, setShowSubItems] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const logForDate = useMemo(() => Array.isArray(logs) ? logs.find(log => log.date === dateStr) : undefined, [logs, dateStr]);
  const logExists = !!logForDate;
  const [isLocked, setIsLocked] = useState(logExists);

  const initialFormState = useMemo(() => ({
    temp: 36.5,
    weight: userProfile.weight || 60.0,
    isPooped: null, mood: '', memo: '', waterIntake: 1500,
    symptoms: {}, 
    sleep: null, stress: null, alcohol: null,
  }), [userProfile.weight]);

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (logForDate) {
      setFormData({
        ...initialFormState, ...logForDate,
        temp: logForDate.temp !== undefined ? parseFloat(logForDate.temp) : 36.5,
        weight: logForDate.weight !== undefined ? parseFloat(logForDate.weight) : (userProfile.weight || 60.0),
        waterIntake: logForDate.waterIntake !== undefined ? logForDate.waterIntake : 1500,
      });
      setIsLocked(true);
    } else {
      setFormData(initialFormState);
      setIsLocked(false);
    }
    setShowSuccess(false);
    setShowSubItems(false);
  }, [dateStr, logForDate, initialFormState, userProfile.weight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (logExists && isLocked) {
      alert('記録はロックされています。鍵アイコンをクリックして編集モードにしてください。');
      return;
    }
    if (showSuccess) return;
    if (!formData.mood || !formData.isPooped) {
      alert('「今日の体調」と「排便」は必須項目です。');
      return;
    }
    const logToSave = { ...formData, date: dateStr, userId: currentUser.uid };
    const resultAction = await dispatch(saveLogAction(logToSave));

    if (saveLogAction.fulfilled.match(resultAction)) {
      setShowSuccess(true);
      setIsLocked(true);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleChange = (field, subField, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [subField]: value }
    }));
  };

  const handleTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    if (Math.abs(diffX) > 50) {
      dispatch(changeDateBy(diffX > 0 ? 1 : -1));
    }
    setTouchStartX(null);
  };

  const isFormDisabled = logExists && isLocked;
  const isButtonDisabled = logExists && isLocked;

  return (
    <div className={styles.formContainer} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={styles.dateNavContainer}>
        <button className={styles.dateNavButton} onClick={() => dispatch(changeDateBy(-1))}><FaChevronLeft /></button>
        <div className={styles.dateHeader}>
          <h3>{format(selectedDate, 'yyyy年M月d日')}</h3>
          {logExists && (<button className={styles.lockButton} onClick={() => setIsLocked(!isLocked)}>{isLocked ? <FaLock /> : <FaLockOpen />}</button>)}
        </div>
        <button className={styles.dateNavButton} onClick={() => dispatch(changeDateBy(1))}><FaChevronRight /></button>
      </div>
      <form id="daily-log-form" onSubmit={handleSubmit}>
        <fieldset disabled={isFormDisabled} className={styles.formFields}>
          
          <div className={styles.formGroup}>
            <div className={styles.tempLabel}>体温</div>
            <div className={styles.tempContainer}>
              <div className={styles.tempDisplay}>{typeof formData.temp === 'number' ? formData.temp.toFixed(2) : '...'}<span>°C</span></div>
              <Slider min={35.0} max={42.0} step={0.01} value={formData.temp} onChange={(val) => handleFormChange('temp', val)} trackStyle={{ backgroundColor: '#fecdd3' }} handleStyle={{ borderColor: '#ef476f' }} railStyle={{ backgroundColor: '#e5e7eb' }} />
            </div>
          </div>
          
          <div className={styles.formGroup}><label>今日の体調</label><div className={styles.buttonGroup}>{Object.entries(MOOD_OPTIONS).map(([key, label]) => (<button key={key} type="button" className={`${styles.iconButton} ${formData.mood === key ? styles.selected : ''}`} onClick={() => handleFormChange('mood', key)}><span className={styles.buttonIcon}>{MOOD_ICONS[key]}</span><span className={styles.buttonLabel}>{label}</span></button>))}</div></div>
          <div className={styles.formGroup}><label>排便</label><div className={styles.buttonGroup}>{Object.entries(POOP_OPTIONS).map(([key, label]) => (<button key={key} type="button" className={`${styles.iconButton} ${styles.poopButton} ${formData.isPooped === (key === 'あり' ? 'yes' : 'no') ? styles.selected : ''}`} onClick={() => handleFormChange('isPooped', key === 'あり' ? 'yes' : 'no')}><span className={styles.buttonIcon}>{POOP_ICONS[key]}</span><span className={styles.buttonLabel}>{label}</span></button>))}</div></div>
          
          <div className={styles.subSection}><button type="button" className={styles.toggleButton} onClick={() => setShowSubItems(!showSubItems)}>その他項目を記録する {showSubItems ? '▲' : '▼'}</button>
            {showSubItems && (
              <div className={styles.subContent}>
                <div className={styles.formGroup}>
                  <div className={styles.tempLabel}>体重</div>
                  <div className={styles.tempContainer}>
                    <div className={styles.tempDisplay}>{typeof formData.weight === 'number' ? formData.weight.toFixed(1) : '...'}<span>kg</span></div>
                    <Slider min={30.0} max={150.0} step={0.1} value={formData.weight} onChange={(val) => handleFormChange('weight', val)} trackStyle={{ backgroundColor: '#bbf7d0' }} handleStyle={{ borderColor: '#22c55e' }} railStyle={{ backgroundColor: '#e5e7eb' }} />
                  </div>
                </div>

                <div className={styles.formGroup}><label>睡眠の質</label><div className={styles.buttonGroup}>{Object.entries(SLEEP_OPTIONS).map(([key, label]) => (<button key={key} type="button" className={`${styles.iconButton} ${formData.sleep === key ? styles.selected : ''}`} onClick={() => handleFormChange('sleep', key)}><span className={styles.buttonIcon}>{SLEEP_ICONS[key]}</span><span className={styles.buttonLabel}>{label}</span></button>))}</div></div>
                <div className={styles.formGroup}><label>ストレス</label><div className={styles.buttonGroup}>{Object.entries(STRESS_OPTIONS).map(([key, label]) => (<button key={key} type="button" className={`${styles.iconButton} ${formData.stress === key ? styles.selected : ''}`} onClick={() => handleFormChange('stress', key)}><span className={styles.buttonIcon}>{STRESS_ICONS[key]}</span><span className={styles.buttonLabel}>{label}</span></button>))}</div></div>
                <div className={styles.formGroup}><label>飲酒</label><div className={styles.buttonGroup}>{Object.entries(ALCOHOL_OPTIONS).map(([key, label]) => (<button key={key} type="button" className={`${styles.iconButton} ${formData.alcohol === key ? styles.selected : ''}`} onClick={() => handleFormChange('alcohol', key)}><span className={styles.buttonIcon}>{ALCOHOL_ICONS[key]}</span><span className={styles.buttonLabel}>{label}</span></button>))}</div></div>
                <div className={styles.formGroup}><div className={styles.tempLabel}>水分摂取量</div><div className={styles.tempContainer}><div className={styles.tempDisplay}>{formData.waterIntake}<span>ml</span></div><Slider min={0} max={4000} step={100} value={formData.waterIntake} onChange={(val) => handleFormChange('waterIntake', val)} trackStyle={{ backgroundColor: '#bae6fd' }} handleStyle={{ borderColor: '#38bdf8' }} railStyle={{ backgroundColor: '#e5e7eb' }} /></div></div>
                <div className={styles.formGroup}><label>症状・アクティビティ</label><div className={styles.buttonGroup}>{Object.entries(SYMPTOM_OPTIONS).map(([key, label]) => (<button key={key} type="button" className={`${styles.iconButton} ${formData.symptoms?.[key] ? styles.selected : ''}`} onClick={() => handleToggleChange('symptoms', key, !formData.symptoms?.[key])}><span className={styles.buttonIcon}>{SYMPTOM_ICONS[key]}</span><span className={styles.buttonLabel}>{label}</span></button>))}</div></div>
              </div>)}
          </div>
          <div className={styles.formGroup}><label>メモ</label><textarea name="memo" placeholder="その他、気になる症状など" value={formData.memo || ''} onChange={(e) => handleFormChange('memo', e.target.value)} rows="3"></textarea></div>
        </fieldset>
      </form>
      <button form="daily-log-form" type="submit" className={`${styles.saveButton} ${showSuccess ? styles.success : ''}`} disabled={logLoading || showSuccess || isButtonDisabled}>
        {logLoading ? '処理中...' : (showSuccess ? '保存しました ✔' : (logExists ? '更新する' : '記録する'))}
      </button>
    </div>
  );
};

export default DailyLogForm;