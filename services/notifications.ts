
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications.');
    return 'denied';
  }

  if (Notification.permission === 'granted') return 'granted';
  
  const permission = await Notification.requestPermission();
  return permission;
};

export const sendPushNotification = (title: string, body: string, icon?: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    // Fallback to console for simulation if not granted
    console.log(`[UI Notification Fallback] ${title}: ${body}`);
    return;
  }

  try {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
    });
  } catch (e) {
    console.error('Failed to send notification', e);
  }
};
