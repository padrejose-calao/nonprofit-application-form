import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Info, 
  Check,
  FileText,
  Download,
  Printer,
  Lock,
  Unlock,
  FileCheck
} from 'lucide-react';
import ModuleHeader from './ModuleHeader';
import { toast } from 'react-toastify';

interface LeadershipItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  rating: 'green' | 'yellow' | 'red';
  description: string;
  filters: string[];
}

interface FilterQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    showFilters: string[];
    hideFilters: string[];
  }[];
}

// Descriptive words for organizations
const organizationDescriptors = [
  'Collaborative', 'Community-focused', 'Innovative', 'Service-oriented',
  'Mission-driven', 'Inclusive', 'Adaptive', 'Transparent', 'Accountable',
  'Empowering', 'Sustainable', 'Impact-oriented', 'Values-based', 'Agile',
  'Democratic', 'Participatory', 'Strategic', 'Visionary', 'Ethical',
  'Responsive', 'Learning-oriented', 'Flexible', 'Networked', 'Holistic'
];

const LeadershipStructureWorkflowCompact: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [showDescriptorSelection, setShowDescriptorSelection] = useState(false);
  const [selectedDescriptors, setSelectedDescriptors] = useState<Set<string>>(new Set());
  const [organizationNotes, setOrganizationNotes] = useState('');
  const [showOrganizationSummary, setShowOrganizationSummary] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isFinal, setIsFinal] = useState(false);

  // Filter questions (same as before but with 6th option)
  const filterQuestions: FilterQuestion[] = [
    {
      id: 'size',
      question: 'What is the size of your organization?',
      options: [
        { 
          value: 'small', 
          label: 'Small (1-10 people)', 
          showFilters: ['flat', 'team-based', 'community-focused', 'flexible'],
          hideFilters: ['hierarchical', 'divisional', 'departmental']
        },
        { 
          value: 'medium', 
          label: 'Medium (11-50 people)', 
          showFilters: ['team-based', 'hybrid', 'matrix', 'distributed'],
          hideFilters: ['divisional', 'school-model']
        },
        { 
          value: 'large', 
          label: 'Large (50+ people)', 
          showFilters: ['all'],
          hideFilters: []
        }
      ]
    },
    {
      id: 'decision-style',
      question: 'How does your organization prefer to make decisions?',
      options: [
        { 
          value: 'collaborative', 
          label: 'Collaborative/Consensus', 
          showFilters: ['democratic', 'participative', 'flat', 'circular', 'team-based'],
          hideFilters: ['hierarchical', 'autocratic', 'transactional']
        },
        { 
          value: 'structured', 
          label: 'Structured with clear roles', 
          showFilters: ['matrix', 'functional', 'executive', 'strategic'],
          hideFilters: ['flat', 'circular']
        },
        { 
          value: 'flexible', 
          label: 'Flexible based on situation', 
          showFilters: ['hybrid', 'situational', 'adaptive', 'project-based'],
          hideFilters: ['hierarchical', 'autocratic']
        }
      ]
    },
    {
      id: 'community-engagement',
      question: 'How important is community engagement to your mission?',
      options: [
        { 
          value: 'critical', 
          label: 'Critical - Community is central', 
          showFilters: ['community-focused', 'servant', 'invitational', 'democratic', 'circular'],
          hideFilters: ['hierarchical', 'autocratic', 'divisional']
        },
        { 
          value: 'important', 
          label: 'Important - Regular engagement', 
          showFilters: ['distributed', 'participative', 'transformational'],
          hideFilters: ['autocratic', 'transactional']
        },
        { 
          value: 'moderate', 
          label: 'Moderate - Periodic engagement', 
          showFilters: ['all'],
          hideFilters: []
        }
      ]
    },
    {
      id: 'board-relationship',
      question: 'How does leadership interact with the board?',
      options: [
        { 
          value: 'integrated', 
          label: 'Highly integrated and collaborative', 
          showFilters: ['distributed', 'circular', 'matrix', 'democratic'],
          hideFilters: ['hierarchical', 'autocratic']
        },
        { 
          value: 'accountable', 
          label: 'Clear accountability and reporting', 
          showFilters: ['executive', 'functional', 'strategic'],
          hideFilters: ['laissez-faire', 'passive']
        },
        { 
          value: 'balanced', 
          label: 'Balanced partnership', 
          showFilters: ['hybrid', 'team-based', 'transformational'],
          hideFilters: ['autocratic', 'passive']
        }
      ]
    },
    {
      id: 'change-readiness',
      question: 'How does your organization approach change and innovation?',
      options: [
        { 
          value: 'innovative', 
          label: 'Embrace change and innovation', 
          showFilters: ['transformational', 'learning', 'adaptive', 'project-based', 'experimental'],
          hideFilters: ['hierarchical', 'bureaucratic', 'transactional']
        },
        { 
          value: 'evolutionary', 
          label: 'Gradual, thoughtful change', 
          showFilters: ['strategic', 'situational', 'hybrid'],
          hideFilters: ['passive', 'laissez-faire']
        },
        { 
          value: 'stable', 
          label: 'Prefer stability and proven methods', 
          showFilters: ['functional', 'departmental', 'managerial'],
          hideFilters: ['experimental', 'project-based']
        }
      ]
    }
  ];

  // Leadership structure data (abbreviated for top 5)
  const leadershipData: LeadershipItem[] = [
    // Top recommended structures
    {
      id: 'matrix',
      name: 'Matrix Structure',
      category: 'Organizational Structures',
      subcategory: 'Traditional Structures',
      rating: 'green',
      description: 'Excellent for non-profits as it allows multiple reporting relationships and cross-functional collaboration',
      filters: ['matrix', 'collaborative', 'flexible', 'distributed']
    },
    {
      id: 'flat',
      name: 'Flat/Horizontal Structure',
      category: 'Organizational Structures',
      subcategory: 'Modern Structures',
      rating: 'green',
      description: 'Promotes collaboration and community involvement while maintaining board oversight',
      filters: ['flat', 'horizontal', 'collaborative', 'democratic', 'community-focused']
    },
    {
      id: 'team-based',
      name: 'Team-based Structure',
      category: 'Organizational Structures',
      subcategory: 'Modern Structures',
      rating: 'green',
      description: 'Facilitates community engagement and collaborative decision-making',
      filters: ['team-based', 'collaborative', 'flexible', 'participative']
    },
    {
      id: 'circular',
      name: 'Circular Structure',
      category: 'Organizational Structures',
      subcategory: 'Modern Structures',
      rating: 'green',
      description: 'Prioritizes equality and collaboration, ideal for community-centered organizations',
      filters: ['circular', 'democratic', 'community-focused', 'participative']
    },
    {
      id: 'hybrid',
      name: 'Hybrid Structure',
      category: 'Organizational Structures',
      subcategory: 'Modern Structures',
      rating: 'green',
      description: 'Flexibility allows adaptation to community needs while maintaining board accountability',
      filters: ['hybrid', 'flexible', 'adaptive', 'situational']
    },
    // Add more structures as needed...
  ];

  // Handle filter selection
  const handleFilterSelect = (questionId: string, optionValue: string) => {
    const question = filterQuestions.find(q => q.id === questionId);
    const option = question?.options.find(o => o.value === optionValue);
    
    if (option) {
      const newFilters = new Set(selectedFilters);
      
      // Add show filters
      option.showFilters.forEach(filter => {
        if (filter !== 'all') {
          newFilters.add(filter);
        }
      });
      
      // Remove hide filters
      option.hideFilters.forEach(filter => newFilters.delete(filter));
      
      setSelectedFilters(newFilters);
      setCompletedQuestions(prev => new Set(prev).add(questionId));
    }
  };

  // Filter and sort items based on compatibility
  const sortedFilteredItems = useMemo(() => {
    let items = leadershipData;
    
    if (selectedFilters.size > 0) {
      // Score items based on filter matches
      items = leadershipData.map(item => {
        const matchCount = item.filters.filter(filter => selectedFilters.has(filter)).length;
        return { ...item, matchScore: matchCount };
      }).filter(item => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // Return top 5 most compatible
    return items.slice(0, 5);
  }, [selectedFilters]);

  // Handle descriptor selection
  const toggleDescriptor = (descriptor: string) => {
    setSelectedDescriptors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(descriptor)) {
        newSet.delete(descriptor);
      } else {
        newSet.add(descriptor);
      }
      return newSet;
    });
  };

  // Generate organization style description
  const generateOrganizationDescription = () => {
    const descriptorsList = Array.from(selectedDescriptors).join(', ');
    const topStructure = sortedFilteredItems[0];
    
    return `Based on your selections, your organization demonstrates a ${descriptorsList.toLowerCase()} approach. 
    The most compatible leadership structure is the ${topStructure?.name || 'Matrix Structure'}, which ${topStructure?.description.toLowerCase() || 'supports your organizational values'}.
    This structure aligns with your emphasis on ${completedQuestions.has('community-engagement') ? 'community engagement' : 'organizational efficiency'} 
    and ${completedQuestions.has('decision-style') ? 'collaborative decision-making' : 'structured processes'}.`;
  };

  // Complete selection and show summary
  const completeSelection = () => {
    setShowOrganizationSummary(true);
    toast.success('Leadership structure selection completed!');
  };

  // Export functionality
  const handleExport = () => {
    // Implementation for export
    toast.info('Exporting leadership structure report...');
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
    toast.info('Preparing document for printing...');
  };

  return (
    <div className="leadership-structure-workflow-compact">
      {/* Standardized Module Header */}
      <ModuleHeader
        title="Leadership Structure Selection"
        subtitle="Find the best leadership structure for your organization"
        icon={Filter}
        iconColor="text-purple-600"
        sectionId="leadership-structure"
        onLockToggle={(locked) => setIsLocked(locked)}
        onDraftToggle={(draft) => setIsDraft(draft)}
        onFinalToggle={(final) => setIsFinal(final)}
        onExport={handleExport}
        locked={isLocked}
        isDraft={isDraft}
        isFinal={isFinal}
        showStatusButtons={true}
      />

      <div className="p-6 bg-white">
        {!showOrganizationSummary ? (
          <>
            {/* Compact Question Section */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Answer these quick questions to find your ideal leadership structure.
              </p>
              
              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-3 ${
                      completedQuestions.has(question.id) ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completedQuestions.has(question.id) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {completedQuestions.has(question.id) ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">{question.question}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {question.options.map(option => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterSelect(question.id, option.value)}
                          className="text-xs px-3 py-2 rounded border bg-white hover:bg-blue-50 hover:border-blue-400 transition-colors text-left"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* 6th Option - Descriptor Words */}
                <div className={`border rounded-lg p-3 ${
                  showDescriptorSelection ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedDescriptors.size > 0 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {selectedDescriptors.size > 0 ? <Check className="w-4 h-4" /> : '6'}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">Describe your organization</h3>
                  </div>
                  <button
                    onClick={() => setShowDescriptorSelection(!showDescriptorSelection)}
                    className="w-full text-xs px-3 py-2 rounded border bg-white hover:bg-purple-50 hover:border-purple-400 transition-colors"
                  >
                    Click to select descriptive words
                  </button>
                </div>
              </div>

              {/* Descriptor Words Selection */}
              {showDescriptorSelection && (
                <div className="mt-4 p-4 border rounded-lg bg-purple-50">
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    Select words that best describe your organization:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {organizationDescriptors.map(descriptor => (
                      <button
                        key={descriptor}
                        onClick={() => toggleDescriptor(descriptor)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          selectedDescriptors.has(descriptor)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {descriptor}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top 5 Compatible Structures */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Top 5 Most Compatible Structures
              </h3>
              <div className="space-y-2">
                {sortedFilteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border ${
                      item.rating === 'green' ? 'bg-green-50 border-green-300' :
                      item.rating === 'yellow' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                      <span className="text-2xl">
                        {item.rating === 'green' ? '🟢' : item.rating === 'yellow' ? '🟡' : '🔴'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Selection Button */}
            <div className="flex justify-center">
              <button
                onClick={completeSelection}
                disabled={completedQuestions.size < 5 || selectedDescriptors.size === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  completedQuestions.size >= 5 && selectedDescriptors.size > 0
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Complete Selection & Generate Summary
              </button>
            </div>
          </>
        ) : (
          /* Organization Summary View */
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Your Organization's Leadership Style
              </h3>
              <p className="text-gray-700 mb-4">
                {generateOrganizationDescription()}
              </p>
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Selected Characteristics:</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedDescriptors).map(descriptor => (
                    <span
                      key={descriptor}
                      className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm"
                    >
                      {descriptor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Notes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Additional Notes
              </label>
              <textarea
                value={organizationNotes}
                onChange={(e) => setOrganizationNotes(e.target.value)}
                className="w-full p-3 border rounded-lg resize-none"
                rows={4}
                placeholder="Add any additional context about your organization's leadership needs..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowOrganizationSummary(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Selection
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Summary
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadershipStructureWorkflowCompact;