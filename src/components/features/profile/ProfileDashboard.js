// src/components/features/profile/ProfileDashboard.js

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveProfile } from '../../../redux/userSlice';
import styles from './ProfileDashboard.module.css';
import { differenceInYears, parseISO, isValid } from 'date-fns';
import DatePicker from './DatePicker';

const ProfileDashboard = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user.currentUser?.uid);
  const userProfile = useSelector(state => state.user.profile);
  
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    gender: '',
    birthdate: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setFormData({
      height: userProfile.height || '',
      weight: userProfile.weight || '',
      gender: userProfile.gender || '',
      birthdate: userProfile.birthdate || '',
    });
  }, [userProfile]);
  
  const age = useMemo(() => {
    if (!formData.birthdate) return null;
    const date = parseISO(formData.birthdate);
    if (!isValid(date) || formData.birthdate.split('-').length < 3) return null;
    try {
      return differenceInYears(new Date(), date);
    } catch (error) {
      return null;
    }
  }, [formData.birthdate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (userId) {
      const profileData = {
        height: parseFloat(formData.height) || null,
        weight: parseFloat(formData.weight) || null,
        gender: formData.gender,
        birthdate: formData.birthdate,
      };
      dispatch(saveProfile({ userId, profileData }));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <h2>プロフィール設定</h2>
      <p className={styles.description}>
        ご自身の情報を登録すると、各機能がよりパーソナライズされます。
      </p>
      
      <div className={styles.formGroup}>
        <label htmlFor="birthdate">生年月日</label>
        <div className={styles.ageDisplayWrapper}>
          <DatePicker value={formData.birthdate} onChange={handleInputChange} />
          {age !== null && <span className={styles.ageDisplay}>（{age}歳）</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>性別</label>
        <div className={styles.radioGroup}>
          <button className={formData.gender === 'male' ? styles.active : ''} onClick={() => handleInputChange({ target: { name: 'gender', value: 'male' } })}>男性</button>
          <button className={formData.gender === 'female' ? styles.active : ''} onClick={() => handleInputChange({ target: { name: 'gender', value: 'female' } })}>女性</button>
          <button className={formData.gender === 'other' ? styles.active : ''} onClick={() => handleInputChange({ target: { name: 'gender', value: 'other' } })}>その他</button>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="height">身長 (cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleInputChange} placeholder="例: 170" className={styles.inputField} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="weight">現在の体重 (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} placeholder="例: 60.5" className={styles.inputField} />
        </div>
      </div>

      <button onClick={handleSave} className={styles.saveButton}>
        {showSuccess ? '保存しました ✔' : '保存する'}
      </button>
    </div>
  );
};

export default ProfileDashboard;