'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({ message, type, isVisible, onClose, action }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColors = {
    success: 'bg-green-100 border-green-500',
    error: 'bg-red-100 border-red-500',
    warning: 'bg-yellow-100 border-yellow-500',
    info: 'bg-blue-100 border-blue-500',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-fadeIn">
      <div className={`${bgColors[type]} ${textColors[type]} p-4 rounded-lg shadow-lg border-l-4 max-w-md flex items-start`}>
        <div className="flex-1 mr-2">
          <p className="font-medium">{message}</p>
          {action && (
            <button 
              onClick={action.onClick}
              className="mt-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        <button 
          onClick={onClose} 
          className="flex-shrink-0 ml-auto -mt-1 -mr-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Global toast context
import { createContext, useContext } from 'react';

type ToastContextType = {
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info', action?: { label: string; onClick: () => void }) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    action?: { label: string; onClick: () => void }
  ) => {
    setToast({ message, type, isVisible: true, action });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
        action={toast.action}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}