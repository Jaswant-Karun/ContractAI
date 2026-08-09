import React, { createContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // Ignore background notification fetch errors
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications: fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
