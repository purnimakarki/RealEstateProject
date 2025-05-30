'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../hooks/usewallet';
import { Bell, X, CheckCheck } from 'lucide-react';
import NotificationsList from './NotificationsList';

interface Notification {
  type: string;
  propertyId: number;
  tokenAmount: number;
  buyerAddress: string;
  totalCost: string;
  timestamp: string;
  propertyName?: string;
}

export default function PropertyNotifications() {
  const { account } = useWallet();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the notification panel to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!account) return;
    
    // Load notifications from localStorage
    const loadNotifications = () => {
      try {
        // Get all notifications from localStorage
        const allNotifications = JSON.parse(localStorage.getItem('propertyNotifications') || '{}');
        
        // Check if we have notifications for this account
        const userNotifications = allNotifications[account] || [];
        
        console.log('Loaded notifications for account:', account, userNotifications);
        
        // If no notifications for this account, check if we have any notifications at all
        if (userNotifications.length === 0 && Object.keys(allNotifications).length > 0) {
          // Collect all notifications from all accounts
          const allAccountNotifications = [];
          for (const accAddr in allNotifications) {
            if (Array.isArray(allNotifications[accAddr])) {
              allAccountNotifications.push(...allNotifications[accAddr]);
            }
          }
          
          console.log('Found notifications from other accounts:', allAccountNotifications.length);
          
          // Use these notifications if we have any
          if (allAccountNotifications.length > 0) {
            setNotifications(allAccountNotifications);
            setUnreadCount(allAccountNotifications.length);
            return;
          }
        }
        
        // Sort notifications by timestamp (newest first)
        userNotifications.sort((a: Notification, b: Notification) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setNotifications(userNotifications);
        
        // Get read status from localStorage
        const readStatus = JSON.parse(localStorage.getItem(`notificationsRead_${account}`) || '{}');
        const newUnreadCount = userNotifications.filter(
          (n: Notification) => !readStatus[n.timestamp]
        ).length;
        
        setUnreadCount(newUnreadCount);
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    };
    
    loadNotifications();
    
    // Set up interval to check for new notifications
    const intervalId = setInterval(loadNotifications, 15000);
    
    return () => clearInterval(intervalId);
  }, [account]);

  const markAllAsRead = () => {
    if (!account) return;
    
    try {
      const readStatus = JSON.parse(localStorage.getItem(`notificationsRead_${account}`) || '{}');
      
      notifications.forEach(notification => {
        readStatus[notification.timestamp] = true;
      });
      
      localStorage.setItem(`notificationsRead_${account}`, JSON.stringify(readStatus));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAsRead = (timestamp: string) => {
    if (!account) return;
    
    try {
      const readStatus = JSON.parse(localStorage.getItem(`notificationsRead_${account}`) || '{}');
      readStatus[timestamp] = true;
      localStorage.setItem(`notificationsRead_${account}`, JSON.stringify(readStatus));
      
      // Update unread count
      const newUnreadCount = notifications.filter(
        (n) => !readStatus[n.timestamp]
      ).length;
      
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      
    } else {
      
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button 
        onClick={toggleNotifications}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className={`h-6 w-6 ${showNotifications ? 'text-blue-400' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="fixed right-4 mt-2 w-96 bg-gray-800 rounded-lg shadow-2xl z-[100] overflow-hidden border border-gray-700 transition-all duration-300 ease-in-out" style={{ maxHeight: 'calc(100vh - 100px)', top: '60px' }}>
          <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
            <h3 className="text-white font-medium flex items-center">
              <Bell className="h-4 w-4 mr-2 text-blue-400" />
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all as read
                </button>
              )}
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            <NotificationsList 
              notifications={notifications} 
              onMarkAsRead={markAsRead}
            />
          </div>
        </div>
      )}
    </div>
  );
}