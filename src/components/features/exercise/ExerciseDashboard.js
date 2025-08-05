// src/components/features/exercise/ExerciseDashboard.js

import React, { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { FaPlus, FaTrash, FaDumbbell, FaRunning, FaHeartbeat, FaChevronLeft, FaChevronRight, FaFire, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import styles from './ExerciseDashboard.module.css';
import { calculateCaloriesBurned } from '../../../utils/calorieUtils';
import { useSelector, useDispatch } from 'react-redux';
import { fetchExerciseLogs, saveExerciseLogs } from '../../../redux/exerciseSlice';
import { toggleExerciseCalendar, toggleExerciseChart } from '../../../redux/uiSlice';
import { STRENGTH_EXERCISES, CARDIO_EXERCISES } from '../../../constants/exerciseConstants';
import ExerciseCalendarView from './ExerciseCalendarView';
import ExerciseChartView from './ExerciseChartView';

const ExerciseDashboard = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const userId = useSelector(state => state.user.currentUser?.uid);
  const userWeight = useSelector(state => state.user.profile?.weight);
  const logs = useSelector(state => state.exercise.items);
  const loading = useSelector(state => state.exercise.loading);
  const showCalendar = useSelector(state => state.ui.showExerciseCalendar);
  const showChart = useSelector(state => state.ui.showExerciseChart);
  
  useEffect(() => {
    if (userId && !showCalendar && !showChart) {
      dispatch(fetchExerciseLogs({ userId, date: selectedDate }));
    }
  }, [selectedDate, userId, dispatch, showCalendar, showChart]);

  const updateAndSaveLogs = (newLogs) => {
    const logsWithCalories = newLogs.map(log => {
      let calories = 0;
      const weight = parseFloat(userWeight);
      if (weight) {
        if (log.type === 'strength') {
          const estimatedDuration = log.sets.length * 2;
          if (estimatedDuration > 0) {
            calories = calculateCaloriesBurned('strength_general', estimatedDuration, weight);
          }
        } else {
          const duration = parseFloat(log.duration);
          if (duration) {
            let metKey = '';
            if (log.type === 'cardio') metKey = 'running_slow';
            else if (log.type === 'yoga') metKey = 'yoga';
            if (metKey) {
              calories = calculateCaloriesBurned(metKey, duration, weight);
            }
          }
        }
      }
      return { ...log, calories };
    });
    dispatch(saveExerciseLogs({ userId, date: selectedDate, logs: logsWithCalories }));
  };
  
  const handleLogChange = (index, field, value) => {
    const newLogs = logs.map((log, i) => i === index ? { ...log, [field]: value } : log);
    updateAndSaveLogs(newLogs);
  };
  
  const handleSetChange = (exIndex, setIndex, field, value) => {
    const newLogs = [...logs];
    const newSets = newLogs[exIndex].sets.map((set, i) => i === setIndex ? { ...set, [field]: value } : set);
    newLogs[exIndex] = { ...newLogs[exIndex], sets: newSets };
    updateAndSaveLogs(newLogs);
  };

  const addExercise = (type) => {
    const newLog = {
      id: Date.now(), type, name: '',
      sets: type === 'strength' ? [{ id: Date.now(), reps: '', weight: '' }] : [],
      duration: '', distance: '', calories: 0,
    };
    if (type === 'yoga') newLog.name = 'ヨガ・ストレッチ';
    updateAndSaveLogs([...logs, newLog]);
  };
  
  const removeExercise = (id) => {
    updateAndSaveLogs(logs.filter(log => log.id !== id));
  };
  
  const addSet = (exIndex) => {
    const newLogs = [...logs];
    const newSets = [...newLogs[exIndex].sets, { id: Date.now(), reps: '', weight: '' }];
    newLogs[exIndex] = { ...newLogs[exIndex], sets: newSets };
    updateAndSaveLogs(newLogs);
  };

  const removeSet = (exIndex, setId) => {
    const newLogs = [...logs];
    const newSets = newLogs[exIndex].sets.filter(set => set.id !== setId);
    newLogs[exIndex] = { ...newLogs[exIndex], sets: newSets };
    updateAndSaveLogs(newLogs);
  };

  const totalCalories = useMemo(() => Math.round(logs.reduce((sum, log) => sum + (log.calories || 0), 0)), [logs]);
  
  const changeDate = (amount) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + amount);
      return newDate;
    });
  };

  const renderLogCard = (log, exIndex) => (
    <div key={log.id} className={styles.exerciseCard}>
      <div className={styles.cardHeader}>
        {log.type === 'strength' && <FaDumbbell className={styles.cardIcon} />}
        {log.type === 'cardio' && <FaRunning className={styles.cardIcon} />}
        {log.type === 'yoga' && <FaHeartbeat className={styles.cardIcon} />}
        <input 
          type="text" 
          value={log.name} 
          onChange={(e) => handleLogChange(exIndex, 'name', e.target.value)} 
          className={styles.exerciseNameInput}
          placeholder="種目名を選択または入力"
          list={log.type === 'strength' ? "strength-exercises" : "cardio-exercises"}
        />
        <button onClick={() => removeExercise(log.id)} className={styles.deleteExerciseButton} title="種目を削除"><FaTrash /></button>
      </div>
      <div className={styles.cardBody}>
        {log.type === 'strength' && (
          <>
            <table className={styles.setTable}>
              <thead><tr><th>セット</th><th>重量 (kg)</th><th>回数</th><th></th></tr></thead>
              <tbody>
                {log.sets.map((set, setIndex) => (
                  <tr key={set.id}>
                    <td>{setIndex + 1}</td>
                    <td><input type="number" value={set.weight} onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', e.target.value)} className={styles.setInput} placeholder="60" /></td>
                    <td><input type="number" value={set.reps} onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', e.target.value)} className={styles.setInput} placeholder="10" /></td>
                    <td><button onClick={() => removeSet(exIndex, set.id)} className={styles.deleteSetButton} title="セットを削除"><FaTrash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => addSet(exIndex)} className={styles.addSetButton}><FaPlus /> セットを追加</button>
          </>
        )}
        {(log.type === 'cardio' || log.type === 'yoga') && (
          <div className={styles.inputGroup}>
            <div className={styles.inputField}><label>時間</label><input type="number" value={log.duration} onChange={(e) => handleLogChange(exIndex, 'duration', e.target.value)} placeholder="30" /><span>分</span></div>
            {log.type === 'cardio' && <div className={styles.inputField}><label>距離</label><input type="number" value={log.distance} onChange={(e) => handleLogChange(exIndex, 'distance', e.target.value)} placeholder="5" /><span>km</span></div>}
          </div>
        )}
      </div>
    </div>
  );

  if (showCalendar) { return <ExerciseCalendarView />; }
  if (showChart) { return <ExerciseChartView />; }

  return (
    <div className={styles.container}>
      <datalist id="strength-exercises">{STRENGTH_EXERCISES.map(name => <option key={name} value={name} />)}</datalist>
      <datalist id="cardio-exercises">{CARDIO_EXERCISES.map(name => <option key={name} value={name} />)}</datalist>
      
      <div className={styles.header}>
        <div className={styles.dateNavigator}>
          <button onClick={() => changeDate(-1)}><FaChevronLeft /></button>
          <h3>{format(selectedDate, 'M月d日')}</h3>
          <button onClick={() => changeDate(1)}><FaChevronRight /></button>
        </div>
        <div className={styles.viewToggles}>
          <button onClick={() => dispatch(toggleExerciseCalendar())}><FaCalendarAlt /></button>
          <button onClick={() => dispatch(toggleExerciseChart())}><FaChartLine /></button>
        </div>
      </div>

      {/* ▼▼▼ ここから修正 ▼▼▼ */}
      <div className={styles.summary}>
        <FaFire />
        <span>総消費カロリー (目安)</span>
        <strong>{totalCalories}</strong>
        <span>&nbsp;キロカロリー</span>
      </div>
      {/* ▲▲▲ ここまで修正 ▲▲▲ */}

      <div className={styles.logList}>
        {loading === 'pending' && <p className={styles.emptyState}>読み込み中...</p>}
        {loading !== 'pending' && logs.length > 0 && logs.map((log, index) => renderLogCard(log, index))}
        {loading !== 'pending' && logs.length === 0 && <p className={styles.emptyState}>下のメニューから運動を追加してください。</p>}
      </div>
      <div className={styles.menuContainer}>
        <label>本日の運動メニュー</label>
        <div className={styles.menuGrid}>
          <button onClick={() => addExercise('strength')}><FaDumbbell /><span>筋トレ</span></button>
          <button onClick={() => addExercise('cardio')}><FaRunning /><span>有酸素運動</span></button>
          <button onClick={() => addExercise('yoga')}><FaHeartbeat /><span>ヨガ etc.</span></button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDashboard;