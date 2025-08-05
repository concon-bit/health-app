// src/components/common/MoreMenuModal.js
import React from 'react';
import styles from '../../styles/MoreMenuModal.module.css';
import { useDispatch } from 'react-redux';
import { setActiveMode, toggleMoreMenu } from '../../redux/uiSlice';
import { logout } from '../../services/firebaseService';
import { FaHeartbeat, FaVenus, FaPills, FaRunning, FaSignOutAlt, FaUserCog } from 'react-icons/fa'; 

const MoreMenuModal = () => {
  const dispatch = useDispatch();

  const handleModeSelect = (mode) => {
    dispatch(setActiveMode(mode));
  };

  const handleLogout = async () => {
    // ▼▼▼【デバッグ用コード】▼▼▼
    console.log("ログアウトボタンがクリックされました！");
    // ▲▲▲【デバッグ用コード】▲▲▲
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
      alert("ログアウトに失敗しました。");
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={() => dispatch(toggleMoreMenu())}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.menuGrid}>
          <button className={styles.menuItem} onClick={() => handleModeSelect('health')}><FaHeartbeat /><span>体調管理</span></button>
          <button className={styles.menuItem} onClick={() => handleModeSelect('period')}><FaVenus /><span>生理周期</span></button>
          <button className={styles.menuItem} onClick={() => handleModeSelect('medication')}><FaPills /><span>服薬管理</span></button>
          <button className={styles.menuItem} onClick={() => handleModeSelect('exercise')}><FaRunning /><span>運動記録</span></button>
          <button className={styles.menuItem} onClick={() => handleModeSelect('profile')}>
            <FaUserCog />
            <span>プロフィール</span>
          </button>
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