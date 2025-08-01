import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      calculatePosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = () => {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const spacing = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + spacing;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + spacing;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = spacing;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - spacing;
    }

    if (top < 0) top = spacing;
    if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - spacing;
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);

      return () => {
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible]);

  const getArrowStyles = () => {
    const arrowSize = 6;
    const baseStyles = 'absolute w-0 h-0 border-solid';
    
    switch (position) {
      case 'top':
        return `${baseStyles} -bottom-${arrowSize} left-1/2 transform -translate-x-1/2 
                border-l-${arrowSize} border-r-${arrowSize} border-t-${arrowSize} 
                border-l-transparent border-r-transparent border-t-gray-900`;
      case 'bottom':
        return `${baseStyles} -top-${arrowSize} left-1/2 transform -translate-x-1/2 
                border-l-${arrowSize} border-r-${arrowSize} border-b-${arrowSize} 
                border-l-transparent border-r-transparent border-b-gray-900`;
      case 'left':
        return `${baseStyles} -right-${arrowSize} top-1/2 transform -translate-y-1/2 
                border-t-${arrowSize} border-b-${arrowSize} border-l-${arrowSize} 
                border-t-transparent border-b-transparent border-l-gray-900`;
      case 'right':
        return `${baseStyles} -left-${arrowSize} top-1/2 transform -translate-y-1/2 
                border-t-${arrowSize} border-b-${arrowSize} border-r-${arrowSize} 
                border-t-transparent border-b-transparent border-r-gray-900`;
      default:
        return '';
    }
  };

  return (
    <>
      <div
        ref={targetRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {React.Children.map(children, child =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                'aria-describedby': isVisible ? 'tooltip' : (child.props as any)?.['aria-describedby']
              })
            : child
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip"
          role="tooltip"
          className={`fixed z-[100] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg 
                     pointer-events-none transition-opacity duration-200 ${className}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            opacity: tooltipPosition.top ? 1 : 0
          }}
        >
          {content}
          <div className={getArrowStyles()} />
        </div>
      )}
    </>
  );
};

// Simple tooltip component for quick use
export const SimpleTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  className?: string;
}> = ({ content, children, className = '' }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className={`absolute hidden group-hover:block z-50 px-2 py-1 text-xs text-white 
                      bg-gray-800 rounded whitespace-nowrap bottom-full left-1/2 transform 
                      -translate-x-1/2 mb-2 ${className}`}>
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-800" />
        </div>
      </div>
    </div>
  );
};

export default Tooltip;