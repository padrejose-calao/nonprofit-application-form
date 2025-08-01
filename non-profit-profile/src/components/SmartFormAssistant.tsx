import React, { useState, useEffect } from 'react';
import {
  MessageSquare, HelpCircle, Lightbulb, AlertCircle,
  CheckCircle, Info, X, Send, ThumbsUp, ThumbsDown,
  Sparkles, BookOpen, Target, TrendingUp, Star,
  ChevronDown, ChevronUp, Mic, MicOff
} from 'lucide-react';
import { toast } from 'react-toastify';

interface SmartFormAssistantProps {
  currentSection: string;
  currentField?: string;
  formData: unknown;
  errors: unknown;
  onSuggestion?: (field: string, value: unknown) => void;
}

interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant' | 'suggestion' | 'tip';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  helpful?: boolean;
}

interface ContextualHelp {
  section: string;
  field?: string;
  tips: string[];
  examples?: string[];
  commonMistakes?: string[];
  bestPractices?: string[];
}

const SmartFormAssistant: React.FC<SmartFormAssistantProps> = ({
  currentSection,
  currentField,
  formData,
  errors,
  onSuggestion
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Contextual help database
  const contextualHelp: ContextualHelp[] = [
    {
      section: 'basicInfo',
      field: 'ein',
      tips: [
        'EIN format should be XX-XXXXXXX',
        'You can find your EIN on your IRS determination letter',
        'If you don\'t have an EIN yet, you can apply online at IRS.gov'
      ],
      examples: ['12-3456789', '98-7654321'],
      commonMistakes: ['Using SSN instead of EIN', 'Missing hyphen', 'Wrong number of digits']
    },
    {
      section: 'basicInfo',
      field: 'orgName',
      tips: [
        'Use your organization\'s legal name as registered with the IRS',
        'Include any legal designations (Inc., LLC, etc.)',
        'Avoid abbreviations unless they\'re part of your legal name'
      ],
      bestPractices: [
        'Match the name exactly as it appears on your IRS determination letter',
        'If you use a DBA, list it separately in the DBA field'
      ]
    },
    {
      section: 'narrative',
      tips: [
        'Keep your mission statement concise (2-3 sentences)',
        'Focus on impact rather than activities',
        'Use clear, jargon-free language',
        'Include measurable outcomes when possible'
      ],
      examples: [
        'We provide educational opportunities to underserved youth in urban communities, helping them achieve academic success and career readiness.',
        'Our mission is to protect and preserve local wildlife habitats while educating the community about environmental conservation.'
      ]
    },
    {
      section: 'governance',
      field: 'boardMembers',
      tips: [
        'Most nonprofits have 5-15 board members',
        'Include diverse perspectives and expertise',
        'Ensure board members understand their fiduciary duties',
        'Consider term limits to bring fresh perspectives'
      ],
      bestPractices: [
        'Have odd number of board members to avoid tie votes',
        'Include members with financial, legal, and sector expertise',
        'Document board member roles and responsibilities'
      ]
    },
    {
      section: 'financials',
      tips: [
        'Be transparent about your financial position',
        'Include both restricted and unrestricted funds',
        'Show diverse revenue sources',
        'Demonstrate financial sustainability'
      ],
      commonMistakes: [
        'Not accounting for in-kind donations',
        'Forgetting to include volunteer hours value',
        'Mixing fiscal years'
      ]
    }
  ];

  // Smart suggestions based on form state
  const generateSmartSuggestions = () => {
    const suggestions: AssistantMessage[] = [];

    // Check for common issues
    if (currentSection === 'basicInfo' && !(formData as any).ein && !(formData as any).noEin) {
      suggestions.push({
        id: Date.now().toString(),
        type: 'suggestion',
        content: 'I noticed you haven\'t entered an EIN. If your organization doesn\'t have one yet, you can check the "No EIN" box and provide an explanation.',
        timestamp: new Date(),
        actions: [{
          label: 'Check No EIN',
          action: () => onSuggestion?.('noEin', true)
        }]
      });
    }

    // Progressive completion tips
    const sectionFields = Object.keys(formData as any).filter(key => 
      (key || '').toLowerCase().includes(currentSection.toLowerCase())
    );
    const filledFields = sectionFields.filter(field => (formData as any)[field]);
    const completionRate = (filledFields.length / sectionFields.length) * 100;

    if (completionRate < 50 && completionRate > 0) {
      suggestions.push({
        id: (Date.now() + 1).toString(),
        type: 'tip',
        content: `You're ${Math.round(completionRate)}% done with this section. Let me help you complete the remaining fields more efficiently.`,
        timestamp: new Date()
      });
    }

    // Error-based assistance
    const currentErrors = Object.keys(errors as any);
    if (currentErrors.length > 0) {
      suggestions.push({
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `I see you have ${currentErrors.length} field${currentErrors.length > 1 ? 's' : ''} that need${currentErrors.length === 1 ? 's' : ''} attention. Would you like me to guide you through fixing ${currentErrors.length === 1 ? 'it' : 'them'}?`,
        timestamp: new Date(),
        actions: [{
          label: 'Show me',
          action: () => highlightErrors(currentErrors)
        }]
      });
    }

    return suggestions;
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'assistant',
        content: 'Hi! I\'m your smart form assistant. I\'m here to help you complete your nonprofit profile efficiently. You can ask me questions or I\'ll provide contextual help as you fill out the form.',
        timestamp: new Date()
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Provide contextual help when section/field changes
  useEffect(() => {
    const help = contextualHelp.find(h => 
      h.section === currentSection && (!h.field || h.field === currentField)
    );

    if (help && isOpen) {
      const helpMessage: AssistantMessage = {
        id: Date.now().toString(),
        type: 'tip',
        content: help.tips[0],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, helpMessage]);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }

    // Generate smart suggestions
    const suggestions = generateSmartSuggestions();
    if (suggestions.length > 0 && isOpen) {
      setMessages(prev => [...prev, ...suggestions]);
    }
  }, [currentSection, currentField, formData, errors]);

  const highlightErrors = (errorFields: string[]) => {
    errorFields.forEach(field => {
      const element = document.querySelector(`[name="${field}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-red-500', 'animate-pulse');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-red-500', 'animate-pulse');
        }, 3000);
      }
    });
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Process user input and generate response
    setTimeout(() => {
      const response = generateResponse(inputValue);
      setMessages(prev => [...prev, response]);
    }, 500);

    setInputValue('');
  };

  const generateResponse = (userInput: string): AssistantMessage => {
    const input = userInput.toLowerCase();
    
    // Check for specific keywords
    if (input && (input.includes('help') || input.includes('?'))) {
      const relevantHelp = contextualHelp.find(h => h.section === currentSection);
      if (relevantHelp) {
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: relevantHelp.tips.join(' '),
          timestamp: new Date()
        };
      }
    }

    if (input && input.includes('example')) {
      const relevantHelp = contextualHelp.find(h => h.section === currentSection);
      if (relevantHelp?.examples) {
        return {
          id: Date.now().toString(),
          type: 'assistant',
          content: `Here are some examples: ${relevantHelp.examples.join(', ')}`,
          timestamp: new Date()
        };
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'I\'m here to help! Try asking about specific fields or sections, or I can provide examples and best practices.',
      timestamp: new Date()
    };
  };

  const rateResponse = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
    toast.success(helpful ? 'Thanks for the feedback!' : 'I\'ll try to improve!');
  };

  const quickActions = [
    {
      label: 'Show Examples',
      icon: BookOpen,
      action: () => {
        const help = contextualHelp.find(h => h.section === currentSection);
        if (help?.examples) {
          const message: AssistantMessage = {
            id: Date.now().toString(),
            type: 'assistant',
            content: `Examples for ${currentSection}: ${help.examples.join(', ')}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, message]);
        }
      }
    },
    {
      label: 'Best Practices',
      icon: Star,
      action: () => {
        const help = contextualHelp.find(h => h.section === currentSection);
        if (help?.bestPractices) {
          const message: AssistantMessage = {
            id: Date.now().toString(),
            type: 'tip',
            content: `Best practices: ${help.bestPractices.join('; ')}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, message]);
        }
      }
    },
    {
      label: 'Common Mistakes',
      icon: AlertCircle,
      action: () => {
        const help = contextualHelp.find(h => h.section === currentSection);
        if (help?.commonMistakes) {
          const message: AssistantMessage = {
            id: Date.now().toString(),
            type: 'assistant',
            content: `Common mistakes to avoid: ${help.commonMistakes.join('; ')}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, message]);
        }
      }
    }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setUnreadCount(0);
        }}
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-40"
        title="Open Smart Assistant"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-40 transition-all ${
      isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Smart Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-[340px]">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.type === 'tip'
                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
                      : message.type === 'suggestion'
                      ? 'bg-green-50 border border-green-200 text-green-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {message.type === 'tip' && <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                      {message.type === 'suggestion' && <Target className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm">{message.content}</p>
                        
                        {message.actions && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {message.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={action.action}
                                className="text-xs bg-white bg-opacity-90 text-blue-600 px-2 py-1 rounded hover:bg-opacity-100 transition-all"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {message.type === 'assistant' && message.helpful === undefined && (
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => rateResponse(message.id, true)}
                              className="text-xs text-gray-500 hover:text-green-600"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => rateResponse(message.id, false)}
                              className="text-xs text-gray-500 hover:text-red-600"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="px-4 py-2 border-t border-b bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Quick Actions</span>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Hide
                </button>
              </div>
              <div className="flex space-x-2">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className="flex items-center space-x-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
                    >
                      <IconComponent className="w-3 h-3" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-2 rounded-lg ${
                  isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-80`}
                title="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={sendMessage}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SmartFormAssistant;