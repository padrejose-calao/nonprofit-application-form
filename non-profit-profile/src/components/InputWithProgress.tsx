import React from 'react';
import FieldProgressCheckbox from './FieldProgressCheckbox';

interface InputWithProgressProps {
  fieldId: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  isCompleted: boolean;
  onCompletionChange: (fieldId: string, completed: boolean) => void;
}

const InputWithProgress: React.FC<InputWithProgressProps> = ({
  fieldId,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  isCompleted,
  onCompletionChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={fieldId} className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <FieldProgressCheckbox
          fieldId={fieldId}
          isCompleted={isCompleted}
          onChange={onCompletionChange}
          disabled={disabled}
        />
      </div>
      <input
        type={type}
        id={fieldId}
        name={fieldId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        } ${className}`}
      />
    </div>
  );
};

export default InputWithProgress;