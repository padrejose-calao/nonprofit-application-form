import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Info, AlertCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { logger } from '../utils/logger';

type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  requireTyping?: string; // Text user must type to confirm
  countdown?: number; // Seconds before confirm button is enabled
  destructive?: boolean;
  children?: React.ReactNode;
  details?: string[];
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  icon,
  loading = false,
  requireTyping,
  countdown = 0,
  destructive = false,
  children,
  details = []
}) => {
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTypedText('');
      setTimeLeft(countdown);
      setIsProcessing(false);
    }
  }, [isOpen, countdown]);

  useEffect(() => {
    if (timeLeft > 0 && isOpen) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && canConfirm()) {
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, typedText, timeLeft]);

  const canConfirm = () => {
    if (timeLeft > 0) return false;
    if (requireTyping && typedText !== requireTyping) return false;
    return true;
  };

  const handleConfirm = async () => {
    if (!canConfirm() || isProcessing) return;

    try {
      setIsProcessing(true);
      await onConfirm();
      onClose();
    } catch (error) {
      logger.error('Confirmation action failed:', error);
      // Don't close on error - let user retry
    } finally {
      setIsProcessing(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          headerBg: 'bg-red-50',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        };
      case 'warning':
        return {
          headerBg: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        };
      case 'info':
        return {
          headerBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        };
      case 'success':
        return {
          headerBg: 'bg-green-50',
          iconColor: 'text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        };
      default:
        return {
          headerBg: 'bg-gray-50',
          iconColor: 'text-gray-600',
          confirmButton: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
        };
    }
  };

  const getDefaultIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-6 h-6" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6" />;
      case 'info':
        return <Info className="w-6 h-6" />;
      case 'success':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const styles = getVariantStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-message"
      >
        {/* Header */}
        <div className={`${styles.headerBg} p-6 border-b`}>
          <div className="flex items-center">
            <div className={`${styles.iconColor} mr-4`}>
              {icon || getDefaultIcon()}
            </div>
            <h3 id="confirmation-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p id="confirmation-message" className="text-gray-700 mb-4">
            {message}
          </p>

          {details.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Details:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {children && (
            <div className="mb-4">
              {children}
            </div>
          )}

          {requireTyping && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "<span className="font-mono bg-gray-100 px-1 rounded">{requireTyping}</span>" to confirm:
              </label>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={requireTyping}
                autoFocus
              />
            </div>
          )}

          {timeLeft > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Please wait {timeLeft} second{timeLeft !== 1 ? 's' : ''} before confirming.
              </p>
            </div>
          )}

          {destructive && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Warning: This action cannot be undone</h4>
                  <p className="text-sm text-red-700 mt-1">
                    This will permanently delete the selected items and cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm() || isProcessing}
            className={`px-4 py-2 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${styles.confirmButton} flex items-center`}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for easier usage
export const useConfirmation = () => {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    props: Partial<ConfirmationDialogProps>;
  }>({
    isOpen: false,
    props: {}
  });

  const confirm = (props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        isOpen: true,
        props: {
          ...props,
          onConfirm: async () => {
            await props.onConfirm();
            resolve(true);
          }
        }
      });
    });
  };

  const close = () => {
    setDialog({ isOpen: false, props: {} });
  };

  const ConfirmationComponent = () => (
    <ConfirmationDialog
      {...dialog.props as ConfirmationDialogProps}
      isOpen={dialog.isOpen}
      onClose={close}
    />
  );

  return { confirm, ConfirmationComponent };
};

export default ConfirmationDialog;