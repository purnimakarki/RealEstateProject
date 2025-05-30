'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '../components/hooks/usewallet';

interface Notification {
  type: string;
  propertyId: number;
  tokenAmount: number;
  buyerAddress: string;
  totalCost: string;
  timestamp: string;
  propertyName?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (timestamp: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification, recipientAddress: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { account } = useWallet();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(() => {
    try {
      if (!account) return;

      const allNotifications = JSON.parse(localStorage.getItem('propertyNotifications') || '{}');
      const userNotifications = allNotifications[account] || [];

      userNotifications.sort((a: Notification, b: Notification) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(userNotifications);

      const readStatus = JSON.parse(localStorage.getItem(`notificationsRead_${account}`) || '{}');
      const newUnreadCount = userNotifications.filter(
        (n: Notification) => !readStatus[n.timestamp]
      ).length;

      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  }, [account]); // Dependency: account

  useEffect(() => {
    if (!account) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    loadNotifications();

    const intervalId = setInterval(loadNotifications, 15000);
    return () => clearInterval(intervalId);
  }, [account, loadNotifications]); // Added loadNotifications to dependency array

  const markAsRead = (timestamp: string) => {
    if (!account) return;

    try {
      const readStatus = JSON.parse(localStorage.getItem(`notificationsRead_${account}`) || '{}');
      readStatus[timestamp] = true;
      localStorage.setItem(`notificationsRead_${account}`, JSON.stringify(readStatus));

      const newUnreadCount = notifications.filter(n => !readStatus[n.timestamp]).length;
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = () => {
    if (!account) return;

    try {
      const readStatus: Record<string, boolean> = {};
      notifications.forEach(n => {
        readStatus[n.timestamp] = true;
      });
      localStorage.setItem(`notificationsRead_${account}`, JSON.stringify(readStatus));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const addNotification = (notification: Notification, recipientAddress: string) => {
    try {
      const allNotifications = JSON.parse(localStorage.getItem('propertyNotifications') || '{}');
      const userNotifications = allNotifications[recipientAddress] || [];

      const updatedNotifications = [notification, ...userNotifications];
      allNotifications[recipientAddress] = updatedNotifications;

      localStorage.setItem('propertyNotifications', JSON.stringify(allNotifications));

      // If the notification is for the currently logged-in user, update state
      if (account === recipientAddress) {
        setNotifications(updatedNotifications);
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};