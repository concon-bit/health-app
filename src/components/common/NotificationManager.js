// src/components/common/NotificationManager.js

import React, { useState, useEffect } from 'react';
import { requestNotificationPermission } from '../../services/notificationService';
import styles from '../../styles/NotificationManager.module.css';

const NotificationManager = () => {
  const [showBanner, setShowBanner]
 
= useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      alert('通知を許可していただきありがとうございます！');
    } else if (permission === 'denied') {
      alert('通知が拒否されました。後からブラウザの設定で変更できます。');
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={styles.banner}>
      <p>お薬の飲み忘れ防止のため、通知を許可しませんか？</p>
      <div className={styles.actions}>
        <button onClick={handleAllow} className={styles.allowButton}>許可</button>
        <button onClick={handleDismiss} className={styles.dismissButton}>無視</button>
      </div>
    </div>
  );
};

export default NotificationManager;