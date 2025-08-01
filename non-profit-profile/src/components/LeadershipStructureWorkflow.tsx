import React, { useState, useMemo } from 'react';
import { Filter, ChevronDown, ChevronRight, Info } from 'lucide-react';

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

const LeadershipStructureWorkflow: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());

  // Filter questions that help narrow down appropriate structures
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

  // Leadership structure data
  const leadershipData: LeadershipItem[] = [
    // Organizational Structures - Traditional
    {
      id: 'hierarchical',
      name: 'Hierarchical/Bureaucratic Structure',
      category: 'Organizational Structures',
      subcategory: 'Traditional Structures',
      rating: 'red',
      description: 'Top-down approach conflicts with community listening and multiple accountability levels',
      filters: ['hierarchical', 'bureaucratic', 'traditional']
    },
    {
      id: 'functional',
      name: 'Functional Structure',
      category: 'Organizational Structures',
      subcategory: 'Traditional Structures',
      rating: 'yellow',
      description: 'Can work for larger non-profits but may create silos that limit community engagement',
      filters: ['functional', 'structured', 'departmental']
    },
    {
      id: 'divisional',
      name: 'Divisional Structure',
      category: 'Organizational Structures',
      subcategory: 'Traditional Structures',
      rating: 'red',
      description: 'Too corporate-focused; divisions operating independently conflict with unified board accountability',
      filters: ['divisional', 'corporate']
    },
    {
      id: 'matrix',
      name: 'Matrix Structure',
      category: 'Organizational Structures',
      subcategory: 'Traditional Structures',
      rating: 'green',
      description: 'Excellent for non-profits as it allows multiple reporting relationships and cross-functional collaboration',
      filters: ['matrix', 'collaborative', 'flexible', 'distributed']
    },

    // Organizational Structures - Modern
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
    {
      id: 'decentralized',
      name: 'Decentralized Structure',
      category: 'Organizational Structures',
      subcategory: 'Modern Structures',
      rating: 'yellow',
      description: 'Good for community responsiveness but may challenge unified board oversight',
      filters: ['decentralized', 'distributed', 'community-focused']
    },

    // Academic/Educational Structures
    {
      id: 'departmental',
      name: 'Departmental Model',
      category: 'Organizational Structures',
      subcategory: 'Academic/Educational Structures',
      rating: 'yellow',
      description: 'Traditional structure may work but can limit cross-functional collaboration',
      filters: ['departmental', 'academic', 'structured']
    },
    {
      id: 'integrative',
      name: 'Integrative Model',
      category: 'Organizational Structures',
      subcategory: 'Academic/Educational Structures',
      rating: 'green',
      description: 'Promotes collaboration across functions, supporting community engagement',
      filters: ['integrative', 'collaborative', 'academic']
    },
    {
      id: 'project-based-learning',
      name: 'Project-based Learning Model',
      category: 'Organizational Structures',
      subcategory: 'Academic/Educational Structures',
      rating: 'green',
      description: 'Flexible and responsive to community needs',
      filters: ['project-based', 'flexible', 'learning', 'experimental']
    },
    {
      id: 'academy',
      name: 'Academy Model',
      category: 'Organizational Structures',
      subcategory: 'Academic/Educational Structures',
      rating: 'yellow',
      description: 'Depends on implementation; could work for specialized non-profit services',
      filters: ['academy', 'academic', 'specialized']
    },
    {
      id: 'small-learning',
      name: 'Small Learning Communities',
      category: 'Organizational Structures',
      subcategory: 'Academic/Educational Structures',
      rating: 'green',
      description: 'Community-focused approach aligns with non-profit values',
      filters: ['small-learning', 'community-focused', 'collaborative']
    },
    {
      id: 'school-within-school',
      name: 'School-within-a-school Model',
      category: 'Organizational Structures',
      subcategory: 'Academic/Educational Structures',
      rating: 'yellow',
      description: 'May create unnecessary divisions in smaller non-profits',
      filters: ['school-model', 'academic']
    },

    // Leadership Structures - Governance
    {
      id: 'executive-leadership',
      name: 'Executive Leadership',
      category: 'Leadership Structures',
      subcategory: 'Governance Structures',
      rating: 'yellow',
      description: 'Necessary but must be balanced with board and community accountability',
      filters: ['executive', 'structured', 'accountable']
    },
    {
      id: 'academic-governing',
      name: 'Academic Governing Bodies',
      category: 'Leadership Structures',
      subcategory: 'Governance Structures',
      rating: 'green',
      description: 'Multiple stakeholder representation aligns with non-profit governance needs',
      filters: ['academic', 'participative', 'distributed']
    },
    {
      id: 'distributed-leadership',
      name: 'Distributed Leadership',
      category: 'Leadership Structures',
      subcategory: 'Governance Structures',
      rating: 'green',
      description: 'Shares power and responsibility, supporting community engagement',
      filters: ['distributed', 'collaborative', 'democratic', 'participative']
    },

    // Multi-dimensional Academic Models
    {
      id: 'baldridge',
      name: "Baldridge's Three Dimensions",
      category: 'Leadership Structures',
      subcategory: 'Multi-dimensional Academic Models',
      rating: 'green',
      description: 'Includes collegial and political dimensions supporting stakeholder involvement',
      filters: ['academic', 'multi-dimensional', 'participative']
    },
    {
      id: 'bolman-deal',
      name: "Bolman and Deal's Four-Cornered Frame",
      category: 'Leadership Structures',
      subcategory: 'Multi-dimensional Academic Models',
      rating: 'green',
      description: 'Comprehensive approach including human resource and symbolic frames',
      filters: ['academic', 'comprehensive', 'holistic']
    },
    {
      id: 'birnbaum',
      name: "Birnbaum's Five Dimensions",
      category: 'Leadership Structures',
      subcategory: 'Multi-dimensional Academic Models',
      rating: 'green',
      description: 'Comprehensive model supporting various stakeholder perspectives',
      filters: ['academic', 'comprehensive', 'multi-stakeholder']
    },

    // Leadership Styles
    {
      id: 'transformational',
      name: 'Transformational Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'green',
      description: 'Inspirational approach that engages all stakeholders in shared vision',
      filters: ['transformational', 'inspirational', 'visionary', 'innovative']
    },
    {
      id: 'instructional',
      name: 'Instructional Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'yellow',
      description: 'Education-specific but principles can apply to capacity building',
      filters: ['instructional', 'educational', 'learning']
    },
    {
      id: 'democratic-participative',
      name: 'Democratic/Participative Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'green',
      description: 'Perfect for non-profits requiring community input and board collaboration',
      filters: ['democratic', 'participative', 'collaborative', 'community-focused']
    },
    {
      id: 'constructivist',
      name: 'Constructivist Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'green',
      description: 'Collaborative problem-solving approach ideal for community challenges',
      filters: ['constructivist', 'collaborative', 'problem-solving']
    },
    {
      id: 'strategic',
      name: 'Strategic Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'yellow',
      description: 'Important for vision but must include community and board input',
      filters: ['strategic', 'visionary', 'planning']
    },
    {
      id: 'distributed-style',
      name: 'Distributed Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'green',
      description: 'Shares responsibility across organization and stakeholders',
      filters: ['distributed', 'shared', 'collaborative']
    },
    {
      id: 'invitational',
      name: 'Invitational Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'green',
      description: 'Inclusive approach valuing all stakeholder voices',
      filters: ['invitational', 'inclusive', 'participative', 'community-focused']
    },
    {
      id: 'transactional',
      name: 'Transactional Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'red',
      description: 'Too rigid and lacks flexibility for community responsiveness',
      filters: ['transactional', 'rigid']
    },
    {
      id: 'passive',
      name: 'Passive Leadership',
      category: 'Leadership Structures',
      subcategory: 'Leadership Styles in Education',
      rating: 'red',
      description: 'Insufficient accountability to board and community',
      filters: ['passive', 'laissez-faire']
    },

    // Leadership Philosophies
    {
      id: 'servant',
      name: 'Servant Leadership',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'green',
      description: 'Ideal for non-profits; prioritizes serving others and community',
      filters: ['servant', 'service-oriented', 'community-focused', 'altruistic']
    },
    {
      id: 'transformational-philosophy',
      name: 'Transformational Leadership Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'green',
      description: 'Vision-driven while engaging all stakeholders',
      filters: ['transformational', 'visionary', 'inspirational']
    },
    {
      id: 'responsible',
      name: 'Responsible Leadership',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'green',
      description: 'Explicitly focuses on community values and common good',
      filters: ['responsible', 'ethical', 'community-focused']
    },
    {
      id: 'ethical',
      name: 'Ethical Leadership',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'green',
      description: 'Values-based approach essential for non-profit trust',
      filters: ['ethical', 'values-based', 'principled']
    },
    {
      id: 'autocratic',
      name: 'Autocratic/Authoritarian Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'red',
      description: 'Conflicts with community input and board accountability',
      filters: ['autocratic', 'authoritarian', 'hierarchical']
    },
    {
      id: 'democratic-philosophy',
      name: 'Democratic Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'green',
      description: 'Ensures all voices heard, including community and board',
      filters: ['democratic', 'participative', 'inclusive']
    },
    {
      id: 'delegative',
      name: 'Delegative/Laissez-faire Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'red',
      description: 'Lacks necessary accountability structures',
      filters: ['delegative', 'laissez-faire', 'passive']
    },
    {
      id: 'situational-philosophy',
      name: 'Situational Leadership Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'green',
      description: 'Flexibility to respond to varying community needs',
      filters: ['situational', 'flexible', 'adaptive']
    },
    {
      id: 'charismatic',
      name: 'Charismatic Leadership Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'yellow',
      description: 'Can inspire but risks over-dependence on individual leader',
      filters: ['charismatic', 'inspirational']
    },
    {
      id: 'learning-philosophy',
      name: 'Learning Leadership Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'green',
      description: 'Promotes continuous improvement and adaptation',
      filters: ['learning', 'adaptive', 'growth-oriented']
    },
    {
      id: 'managerial',
      name: 'Managerial Leadership Philosophy',
      category: 'Leadership Philosophies',
      subcategory: 'Core Philosophies',
      rating: 'yellow',
      description: 'Task-focused approach may neglect relationship building',
      filters: ['managerial', 'task-focused', 'operational']
    },

    // Leadership Development - Training Methods
    {
      id: 'online-courses',
      name: 'Online Courses',
      category: 'Leadership Development',
      subcategory: 'Training Methods',
      rating: 'yellow',
      description: 'Cost-effective but may lack collaborative element',
      filters: ['online', 'training', 'flexible']
    },
    {
      id: 'onsite-training',
      name: 'On-Site Training/Seminars',
      category: 'Leadership Development',
      subcategory: 'Training Methods',
      rating: 'green',
      description: 'Promotes team building and shared learning',
      filters: ['onsite', 'training', 'collaborative']
    },
    {
      id: 'blended-learning',
      name: 'Blended Learning Formats',
      category: 'Leadership Development',
      subcategory: 'Training Methods',
      rating: 'green',
      description: 'Balances accessibility with collaboration',
      filters: ['blended', 'flexible', 'training']
    },
    {
      id: 'conferences',
      name: 'Conferences and Workshops',
      category: 'Leadership Development',
      subcategory: 'Training Methods',
      rating: 'green',
      description: 'Networking and learning from other non-profits',
      filters: ['conferences', 'networking', 'learning']
    },

    // Leadership Development - Program-Based
    {
      id: 'academic-programs',
      name: 'Academic Leadership Programs (ALP)',
      category: 'Leadership Development',
      subcategory: 'Program-Based Development',
      rating: 'green',
      description: 'Comprehensive approach building multiple competencies',
      filters: ['academic', 'comprehensive', 'program-based']
    },
    {
      id: 'executive-seminars',
      name: 'Department Executive Officers Seminars',
      category: 'Leadership Development',
      subcategory: 'Program-Based Development',
      rating: 'yellow',
      description: 'May be too specialized for general non-profit use',
      filters: ['executive', 'specialized', 'seminars']
    },
    {
      id: 'leadership-programs',
      name: 'Leadership Development Programs',
      category: 'Leadership Development',
      subcategory: 'Program-Based Development',
      rating: 'green',
      description: 'Builds capacity across organization',
      filters: ['leadership', 'development', 'capacity-building']
    },
    {
      id: 'rotation-programs',
      name: 'Rotation Programs',
      category: 'Leadership Development',
      subcategory: 'Program-Based Development',
      rating: 'green',
      description: 'Develops understanding of all organizational functions',
      filters: ['rotation', 'holistic', 'experiential']
    },

    // Leadership Development - Experiential Methods
    {
      id: 'mentoring',
      name: 'Mentoring Programs',
      category: 'Leadership Development',
      subcategory: 'Experiential Methods',
      rating: 'green',
      description: 'Builds relationships and transfers knowledge',
      filters: ['mentoring', 'relationship-based', 'knowledge-transfer']
    },
    {
      id: 'coaching',
      name: 'Coaching',
      category: 'Leadership Development',
      subcategory: 'Experiential Methods',
      rating: 'green',
      description: 'Personalized development supporting individual growth',
      filters: ['coaching', 'personalized', 'growth-oriented']
    },
    {
      id: 'peer-mentoring',
      name: 'Peer Mentoring',
      category: 'Leadership Development',
      subcategory: 'Experiential Methods',
      rating: 'green',
      description: 'Collaborative learning among equals',
      filters: ['peer-mentoring', 'collaborative', 'peer-based']
    },
    {
      id: 'problem-based',
      name: 'Problem-Based Learning',
      category: 'Leadership Development',
      subcategory: 'Experiential Methods',
      rating: 'green',
      description: 'Practical approach to real community challenges',
      filters: ['problem-based', 'practical', 'experiential']
    },

    // Leadership Development - Developmental Approaches
    {
      id: 'system-competence',
      name: 'Leadership as System Competence',
      category: 'Leadership Development',
      subcategory: 'Developmental Approaches',
      rating: 'green',
      description: 'Holistic view essential for non-profit complexity',
      filters: ['system', 'holistic', 'comprehensive']
    },
    {
      id: 'individual-competence',
      name: 'Leadership as Individual Competence',
      category: 'Leadership Development',
      subcategory: 'Developmental Approaches',
      rating: 'yellow',
      description: 'Important but insufficient without relational focus',
      filters: ['individual', 'personal-development']
    },
    {
      id: 'relational-competence',
      name: 'Leadership as Relational Competence',
      category: 'Leadership Development',
      subcategory: 'Developmental Approaches',
      rating: 'green',
      description: 'Critical for stakeholder engagement',
      filters: ['relational', 'stakeholder-focused', 'collaborative']
    },
    {
      id: 'competency-based',
      name: 'Competency-Based Development',
      category: 'Leadership Development',
      subcategory: 'Developmental Approaches',
      rating: 'green',
      description: 'Structured approach to building needed skills',
      filters: ['competency-based', 'structured', 'skill-building']
    },

    // Leadership Development - Support Structures
    {
      id: 'leadership-academies',
      name: 'Leadership Academies',
      category: 'Leadership Development',
      subcategory: 'Support Structures',
      rating: 'green',
      description: 'Comprehensive external development opportunities',
      filters: ['academies', 'external', 'comprehensive']
    },
    {
      id: 'learning-communities',
      name: 'Professional Learning Communities',
      category: 'Leadership Development',
      subcategory: 'Support Structures',
      rating: 'green',
      description: 'Collaborative networks for ongoing learning',
      filters: ['learning-communities', 'collaborative', 'ongoing']
    },
    {
      id: 'inhouse-development',
      name: 'In-House Professional Development Programs',
      category: 'Leadership Development',
      subcategory: 'Support Structures',
      rating: 'green',
      description: 'Tailored to specific organizational needs',
      filters: ['inhouse', 'tailored', 'customized']
    },
    {
      id: 'fellowships',
      name: 'Competitive Fellowships',
      category: 'Leadership Development',
      subcategory: 'Support Structures',
      rating: 'yellow',
      description: 'Exclusive nature may conflict with inclusive values',
      filters: ['fellowships', 'competitive', 'exclusive']
    }
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

  // Filter items based on selected filters
  const filteredItems = useMemo(() => {
    if (selectedFilters.size === 0) {
      return leadershipData;
    }
    
    return leadershipData.filter(item => {
      // If item has any of the selected filters, show it
      return item.filters.some(filter => selectedFilters.has(filter));
    });
  }, [selectedFilters]);

  // Group items by category and subcategory
  const groupedItems = useMemo(() => {
    const groups: Record<string, Record<string, LeadershipItem[]>> = {};
    
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = {};
      }
      const subcategory = item.subcategory || 'Other';
      if (!groups[item.category][subcategory]) {
        groups[item.category][subcategory] = [];
      }
      groups[item.category][subcategory].push(item);
    });
    
    return groups;
  }, [filteredItems]);

  // Get rating color and icon
  const getRatingDisplay = (rating: string) => {
    switch (rating) {
      case 'green':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: '🟢', label: 'Ideal' };
      case 'yellow':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '🟡', label: 'Neutral' };
      case 'red':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: '🔴', label: 'Not Recommended' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: '⚪', label: 'Unknown' };
    }
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedFilters(new Set());
    setCompletedQuestions(new Set());
  };

  return (
    <div className="leadership-structure-workflow p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Leadership Structure Selection</h2>
          {selectedFilters.size > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Reset all filters
            </button>
          )}
        </div>
        <p className="text-gray-600">
          Answer the questions below to filter and find the most appropriate leadership structures for your organization.
          {selectedFilters.size === 0 && ' All structures are currently visible.'}
        </p>
      </div>

      {/* Filter Questions */}
      <div className="space-y-6 mb-8">
        {filterQuestions.map((question, index) => (
          <div
            key={question.id}
            className={`border rounded-lg p-4 ${
              completedQuestions.has(question.id) ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  completedQuestions.has(question.id) ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-3">{question.question}</h3>
                <div className="space-y-2">
                  {question.options.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterSelect(question.id, option.value)}
                      className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                        completedQuestions.has(question.id) 
                          ? 'bg-white border-green-300 hover:bg-green-50'
                          : 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            Showing {filteredItems.length} of {leadershipData.length} structures
          </span>
        </div>
        {selectedFilters.size > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-blue-700">Active filters:</span>
            {Array.from(selectedFilters).map(filter => (
              <span key={filter} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                {filter}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Leadership Structures Display */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, subcategories]) => (
          <div key={category} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 flex items-center justify-between transition-colors"
            >
              <h3 className="font-semibold text-lg text-gray-900">{category}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {Object.values(subcategories).flat().length} items
                </span>
                {expandedCategories.has(category) ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>
            
            {expandedCategories.has(category) && (
              <div className="p-4 space-y-4">
                {Object.entries(subcategories).map(([subcategory, items]) => (
                  <div key={subcategory}>
                    <h4 className="font-medium text-gray-700 mb-2">{subcategory}</h4>
                    <div className="space-y-2">
                      {items.map(item => {
                        const rating = getRatingDisplay(item.rating);
                        return (
                          <div
                            key={item.id}
                            className={`p-3 rounded-md border ${rating.bg} ${
                              item.rating === 'green' ? 'border-green-300' :
                              item.rating === 'yellow' ? 'border-yellow-300' :
                              'border-red-300'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-xl flex-shrink-0">{rating.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-gray-900">{item.name}</h5>
                                  <span className={`text-xs px-2 py-1 rounded ${rating.color} ${rating.bg}`}>
                                    {rating.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{item.description}</p>
                              </div>
                              <button className="text-gray-400 hover:text-gray-600">
                                <Info className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {filteredItems.filter(item => item.rating === 'green').length}
            </div>
            <div className="text-sm text-gray-600">🟢 Ideal</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredItems.filter(item => item.rating === 'yellow').length}
            </div>
            <div className="text-sm text-gray-600">🟡 Neutral</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {filteredItems.filter(item => item.rating === 'red').length}
            </div>
            <div className="text-sm text-gray-600">🔴 Not Recommended</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipStructureWorkflow;