// src/components/common/MoreMenuModal.js
import React from 'react';
import styles from '../../styles/MoreMenuModal.module.css';
import { useDispatch } from 'react-redux';
import { setActiveMode, toggleMoreMenu } from '../../redux/uiSlice';
// [追加] firebaseService から logout 関数をインポートします
import { logout } from '../../services/firebaseService';
import { FaHeartbeat, FaVenus, FaPills, FaRunning, FaSignOutAlt, FaUserCog } from 'react-icons/fa'; 

const MoreMenuModal = () => {
  const dispatch = useDispatch();

  const handleModeSelect = (mode) => {
    dispatch(setActiveMode(mode));
  };

  // [修正] ログアウト処理を、ページリロードを含めて確実に実行するようにします
  const handleLogout = async () => {
    try {
      await logout();
      // ログアウト成功後、ページをリロードして確実にログイン画面に戻します
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