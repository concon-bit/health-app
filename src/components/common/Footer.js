// src/components/common/Footer.js

import React from 'react';
import styles from '../../styles/Footer.module.css';
import { FaHeartbeat, FaEllipsisH } from 'react-icons/fa'; // アイコンを変更
import { useSelector, useDispatch } from 'react-redux';
import { setActiveMode, toggleMoreMenu } from '../../redux/uiSlice';

const Footer = () => {
  const activeMode = useSelector((state) => state.ui.activeMode);
  const dispatch = useDispatch();

  // 「その他」メニューに表示するモード
  const moreMenuModes = [];

  return (
    <footer className={styles.appFooter}>
      <button 
        className={`${styles.navButton} ${activeMode === 'health' ? styles.active : ''}`}
        onClick={() => dispatch(setActiveMode('health'))}
      >
        <FaHeartbeat />
        <span>体調管理</span>
      </button>
      <button 
        className={`${styles.navButton} ${moreMenuModes.includes(activeMode) ? styles.active : ''}`}
        onClick={() => dispatch(toggleMoreMenu())}
      >
        <FaEllipsisH />
        <span>その他</span>
      </button>
    </footer>
  );
};

export default Footer;