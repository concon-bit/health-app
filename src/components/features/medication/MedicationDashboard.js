// src/components/features/medication/MedicationDashboard.js

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MedicationForm from './MedicationForm';
import TodaysMedication from './TodaysMedication';
import MedicationCalendarView from './MedicationCalendarView';
import { FaPlus, FaPills, FaEdit, FaTrashAlt, FaCalendarAlt } from 'react-icons/fa';
import styles from './MedicationDashboard.module.css';
import { deleteMedication, fetchDoseHistory, logDose } from '../../../redux/medicationSlice';
import { toggleMedicationCalendar } from '../../../redux/uiSlice';
import { format } from 'date-fns';
import { isPastDue } from '../../../utils/timeUtils';

const MedicationDashboard = () => {
  const dispatch = useDispatch();
  const { items: medications, history } = useSelector((state) => state.medications);
  const userId = useSelector((state) => state.user.currentUser ? state.user.currentUser.uid : null);
  const showCalendar = useSelector((state) => state.ui.showMedicationCalendar);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState(null);

  useEffect(() => {
    if (userId) {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      dispatch(fetchDoseHistory({ userId, date: todayStr }));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId) return;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const lastCheck = sessionStorage.getItem('medicationCheckTime');
    if (lastCheck === todayStr) return;

    const dosesToCheck = [];
    medications.forEach(med => {
      if (med.timings) {
        med.timings.forEach(timing => {
          if (timing === 'as_needed' || timing === 'before_bed') return;
          const record = history.find(h => h.medicationId === med.id && h.date === todayStr && h.timing === timing);
          if (!record && isPastDue(timing)) {
            dosesToCheck.push({ medicationId: med.id, date: todayStr, timing: timing, status: 'skipped' });
          }
        });
      }
    });

    if (dosesToCheck.length > 0) {
      dosesToCheck.forEach(dose => dispatch(logDose(dose)));
      console.log(`${dosesToCheck.length}件の飲み忘れを自動記録しました。`);
    }
    sessionStorage.setItem('medicationCheckTime', todayStr);
  }, [medications, history, dispatch, userId]);

  const handleAddNew = () => { setMedicationToEdit(null); setIsFormOpen(true); };
  const handleEdit = (med) => { setMedicationToEdit(med); setIsFormOpen(true); };
  const handleCloseForm = () => { setIsFormOpen(false); setMedicationToEdit(null); };
  const handleDelete = (id) => { if (window.confirm('このお薬を削除してもよろしいですか？')) { dispatch(deleteMedication(id)); } };

  if (showCalendar) {
    return <MedicationCalendarView onBack={() => dispatch(toggleMedicationCalendar())} />;
  }
  
  return (
    <div className={styles.container}>
      {isFormOpen && <MedicationForm onClose={handleCloseForm} medicationToEdit={medicationToEdit} />}
      <TodaysMedication />
      
      <div className={styles.viewToggleContainer}>
        <button onClick={() => dispatch(toggleMedicationCalendar())}>
          <FaCalendarAlt />
          <span>服薬カレンダーを見る</span>
        </button>
      </div>

      <header className={styles.header}>
        <h2>お薬リスト</h2>
        <button className={styles.addButton} onClick={handleAddNew}>
          <FaPlus /><span>お薬を追加</span>
        </button>
      </header>
      <div className={styles.medicationList}>
        {medications.length === 0 && (
          <div className={styles.emptyState}>
            <FaPills /><p>まだお薬が登録されていません。</p>
            <span>右上のボタンから追加してください。</span>
          </div>
        )}
        {medications.map(med => (
          <div key={med.id} className={styles.medicationCard}>
            <div className={styles.cardContent}>
              <div className={styles.medNameWrapper}>
                <h3 className={styles.medName}>{med.name}</h3>
                <p className={styles.medQuantity}>{med.quantity} {med.unit}</p>
              </div>
              <div className={styles.medTimings}>
                {med.timings && med.timings.includes('morning') && <span className={styles.timingTag}>朝</span>}
                {med.timings && med.timings.includes('noon') && <span className={styles.timingTag}>昼</span>}
                {med.timings && med.timings.includes('night') && <span className={styles.timingTag}>夜</span>}
                {med.timings && med.timings.includes('before_bed') && <span className={styles.timingTag}>就寝前</span>}
                {med.timings && med.timings.includes('as_needed') && <span className={styles.timingTag}>頓服</span>}
              </div>
              {med.memo && <p className={styles.medMemo}>{med.memo}</p>}
            </div>
            <div className={styles.cardActions}>
              <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => handleEdit(med)} title="編集"><FaEdit /></button>
              <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDelete(med.id)} title="削除"><FaTrashAlt /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationDashboard;