import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export const useNotification = () => {
  const addNotification = useCallback((notification: Notification) => {
    const { type, title, message, duration = 4000 } = notification;

    switch (type) {
      case 'success':
        toast.success(`${title}: ${message}`, { duration });
        break;
      case 'error':
        toast.error(`${title}: ${message}`, { duration });
        break;
      case 'warning':
        toast(`${title}: ${message}`, { 
          duration,
          icon: '⚠️',
          style: {
            background: '#fef3c7',
            color: '#92400e',
          }
        });
        break;
      case 'info':
        toast(`${title}: ${message}`, { 
          duration,
          icon: 'ℹ️',
          style: {
            background: '#dbeafe',
            color: '#1e40af',
          }
        });
        break;
      default:
        toast(message, { duration });
    }
  }, []);

  return { addNotification };
};