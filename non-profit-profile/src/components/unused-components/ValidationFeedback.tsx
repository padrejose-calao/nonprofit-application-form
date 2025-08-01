import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';

interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

interface ValidationFeedbackProps {
  value: unknown;
  rules?: ValidationRule[];
  error?: string;
  success?: boolean;
  showSuccess?: boolean;
  showValidation?: boolean;
  label?: string;
  hint?: string;
  className?: string;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  value,
  rules = [],
  error,
  success,
  showSuccess = true,
  showValidation = true,
  label,
  hint,
  className = ''
}) => {
  const validationResults = rules.map(rule => ({
    ...rule,
    passed: rule.test(value)
  }));

  const hasErrors = error || validationResults.some(r => r.severity === 'error' && !r.passed);
  const hasWarnings = validationResults.some(r => r.severity === 'warning' && !r.passed);
  const isValid = !hasErrors && value && validationResults.length > 0 && validationResults.every(r => r.passed);

  const getStatusIcon = () => {
    if (hasErrors) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (hasWarnings) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
    if (isValid && showSuccess) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  const _getStatusColor = () => {
    if (hasErrors) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (hasWarnings) return 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500';
    if (isValid) return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <div className={className}>
      {/* Status Icon Container */}
      <div className="relative">
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
          {getStatusIcon()}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-1 flex items-start">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Validation Rules */}
      {showValidation && validationResults.length > 0 && (
        <div className="mt-2 space-y-1">
          {validationResults.map((result, index) => (
            <div key={index} className="flex items-start">
              {result.severity === 'error' ? (
                <AlertCircle className={`w-3 h-3 mr-2 mt-0.5 flex-shrink-0 ${result.passed ? 'text-green-500' : 'text-red-500'}`} />
              ) : result.severity === 'warning' ? (
                <AlertTriangle className={`w-3 h-3 mr-2 mt-0.5 flex-shrink-0 ${result.passed ? 'text-green-500' : 'text-yellow-500'}`} />
              ) : (
                <Info className={`w-3 h-3 mr-2 mt-0.5 flex-shrink-0 ${result.passed ? 'text-green-500' : 'text-blue-500'}`} />
              )}
              <p className={`text-xs ${
                result.passed 
                  ? 'text-green-600' 
                  : result.severity === 'error' 
                    ? 'text-red-600' 
                    : result.severity === 'warning'
                      ? 'text-yellow-600'
                      : 'text-blue-600'
              }`}>
                {result.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Hint */}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}

      {/* Success Message */}
      {success && showSuccess && !error && (
        <div className="mt-1 flex items-start">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
    </div>
  );
};

// Password strength component
export const PasswordStrength: React.FC<{
  password: string;
  showPassword?: boolean;
  onToggleVisibility?: () => void;
}> = ({ password, showPassword = false, onToggleVisibility }) => {
  const rules = [
    { test: (p: unknown) => typeof p === 'string' && p.length >= 8, message: 'At least 8 characters', severity: 'error' as const },
    { test: (p: unknown) => typeof p === 'string' && /[A-Z]/.test(p), message: 'Contains uppercase letter', severity: 'error' as const },
    { test: (p: unknown) => typeof p === 'string' && /[a-z]/.test(p), message: 'Contains lowercase letter', severity: 'error' as const },
    { test: (p: unknown) => typeof p === 'string' && /\d/.test(p), message: 'Contains number', severity: 'error' as const },
    { test: (p: unknown) => typeof p === 'string' && /[!@#$%^&*(),.?":{}|<>]/.test(p), message: 'Contains special character', severity: 'warning' as const },
  ];

  const strength = rules.filter(rule => rule.test(password)).length;
  const strengthPercent = (strength / rules.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercent < 40) return 'bg-red-500';
    if (strengthPercent < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strengthPercent < 40) return 'Weak';
    if (strengthPercent < 70) return 'Fair';
    if (strengthPercent < 100) return 'Good';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Password strength</span>
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs">
        <span className={`font-medium ${
          strengthPercent < 40 ? 'text-red-600' :
          strengthPercent < 70 ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {getStrengthText()}
        </span>
        <span className="text-gray-500">{strength}/{rules.length} requirements</span>
      </div>

      <ValidationFeedback
        value={password}
        rules={rules}
        showValidation={password.length > 0}
        showSuccess={false}
      />
    </div>
  );
};

// Field wrapper with enhanced validation
export const ValidatedField: React.FC<{
  label: string;
  value: unknown;
  onChange: (value: unknown) => void;
  rules?: ValidationRule[];
  error?: string;
  hint?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  placeholder?: string;
  className?: string;
  showCharCount?: boolean;
  maxLength?: number;
}> = ({
  label,
  value,
  onChange,
  rules = [],
  error,
  hint,
  required = false,
  type = 'text',
  placeholder,
  className = '',
  showCharCount = false,
  maxLength
}) => {
  const [focused, setFocused] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const getStatusColor = () => {
    if (error) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    const hasErrors = rules.some(rule => !rule.test(value) && rule.severity === 'error');
    if (hasErrors) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    const hasWarnings = rules.some(rule => !rule.test(value) && rule.severity === 'warning');
    if (hasWarnings) return 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500';
    if (value && rules.every(rule => rule.test(value))) return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={type === 'password' && showPassword ? 'text' : type}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`block w-full px-3 py-2 pr-10 rounded-lg shadow-sm transition-colors ${getStatusColor()}`}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {showCharCount && maxLength && (
        <div className="mt-1 text-right">
          <span className={`text-xs ${(value as string).length > maxLength * 0.9 ? 'text-yellow-600' : 'text-gray-500'}`}>
            {(value as string).length}/{maxLength}
          </span>
        </div>
      )}

      <ValidationFeedback
        value={value}
        rules={rules}
        error={error}
        hint={hint}
        showValidation={focused || (value as string).length > 0}
      />

      {type === 'password' && (focused || (value as string).length > 0) && (
        <div className="mt-2">
          <PasswordStrength password={value as string} />
        </div>
      )}
    </div>
  );
};

export default ValidationFeedback;