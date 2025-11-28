'use client';

import { useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiInformationCircle, HiExclamationCircle } from 'react-icons/hi';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastNotificationProps = {
  message: string;
  type?: ToastType;
  onClose: () => void;
};

export default function ToastNotification({ message, type = 'info', onClose }: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="mr-2 h-5 w-5" />;
      case 'error':
        return <HiXCircle className="mr-2 h-5 w-5" />;
      case 'warning':
        return <HiExclamationCircle className="mr-2 h-5 w-5" />;
      default:
        return <HiInformationCircle className="mr-2 h-5 w-5" />;
    }
  };

  return (
    <div
      className={`animate-fade-in fixed top-5 right-5 z-50 flex items-center rounded-lg border px-4 py-3 shadow-md ${getStyles()}`}
      role="alert"
    >
      {getIcon()}
      <span className="font-medium">{message}</span>
    </div>
  );
}
