import React from 'react';
import { CheckCircle2, Circle, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  status: 'complete' | 'incomplete' | 'partial';
  progress: number;
  fields?: {
    total: number;
    completed: number;
  };
}

interface AutoProgressTrackerContentProps {
  sections: Section[];
  overallProgress: number;
}

const AutoProgressTrackerContent: React.FC<AutoProgressTrackerContentProps> = ({
  sections,
  overallProgress
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="w-80">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Application Progress
          </h3>
          <span className="text-sm font-medium text-gray-600">{overallProgress}%</span>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              overallProgress === 100 ? 'bg-green-500' : 
              overallProgress >= 75 ? 'bg-blue-500' : 
              overallProgress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sections.map((section) => (
          <div 
            key={section.id}
            className={`p-2 rounded-lg border ${
              section.status === 'complete' ? 'border-green-200' : 
              section.status === 'partial' ? 'border-yellow-200' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                {getStatusIcon(section.status)}
                <span className="text-sm font-medium text-gray-900">{section.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                {section.fields && (
                  <span className="text-xs text-gray-500">
                    {section.fields.completed}/{section.fields.total}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(section.status)}`}>
                  {section.progress}%
                </span>
              </div>
            </div>
            
            {section.progress > 0 && section.progress < 100 && (
              <div className="mt-1 w-full bg-gray-100 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full ${
                    section.status === 'partial' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${section.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <BarChart3 className="w-3 h-3 mr-1" />
            Real-time tracking
          </span>
          <span>Auto-updates on change</span>
        </div>
      </div>
    </div>
  );
};

export default AutoProgressTrackerContent;