'use client';
import React, { useState } from 'react';
import { Bell, DollarSign, User, Home, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '../hooks/usewallet';

interface Notification {
  type: string;
  propertyId: number;
  tokenAmount: number;
  buyerAddress?: string;
  totalCost?: string;
  timestamp: string;
  propertyName?: string;
  transactionHash?: string;
  read?: boolean;
  propertyAddress?: string;
}

interface NotificationsListProps {
  notifications?: Notification[];
  onMarkAsRead?: (timestamp: string) => void;
}

export default function NotificationsList({ notifications: propNotifications, onMarkAsRead }: NotificationsListProps) {
  const { account } = useWallet();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  
  // Use either provided notifications from props or load from localStorage
  React.useEffect(() => {
    if (propNotifications) {
      setLocalNotifications(propNotifications);
    } else if (account) {
      // Load notifications from localStorage when not provided via props
      const storedNotifications = localStorage.getItem('propertyNotifications');
      if (storedNotifications) {
        try {
          const parsedData = JSON.parse(storedNotifications);
          
          // Only get notifications for the current account
          if (parsedData[account]) {
            setLocalNotifications(parsedData[account]);
          } else {
            setLocalNotifications([]);
          }
        } catch (error) {
          console.error('Error parsing notifications:', error);
          setLocalNotifications([]);
        }
      } else {
        setLocalNotifications([]);
      }
    }
  }, [propNotifications, account]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };
  
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const notifications = propNotifications || localNotifications;

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Bell className="h-12 w-12 mx-auto text-gray-500 mb-4 opacity-50" />
        <p className="text-gray-400 mb-2">No notifications yet</p>
        <p className="text-gray-500 text-sm">When you receive notifications, they will appear here</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-700">
      {notifications.map((notification, index) => (
        <div 
          key={index} 
          className="p-4 hover:bg-gray-750 transition-colors duration-200 cursor-pointer"
          onClick={() => onMarkAsRead && onMarkAsRead(notification.timestamp)}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full flex-shrink-0 ${
              notification.type === 'TOKEN_PURCHASE' || notification.type === 'purchase' 
                ? 'bg-blue-900/50' 
                : 'bg-gray-700'
            }`}>
              {notification.type === 'TOKEN_PURCHASE' || notification.type === 'purchase' ? (
                <DollarSign className="h-5 w-5 text-blue-400" />
              ) : (
                <Bell className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-white font-medium truncate">
                  {(notification.type === 'TOKEN_PURCHASE' || notification.type === 'purchase')
                    ? `Your property has been bought!`
                    : notification.type === 'PURCHASE_CONFIRMATION'
                    ? `Purchase Confirmation`
                    : 'New notification'}
                </p>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {formatDate(notification.timestamp)}
                </span>
              </div>
              
              <div className="mt-2 space-y-1.5 text-sm">
                {notification.propertyAddress && (
                  <div className="flex items-center text-gray-300 truncate">
                    <Home className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{notification.propertyAddress}</span>
                  </div>
                )}
                
                {notification.buyerAddress && (
                  <div className="flex items-center text-gray-300">
                    <User className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
                    <span>Buyer: {formatAddress(notification.buyerAddress)}</span>
                  </div>
                )}
                
                <div className="flex items-center text-gray-300">
                  <Home className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
                  <span>Property #{notification.propertyId} {notification.propertyName ? `(${notification.propertyName})` : ''}</span>
                </div>
                
                <div className="flex items-center text-gray-300">
                  <DollarSign className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 text-gray-400" />
                  <span>{notification.tokenAmount} tokens {notification.totalCost ? `for ${notification.totalCost} ETH` : ''}</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center">
                <Link 
                  href={`/page/property/${notification.propertyId}`}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                >
                  <span>View Property</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Link>
                
                {notification.transactionHash && (
                  <a 
                    href={`https://etherscan.io/tx/${notification.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-gray-300 ml-4 flex items-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>View Transaction</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
