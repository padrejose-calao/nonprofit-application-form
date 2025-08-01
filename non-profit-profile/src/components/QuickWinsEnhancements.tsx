import React, { useState, useEffect } from 'react';
import {
  Moon, Sun, Keyboard, HelpCircle, Zap, Star, 
  Clock, CheckCircle, TrendingUp, Eye, EyeOff,
  Sparkles, Target, Award, Coffee, Lightbulb,
  X, Key
} from 'lucide-react';
import { toast } from 'react-toastify';

interface QuickWinsEnhancementsProps {
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const QuickWinsEnhancements: React.FC<QuickWinsEnhancementsProps> = ({
  onClose,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'tips' | 'productivity'>('shortcuts');
  const [completedTips, setCompletedTips] = useState<string[]>([]);

  const keyboardShortcuts = [
    { key: 'Ctrl + S', description: 'Save current progress', category: 'File' },
    { key: 'Ctrl + E', description: 'Export application', category: 'File' },
    { key: 'Ctrl + P', description: 'Print application', category: 'File' },
    { key: 'Ctrl + F', description: 'Search within form', category: 'Navigation' },
    { key: 'Ctrl + N', description: 'Add new contact', category: 'Contacts' },
    { key: 'Alt + 1-9', description: 'Jump to section by number', category: 'Navigation' },
    { key: 'Alt + ↑/↓', description: 'Navigate between sections', category: 'Navigation' },
    { key: 'Tab', description: 'Move to next field', category: 'Navigation' },
    { key: 'Shift + Tab', description: 'Move to previous field', category: 'Navigation' },
    { key: 'Ctrl + D', description: 'Toggle dark mode', category: 'Interface' },
    { key: 'Ctrl + ?', description: 'Show this help', category: 'Help' },
    { key: 'Esc', description: 'Close modals and dialogs', category: 'Interface' }
  ];

  const productivityTips = [
    {
      id: 'autosave',
      title: 'Enable Auto-Save',
      description: 'Turn on auto-save to protect your work every 30 seconds',
      icon: Clock,
      difficulty: 'Easy',
      timeToComplete: '30 seconds'
    },
    {
      id: 'darkmode',
      title: 'Try Dark Mode',
      description: 'Reduce eye strain during long form sessions',
      icon: Moon,
      difficulty: 'Easy',
      timeToComplete: '5 seconds'
    },
    {
      id: 'keyboard',
      title: 'Learn Keyboard Shortcuts',
      description: 'Navigate 50% faster with keyboard shortcuts',
      icon: Keyboard,
      difficulty: 'Medium',
      timeToComplete: '5 minutes'
    },
    {
      id: 'sections',
      title: 'Complete Sections Progressively',
      description: 'Focus on one section at a time for better data quality',
      icon: Target,
      difficulty: 'Easy',
      timeToComplete: '2 minutes'
    },
    {
      id: 'validation',
      title: 'Use Real-Time Validation',
      description: 'Fix errors as you type to avoid submission delays',
      icon: CheckCircle,
      difficulty: 'Easy',
      timeToComplete: '1 minute'
    },
    {
      id: 'templates',
      title: 'Save Your Work as Templates',
      description: 'Create reusable templates for similar organizations',
      icon: Star,
      difficulty: 'Medium',
      timeToComplete: '3 minutes'
    },
    {
      id: 'view-modes',
      title: 'Use View Mode Filtering',
      description: 'Switch between Full, CFF, Required, and Custom views for focused editing',
      icon: Eye,
      difficulty: 'Easy',
      timeToComplete: '1 minute'
    },
    {
      id: 'na-options',
      title: 'Utilize N/A Options',
      description: 'Use N/A checkboxes for non-applicable fields to keep forms complete',
      icon: CheckCircle,
      difficulty: 'Easy',
      timeToComplete: '30 seconds'
    },
    {
      id: 'progress-tracker',
      title: 'Monitor Progress Actively',
      description: 'Use the progress tracker to stay motivated and see completion milestones',
      icon: TrendingUp,
      difficulty: 'Easy',
      timeToComplete: '10 seconds'
    },
    {
      id: 'hide-blank-printing',
      title: 'Clean Print Options',
      description: 'Hide blank fields when printing for cleaner, professional documents',
      icon: Award,
      difficulty: 'Easy',
      timeToComplete: '20 seconds'
    }
  ];

  const quickWinActions = [
    {
      id: 'progress-bar',
      title: 'Sticky Progress Bar',
      description: 'Always see your completion progress',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'field-validation',
      title: 'Real-Time Validation',
      description: 'Instant feedback on field errors',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'auto-complete',
      title: 'Smart Auto-Complete',
      description: 'Suggestions based on previous entries',
      implemented: true,
      impact: 'Medium'
    },
    {
      id: 'contact-manager',
      title: 'Enhanced Contact Manager',
      description: 'World-class contact management with Google integration',
      implemented: true,
      impact: 'Very High'
    },
    {
      id: 'communications',
      title: 'Communications Hub',
      description: 'Email, WhatsApp, Fax integration',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'admin-distribution',
      title: 'Document Distribution',
      description: 'Admin document management and distribution',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'auto-progress-tracker',
      title: 'Auto Progress Tracker',
      description: 'Real-time progress tracking with milestones and rewards',
      implemented: true,
      impact: 'Very High'
    },
    {
      id: 'smart-form-assistant',
      title: 'Smart Form Assistant',
      description: 'AI-powered contextual help and form suggestions',
      implemented: true,
      impact: 'Very High'
    },
    {
      id: 'required-fields-toggle',
      title: 'Admin Required Fields Override',
      description: 'Admin can disable required field validation for clients',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'incomplete-fields-indicator',
      title: 'Incomplete Fields Alert',
      description: 'Exclamation icon shows incomplete, error or missing required fields',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'hide-blank-print',
      title: 'Hide Blank Fields in Print',
      description: 'Option to hide unused fields when printing/exporting PDF',
      implemented: true,
      impact: 'Medium'
    },
    {
      id: 'na-option-fields',
      title: 'N/A Option for All Fields',
      description: 'Added N/A checkbox option to all fields including required ones',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'section-jump-navigation',
      title: 'Section Jump Navigation',
      description: 'Quick navigation between sections with completion indicators',
      implemented: true,
      impact: 'Medium'
    },
    {
      id: 'enhanced-sidebar',
      title: 'Enhanced Sidebar Organization',
      description: 'Improved sidebar with better grouping and management tools',
      implemented: true,
      impact: 'High'
    },
    {
      id: 'view-mode-filtering',
      title: 'Advanced View Mode Filtering',
      description: 'CFF, Required, Custom, and Full view modes with smart filtering',
      implemented: true,
      impact: 'Very High'
    }
  ];

  const handleCompleteTip = (tipId: string) => {
    if (!completedTips.includes(tipId)) {
      setCompletedTips([...completedTips, tipId]);
      toast.success('Great job! Tip marked as completed 🎉');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High': return 'text-purple-600';
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-blue-600';
      case 'Low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const renderShortcuts = () => (
    <div className="space-y-6">
      {['File', 'Navigation', 'Contacts', 'Interface', 'Help'].map(category => (
        <div key={category}>
          <h3 className="font-semibold text-lg mb-3 text-gray-900">{category}</h3>
          <div className="space-y-2">
            {keyboardShortcuts
              .filter(shortcut => shortcut.category === category)
              .map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center space-x-1">
                    {shortcut.key.split(' + ').map((key, keyIndex) => (
                      <React.Fragment key={keyIndex}>
                        {keyIndex > 0 && <span className="text-gray-400">+</span>}
                        <span className="bg-white border border-gray-300 rounded px-2 py-1 text-sm font-mono text-gray-800">
                          {key}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTips = () => (
    <div className="space-y-4">
      {productivityTips.map(tip => {
        const IconComponent = tip.icon;
        const isCompleted = completedTips.includes(tip.id);
        
        return (
          <div key={tip.id} className={`border rounded-lg p-4 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <IconComponent className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                    {tip.title}
                  </h4>
                  <p className={`text-sm mt-1 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                    {tip.description}
                  </p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(tip.difficulty)}`}>
                      {tip.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {tip.timeToComplete}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleCompleteTip(tip.id)}
                disabled={isCompleted}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  isCompleted 
                    ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isCompleted ? 'Completed' : 'Mark Done'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderProductivity = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Quick Wins Implemented</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickWinActions.map(action => (
            <div key={action.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{action.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${getImpactColor(action.impact)}`}>
                    {action.impact}
                  </span>
                  {action.implemented && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pro Tips</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Coffee className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Take Breaks</p>
              <p className="text-sm text-gray-600">Save your work and take a 5-minute break every 30 minutes for better focus.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Complete Sections in Order</p>
              <p className="text-sm text-gray-600">Follow the sidebar progression for optimal data flow and validation.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Use the Contact Manager</p>
              <p className="text-sm text-gray-600">Centralize all contact information to avoid duplication and ensure consistency.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Quick Wins & Enhancements</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'shortcuts'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Keyboard Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'tips'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Productivity Tips
          </button>
          <button
            onClick={() => setActiveTab('productivity')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'productivity'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Quick Wins
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'shortcuts' && renderShortcuts()}
          {activeTab === 'tips' && renderTips()}
          {activeTab === 'productivity' && renderProductivity()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>
                Completed Tips: {completedTips.length}/{productivityTips.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Keyboard className="w-4 h-4" />
              <span>Press Ctrl+? to open this anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickWinsEnhancements;