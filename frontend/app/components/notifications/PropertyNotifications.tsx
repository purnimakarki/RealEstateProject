'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import NotificationsList from './NotificationsList';
import { useNotification } from '@/app/context/NotificationContext'; 

// interface NotificationFromContext {
//   type: string;
//   propertyId: number;
//   tokenAmount: number;
//   buyerAddress: string;
//   totalCost: string;
//   timestamp: string;
//   propertyName?: string;
// }

export default function PropertyNotifications() {
  
  const { 
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    
  } = useNotification(); 

  const [showNotifications, setShowNotifications] = useState(false);
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


  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);

  };

  return (
    <div className="relative" ref={notificationRef}>
      <button 
        onClick={toggleNotifications}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className={`h-6 w-6 ${showNotifications ? 'text-blue-400' : ''}`} />
        {unreadCount > 0 && ( // Use unreadCount from context
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full animate-pulse">
            {unreadCount} {/* Use unreadCount from context */}
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
              {notifications.length > 0 && unreadCount > 0 && ( // Conditionally show based on context's unreadCount
                <button 
                  onClick={markAllAsRead} // Use markAllAsRead from context
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
              notifications={notifications} // Pass notifications from context
              onMarkAsRead={markAsRead} // Pass markAsRead from context
            />
          </div>
        </div>
      )}
    </div>
  );
}