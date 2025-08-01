import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'purple' | 'gray' | 'white';
  message?: string;
  overlay?: boolean;
  fullScreen?: boolean;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bounce';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  message,
  overlay = false,
  fullScreen = false,
  variant = 'spinner',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const SpinnerIcon = variant === 'spinner' ? Loader2 : RefreshCw;

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {variant === 'spinner' || variant === 'dots' ? (
        <SpinnerIcon className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`} />
      ) : variant === 'pulse' ? (
        <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full bg-current animate-pulse`} />
      ) : variant === 'bounce' ? (
        <div className="flex space-x-1">
          <div className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
      ) : (
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 ${colorClasses[color]} bg-current rounded-full animate-pulse`}
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      )}
      
      {message && (
        <p className={`mt-3 text-sm ${colorClasses[color]} text-center max-w-xs`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loading components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg p-4 space-y-3">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 rounded"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ 
  rows?: number; 
  cols?: number; 
  className?: string 
}> = ({ 
  rows = 5, 
  cols = 4, 
  className = '' 
}) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded w-3/4"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default LoadingSpinner;