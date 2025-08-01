import { Copy, Eye, EyeOff } from 'lucide-react';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import FieldValidationIndicator from './FieldValidationIndicator';
import { logger } from '../utils/logger';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  warning?: string;
  info?: string;
  isRequired?: boolean;
  showCopyButton?: boolean;
  showPasswordToggle?: boolean;
  showNAOption?: boolean;
  autoValidate?: boolean;
  validationRules?: Array<(value: string) => string | null>;
  helpText?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNAToggle?: (isNA: boolean) => void;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  warning,
  info,
  isRequired = false,
  showCopyButton = false,
  showPasswordToggle = false,
  showNAOption = true,
  autoValidate = false,
  validationRules = [],
  helpText,
  value,
  onChange,
  onNAToggle,
  type = 'text',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isNA, setIsNA] = useState(value === 'N/A');
  const inputRef = useRef<HTMLInputElement>(null);

  const inputType = showPasswordToggle && showPassword ? 'text' : type;
  const currentError = error || validationError;

  useEffect(() => {
    if (autoValidate && value && validationRules.length > 0) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        for (const rule of validationRules) {
          const result = rule(value);
          if (result) {
            setValidationError(result);
            setIsValidating(false);
            return;
          }
        }
        setValidationError(null);
        setIsValidating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [value, autoValidate, validationRules]);

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        logger.error('Failed to copy:', err);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleNAToggle = useCallback(() => {
    const newIsNA = !isNA;
    setIsNA(newIsNA);
    
    if (newIsNA) {
      // Set value to N/A
      const syntheticEvent = {
        target: { value: 'N/A' },
        currentTarget: { value: 'N/A' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      // Clear the value
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    
    onNAToggle?.(newIsNA);
  }, [onChange, value]);

  useEffect(() => {
    setIsNA(value === 'N/A');
  }, [value]);

  return (
    <div className="space-y-1">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showNAOption && (
          <label className="flex items-center text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isNA}
              onChange={handleNAToggle}
              className="mr-1.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            N/A
          </label>
        )}
      </div>

      {/* Input container */}
      <div className="relative">
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={isNA || props.disabled}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            transition-all duration-200
            ${
              currentError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : isFocused
                  ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${isNA ? 'bg-gray-100 text-gray-500' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Action buttons */}
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {showCopyButton && value && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}

          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Copy confirmation */}
        {showCopied && (
          <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded">
            Copied!
          </div>
        )}
      </div>

      {/* Validation indicator */}
      <FieldValidationIndicator
        value={value}
        isRequired={isRequired}
        error={currentError || undefined}
        warning={warning}
        info={info}
        isValidating={isValidating}
      />

      {/* Help text */}
      {helpText && !currentError && !warning && !info && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default EnhancedInput;
