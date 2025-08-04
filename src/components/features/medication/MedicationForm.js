// src/components/features/medication/MedicationForm.js

import React, { useState, useEffect } from 'react';
import styles from './MedicationForm.module.css';
import { useDispatch } from 'react-redux';
import { addMedication, updateMedication } from '../../../redux/medicationSlice';

const MedicationForm = ({ onClose, medicationToEdit }) => {
  const dispatch = useDispatch();
  const isEditMode = !!medicationToEdit;

  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '錠',
    timings: [],
    memo: '',
  });

  useEffect(() => {
    if (isEditMode && medicationToEdit) {
      setFormData({
        name: medicationToEdit.name || '',
        quantity: medicationToEdit.quantity || '',
        unit: medicationToEdit.unit || '錠',
        timings: medicationToEdit.timings || [],
        memo: medicationToEdit.memo || '',
      });
    }
  }, [isEditMode, medicationToEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTimingChange = (timing) => {
    setFormData(prev => {
      const newTimings = prev.timings.includes(timing)
        ? prev.timings.filter(t => t !== timing)
        : [...prev.timings, timing];
      return { ...prev, timings: newTimings };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.unit || formData.timings.length === 0) {
      alert('薬の名前、1回の量、単位、飲むタイミングは必須です。');
      return;
    }

    if (isEditMode) {
      dispatch(updateMedication({ id: medicationToEdit.id, medData: formData }));
    } else {
      dispatch(addMedication(formData));
    }
    
    onClose();
  };
  
  const timingOptions = {
    morning: '朝', noon: '昼', night: '夜',
    before_bed: '就寝前', as_needed: '頓服',
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <h3>{isEditMode ? 'お薬の編集' : '新しいお薬の登録'}</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="name">お薬の名前</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="例: ロキソニン" required />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">1回の量</label>
              <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="例: 2" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="unit">単位</label>
              <input type="text" id="unit" name="unit" value={formData.unit} onChange={handleInputChange} placeholder="例: 錠" required />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>飲むタイミング（複数選択可）</label>
            <div className={styles.tagGroup}>
              {Object.entries(timingOptions).map(([key, label]) => (
                <button type="button" key={key} className={`${styles.tagButton} ${formData.timings.includes(key) ? styles.selected : ''}`}
                  onClick={() => handleTimingChange(key)}>{label}</button>
              ))}
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="memo">メモ</label>
            <textarea id="memo" name="memo" value={formData.memo} onChange={handleInputChange} placeholder="食後、空腹時は避ける、など" rows="3"></textarea>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>キャンセル</button>
            <button type="submit" className={styles.saveButton}>
              {isEditMode ? '更新する' : '登録する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicationForm;