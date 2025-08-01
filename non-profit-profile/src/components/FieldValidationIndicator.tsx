import { CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';
import React from 'react';

interface FieldValidationIndicatorProps {
  value: unknown;
  isRequired: boolean;
  error?: string;
  warning?: string;
  info?: string;
  isValidating?: boolean;
  showSuccess?: boolean;
}

const FieldValidationIndicator: React.FC<FieldValidationIndicatorProps> = ({
  value,
  isRequired,
  error,
  warning,
  info,
  isValidating = false,
  showSuccess = true,
}) => {
  const hasValue = value && value.toString().trim().length > 0;
  const isValid = hasValue && !error;
  const isEmpty = !hasValue && isRequired;

  if (isValidating) {
    return (
      <div className="flex items-center space-x-1 text-blue-500">
        <Clock className="w-4 h-4 animate-spin" />
        <span className="text-xs">Validating...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-1 text-red-500">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">{error}</span>
      </div>
    );
  }

  if (warning) {
    return (
      <div className="flex items-center space-x-1 text-yellow-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">{warning}</span>
      </div>
    );
  }

  if (info) {
    return (
      <div className="flex items-center space-x-1 text-blue-500">
        <Info className="w-4 h-4" />
        <span className="text-xs">{info}</span>
      </div>
    );
  }

  if (isValid && showSuccess) {
    return (
      <div className="flex items-center space-x-1 text-green-500">
        <CheckCircle className="w-4 h-4" />
        <span className="text-xs">Valid</span>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center space-x-1 text-gray-400">
        <AlertCircle className="w-4 h-4" />
        <span className="text-xs">Required</span>
      </div>
    );
  }

  return null;
};

export default FieldValidationIndicator;
