// src/components/common/MoreMenuModal.js
import React from 'react';
import styles from '../../styles/MoreMenuModal.module.css';
import { useDispatch } from 'react-redux';
import { setActiveMode, toggleMoreMenu } from '../../redux/uiSlice';
import { FaHeartbeat, FaVenus, FaPills, FaRunning, FaSignOutAlt, FaUserCog } from 'react-icons/fa'; // <<< [変更]
import { logout } from '../../services/firebaseService';

const MoreMenuModal = () => {
  const dispatch = useDispatch();

  const handleModeSelect = (mode) => {
    dispatch(setActiveMode(mode));
  };

  const handleLogout = async () => { /* ... (変更なし) ... */ };

  return (
    <div className={styles.modalBackdrop} onClick={() => dispatch(toggleMoreMenu())}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.menuGrid}>
          {/* ... (既存のボタンは変更なし) ... */}
          <button className={styles.menuItem} onClick={() => handleModeSelect('health')}><FaHeartbeat /><span>体調管理</span></button>
          <button className={styles.menuItem} onClick={() => handleModeSelect('period')}><FaVenus /><span>生理周期</span></button>
          <button className={styles.menuItem} onClick={() => handleModeSelect('medication')}><FaPills /><span>服薬管理</span></button>
          <button className={styles.menuItem} onClick={() => handleModeSelect('exercise')}><FaRunning /><span>運動記録</span></button>
          {/* ▼▼▼ [追加] プロフィール設定ボタン ▼▼▼ */}
          <button className={styles.menuItem} onClick={() => handleModeSelect('profile')}>
            <FaUserCog />
            <span>プロフィール</span>
          </button>
          {/* ▲▲▲ [追加] ▲▲▲ */}
        </div>
        <div className={styles.footerActions}>
            <button className={styles.logoutButton} onClick={handleLogout}>
                <FaSignOutAlt />
                <span>ログアウト</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default MoreMenuModal;