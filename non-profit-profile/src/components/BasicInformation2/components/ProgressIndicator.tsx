import React from 'react';

interface ProgressIndicatorProps {
  sections: string[];
  currentSection: string;
  completedSections: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  sections,
  currentSection,
  completedSections,
}) => {
  const progress = (completedSections.length / sections.length) * 100;

  return (
    <div className="w-64">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;