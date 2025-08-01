import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  transparent?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading...', 
  fullScreen = false,
  transparent = false 
}) => {
  const overlayClasses = fullScreen 
    ? 'fixed inset-0 z-50' 
    : 'absolute inset-0';
    
  const backgroundClasses = transparent
    ? 'bg-white/80'
    : 'bg-white';

  return (
    <div className={`${overlayClasses} ${backgroundClasses} backdrop-blur-sm flex items-center justify-center`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;