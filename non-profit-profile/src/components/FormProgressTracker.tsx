import React, { useState, useEffect } from 'react';
import { Check, Circle, ChevronRight, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface FormSection {
  id: string;
  label: string;
  required: boolean;
  fields: string[];
  validationRules?: Record<string, (value: any) => boolean>;
}

interface FormProgressTrackerProps {
  formData: Record<string, any>;
  sections: FormSection[];
  currentSection?: string;
  onSectionChange?: (sectionId: string) => void;
  className?: string;
  showPercentage?: boolean;
  showFieldCount?: boolean;
  sticky?: boolean;
}

const FormProgressTracker: React.FC<FormProgressTrackerProps> = ({
  formData,
  sections,
  currentSection,
  onSectionChange,
  className = '',
  showPercentage = true,
  showFieldCount = true,
  sticky = true
}) => {
  const [sectionProgress, setSectionProgress] = useState<Record<string, { completed: number; total: number; isValid: boolean }>>({});

  useEffect(() => {
    const progress: Record<string, { completed: number; total: number; isValid: boolean }> = {};

    sections.forEach(section => {
      const totalFields = section.fields.length;
      let completedFields = 0;
      let isValid = true;

      section.fields.forEach(fieldPath => {
        const value = getNestedValue(formData, fieldPath);
        if (value !== undefined && value !== null && value !== '') {
          completedFields++;
        }

        // Check validation rules if provided
        if (section.validationRules && section.validationRules[fieldPath]) {
          const rule = section.validationRules[fieldPath];
          if (!rule(value)) {
            isValid = false;
          }
        }
      });

      progress[section.id] = {
        completed: completedFields,
        total: totalFields,
        isValid: section.required ? completedFields === totalFields && isValid : isValid
      };
    });

    setSectionProgress(progress);
  }, [formData, sections]);

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const getTotalProgress = () => {
    const totals = Object.values(sectionProgress).reduce(
      (acc, curr) => ({
        completed: acc.completed + curr.completed,
        total: acc.total + curr.total
      }),
      { completed: 0, total: 0 }
    );

    return totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0;
  };

  const getSectionIcon = (section: FormSection) => {
    const progress = sectionProgress[section.id];
    if (!progress) return <Circle className="w-5 h-5 text-gray-400" />;

    if (progress.isValid && progress.completed === progress.total) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }

    if (progress.completed > 0) {
      return (
        <div className="relative">
          <Circle className="w-5 h-5 text-blue-500" />
          <div 
            className="absolute inset-0 rounded-full border-2 border-blue-500"
            style={{
              clipPath: `polygon(0 0, ${(progress.completed / progress.total) * 100}% 0, ${(progress.completed / progress.total) * 100}% 100%, 0 100%)`
            }}
          />
        </div>
      );
    }

    if (section.required) {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    }

    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  const getSectionStatus = (section: FormSection) => {
    const progress = sectionProgress[section.id];
    if (!progress) return 'incomplete';

    if (progress.isValid && progress.completed === progress.total) {
      return 'complete';
    }

    if (progress.completed > 0) {
      return 'in-progress';
    }

    return section.required ? 'required' : 'incomplete';
  };

  const overallProgress = getTotalProgress();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${sticky ? 'sticky top-4' : ''} ${className}`}>
      {/* Overall Progress Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Form Progress</h3>
          {showPercentage && (
            <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        
        {showFieldCount && (
          <p className="text-sm text-gray-600 mt-2">
            {Object.values(sectionProgress).reduce((acc, curr) => acc + curr.completed, 0)} of{' '}
            {Object.values(sectionProgress).reduce((acc, curr) => acc + curr.total, 0)} fields completed
          </p>
        )}
      </div>

      {/* Section List */}
      <div className="p-4 space-y-2">
        {sections.map((section, index) => {
          const progress = sectionProgress[section.id];
          const status = getSectionStatus(section);
          const isActive = currentSection === section.id;

          return (
            <div key={section.id}>
              <button
                onClick={() => onSectionChange?.(section.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {getSectionIcon(section)}
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        status === 'complete' 
                          ? 'text-green-700' 
                          : status === 'in-progress'
                            ? 'text-blue-700'
                            : status === 'required'
                              ? 'text-red-700'
                              : 'text-gray-700'
                      }`}>
                        {section.label}
                      </span>
                      {section.required && (
                        <span className="text-xs text-red-500">Required</span>
                      )}
                    </div>
                    {progress && showFieldCount && (
                      <p className="text-xs text-gray-500">
                        {progress.completed}/{progress.total} fields
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {progress && (
                    <div className="text-right">
                      <div className={`text-xs font-medium ${
                        status === 'complete' 
                          ? 'text-green-600' 
                          : status === 'in-progress'
                            ? 'text-blue-600'
                            : 'text-gray-500'
                      }`}>
                        {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
                      </div>
                      {!progress.isValid && progress.completed > 0 && (
                        <div className="text-xs text-red-500">Validation needed</div>
                      )}
                    </div>
                  )}
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isActive ? 'rotate-90' : ''
                  } text-gray-400`} />
                </div>
              </button>
              
              {/* Section divider */}
              {index < sections.length - 1 && (
                <div className="ml-8 my-2">
                  <div className="w-px h-4 bg-gray-200" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => {
              const incompleteSections = sections.filter(s => {
                const progress = sectionProgress[s.id];
                return !progress || progress.completed < progress.total;
              });
              if (incompleteSections.length > 0) {
                onSectionChange?.(incompleteSections[0].id);
              }
            }}
            className="flex items-center justify-center px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Clock className="w-4 h-4 mr-1" />
            Next Incomplete
          </button>
          
          <button 
            onClick={() => {
              const requiredSections = sections.filter(s => {
                const progress = sectionProgress[s.id];
                return s.required && (!progress || !progress.isValid);
              });
              if (requiredSections.length > 0) {
                onSectionChange?.(requiredSections[0].id);
              }
            }}
            className="flex items-center justify-center px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Required Only
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormProgressTracker;