// src/services/notificationService.js

export const isNotificationSupported = () => {
  return 'Notification' in window;
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.log('このブラウザは通知をサポートしていません。');
    return null;
  }
  const permission = await Notification.requestPermission();
  return permission;
};