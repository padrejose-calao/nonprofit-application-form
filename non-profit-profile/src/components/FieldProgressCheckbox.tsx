import React from 'react';
import { Check } from 'lucide-react';

interface FieldProgressCheckboxProps {
  fieldId: string;
  isCompleted: boolean;
  onChange: (fieldId: string, completed: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const FieldProgressCheckbox: React.FC<FieldProgressCheckboxProps> = ({
  fieldId,
  isCompleted,
  onChange,
  disabled = false,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent triggering parent click events
    onChange(fieldId, e.target.checked);
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
          aria-label={`Mark field ${fieldId} as ${isCompleted ? 'incomplete' : 'complete'}`}
        />
        <div className={`
          w-5 h-5 rounded border-2 transition-all duration-200
          ${isCompleted 
            ? 'bg-green-500 border-green-500' 
            : 'bg-white border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}>
          {isCompleted && (
            <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
          )}
        </div>
      </label>
      <span className="ml-2 text-xs text-gray-500">
        {isCompleted ? 'Complete' : 'Mark as complete'}
      </span>
    </div>
  );
};

export default FieldProgressCheckbox;