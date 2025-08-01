import { CheckCircle, Circle, Clock } from 'lucide-react';
import React from 'react';

interface StickyProgressBarProps {
  sections: Array<{
    id: string;
    name: string;
    completed: boolean;
    active: boolean;
    progress: number;
  }>;
  onSectionClick: (sectionId: string) => void;
}

const StickyProgressBar: React.FC<StickyProgressBarProps> = ({ sections, onSectionClick }) => {
  const overallProgress = Math.round(
    (sections.filter((s) => s.completed).length / sections.length) * 100
  );

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Form Progress</h3>
          <span className="text-sm font-semibold text-blue-600">{overallProgress}% Complete</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Section indicators */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                section.active
                  ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                  : section.completed
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={`${section.name} - ${section.progress}% complete`}
            >
              {section.completed ? (
                <CheckCircle className="w-3 h-3" />
              ) : section.active ? (
                <Clock className="w-3 h-3" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
              <span>
                {index + 1}. {section.name}
              </span>
              {section.progress > 0 && !section.completed && (
                <span className="text-xs opacity-75">({section.progress}%)</span>
              )}
            </button>
          ))}
        </div>

        {/* Keyboard hint */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Alt + 1-9</kbd> for quick section
          navigation •<kbd className="px-1 py-0.5 bg-gray-100 rounded ml-1">Ctrl + S</kbd> to save •
          <kbd className="px-1 py-0.5 bg-gray-100 rounded ml-1">?</kbd> for help
        </div>
      </div>
    </div>
  );
};

export default StickyProgressBar;
