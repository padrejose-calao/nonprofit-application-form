import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle, Lightbulb, X, Send, ThumbsUp, ThumbsDown,
  Sparkles, BookOpen,
  ChevronDown, ChevronUp, Bot,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';

interface EnhancedSmartAssistantProps {
  currentSection: string;
  currentField?: string;
  formData: unknown;
  errors: unknown;
  onSuggestion?: (field: string, value: unknown) => void;
  apiKeys: unknown;
  isEnabled: boolean;
}

interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant' | 'suggestion' | 'tip' | 'error';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.FC<unknown>;
  }>;
  helpful?: boolean;
  source?: string;
}

const EnhancedSmartAssistant: React.FC<EnhancedSmartAssistantProps> = ({
  currentSection,
  currentField,
  formData,
  errors,
  onSuggestion,
  apiKeys,
  isEnabled
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiProvider, _setAiProvider] = useState<'huggingface' | 'cohere' | 'none'>('none');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Field-specific help database
  const fieldHelp = {
    organizationName: {
      tips: [
        'Use your organization\'s legal name as registered',
        'Include Inc., LLC, or other legal designations',
        'Avoid abbreviations unless officially registered'
      ],
      examples: ['ABC Foundation, Inc.', 'Community Health Services LLC'],
      validation: ['Must match IRS records', 'No special characters except punctuation']
    },
    ein: {
      tips: [
        'Format: XX-XXXXXXX (9 digits with hyphen)',
        'Can be found on your IRS determination letter',
        'Must match exactly with IRS records'
      ],
      examples: ['12-3456789', '98-7654321'],
      validation: ['Required for 501(c)(3) status', 'Automatically verified against IRS database']
    },
    missionStatement: {
      tips: [
        'Keep it concise - ideally under 150 words',
        'Focus on what you do, who you serve, and your impact',
        'Use active voice and avoid jargon'
      ],
      examples: [
        'To provide educational resources and mentorship to underserved youth in urban communities',
        'Empowering families through affordable housing and financial literacy programs'
      ],
      bestPractices: [
        'Start with an action verb',
        'Be specific about your target population',
        'Include measurable outcomes when possible'
      ]
    },
    programBudget: {
      tips: [
        'Include all direct program costs',
        'Separate from administrative expenses',
        'Should align with your Form 990'
      ],
      validation: ['Must be numeric', 'Should represent at least 65% of total budget for efficiency']
    }
  };

  useEffect(() => {
    if (!isEnabled) {
      setIsOpen(false);
      return;
    }

    // Initialize with welcome message
    if (messages.length === 0) {
      addMessage({
        type: 'assistant',
        content: 'Hi! I\'m your AI form assistant. I can help you fill out this form accurately and provide real-time suggestions. Ask me anything!',
        actions: [
          {
            label: 'Get Started',
            action: () => showSectionHelp(),
            icon: Sparkles as any
          },
          {
            label: 'View Tips',
            action: () => showFieldTips(),
            icon: Lightbulb as any
          }
        ]
      });
    }
  }, [isEnabled]);

  useEffect(() => {
    // Auto-suggest based on current field
    if (currentField && isOpen) {
      const help = fieldHelp[currentField as keyof typeof fieldHelp];
      if (help && Math.random() > 0.7) { // Don't overwhelm with suggestions
        showFieldSpecificHelp(currentField);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentField]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Omit<AssistantMessage, 'id' | 'timestamp'>) => {
    const newMessage: AssistantMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    
    if (message.type === 'assistant' && !isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const showFieldSpecificHelp = (field: string) => {
    const help = fieldHelp[field as keyof typeof fieldHelp];
    if (!help) return;

    let content = `📋 **${field.replace(/([A-Z])/g, ' $1').trim()}**\n\n`;
    
    if (help.tips.length > 0) {
      content += '💡 **Tips:**\n' + help.tips.map(tip => `• ${tip}`).join('\n') + '\n\n';
    }
    
    if ('examples' in help && help.examples && help.examples.length > 0) {
      content += '📝 **Examples:**\n' + help.examples.map((ex: string) => `• ${ex}`).join('\n') + '\n\n';
    }
    
    if ('validation' in help && help.validation) {
      content += '✅ **Validation:**\n' + help.validation.map((val: string) => `• ${val}`).join('\n');
    }

    addMessage({
      type: 'tip',
      content,
      actions: [
        {
          label: 'Apply Example',
          action: () => {
            if ('examples' in help && help.examples && help.examples[0] && onSuggestion) {
              onSuggestion(field, help.examples[0]);
              toast.success('Example applied to field');
            }
          }
        }
      ]
    });
  };

  const showSectionHelp = () => {
    const sectionHelps = {
      basicInfo: 'Let\'s start with your organization\'s basic information. This includes legal name, EIN, and contact details.',
      contact: 'Add your primary contact person and organization address. This should be someone authorized to speak on behalf of the organization.',
      missionVision: 'Describe your organization\'s purpose and long-term goals. Be clear and inspiring!',
      programsServices: 'Detail your programs and services. Include target populations, outcomes, and impact metrics.',
      financials: 'Provide accurate financial information. This should match your most recent Form 990.'
    };

    const help = sectionHelps[currentSection as keyof typeof sectionHelps] || 
                 'Fill out this section completely and accurately.';

    addMessage({
      type: 'assistant',
      content: `📌 **${currentSection.replace(/([A-Z])/g, ' $1').trim()} Section**\n\n${help}`
    });
  };

  const showFieldTips = () => {
    const tips = [
      '💡 Press Tab to move to the next field',
      '💡 Required fields are marked with a red asterisk (*)',
      '💡 Save your progress frequently with Ctrl+S',
      '💡 Use the N/A checkbox for non-applicable fields',
      '💡 Green checkmarks indicate completed fields'
    ];

    addMessage({
      type: 'tip',
      content: '**Quick Tips:**\n\n' + tips.join('\n')
    });
  };

  const processUserQuery = async (query: string) => {
    setIsProcessing(true);
    
    // Add user message
    addMessage({
      type: 'user',
      content: query
    });

    try {
      // Check for common queries first
      const response = await handleCommonQueries(query);
      
      if (response) {
        const typedResponse = response as any;
        addMessage({
          type: 'assistant',
          content: typedResponse.content,
          actions: typedResponse.actions,
          source: typedResponse.source
        });
      } else if (aiProvider !== 'none' && (apiKeys as any)?.[aiProvider]) {
        // Use AI provider if available
        const aiResponse = await queryAIProvider(query);
        addMessage({
          type: 'assistant',
          content: aiResponse,
          source: aiProvider
        });
      } else {
        // Fallback to pattern matching
        const fallbackResponse = generateFallbackResponse(query);
        addMessage({
          type: 'assistant',
          content: fallbackResponse
        });
      }
    } catch (error) {
      addMessage({
        type: 'error',
        content: 'Sorry, I encountered an error. Please try rephrasing your question.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommonQueries = async (query: string): Promise<unknown> => {
    const lowerQuery = query.toLowerCase();
    
    // EIN validation
    if (lowerQuery.includes('ein') || lowerQuery.includes('tax id')) {
      return {
        content: 'Your EIN (Employer Identification Number) is a 9-digit federal tax ID. Format it as XX-XXXXXXX. You can find it on your IRS determination letter or Form 990.',
        actions: [{
          label: 'Validate EIN',
          action: () => {
            const ein = (formData as any)?.ein;
            if (ein && /^\d{2}-\d{7}$/.test(ein)) {
              toast.success('EIN format is valid!');
            } else {
              toast.error('EIN should be in format: XX-XXXXXXX');
            }
          }
        }]
      };
    }

    // Budget help
    if (lowerQuery.includes('budget') || lowerQuery.includes('financial')) {
      return {
        content: 'For budget information:\n\n• **Program Budget**: Direct costs for your programs/services\n• **Admin Budget**: Management and general expenses\n• **Fundraising Budget**: Costs to raise funds\n\nBest practice: Programs should be 65-75% of total budget.',
        actions: [{
          label: 'Calculate Percentages',
          action: () => {
            const total = ((formData as any)?.programBudget || 0) + ((formData as any)?.adminBudget || 0) + ((formData as any)?.fundraisingBudget || 0);
            if (total > 0) {
              const programPct = (((formData as any)?.programBudget || 0) / total * 100).toFixed(1);
              toast.info(`Program expenses are ${programPct}% of total budget`);
            }
          }
        }]
      };
    }

    // Board composition
    if (lowerQuery.includes('board') || lowerQuery.includes('directors')) {
      return {
        content: 'Board requirements:\n\n• Minimum 3 members (5-15 recommended)\n• No more than 49% can be related\n• Should include diverse skills and backgrounds\n• Officers typically include President, Secretary, Treasurer',
        actions: [{
          label: 'Add Board Member',
          action: () => toast.info('Navigate to Board section to add members')
        }]
      };
    }

    return null;
  };

  const queryAIProvider = async (query: string): Promise<string> => {
    // This would integrate with free AI APIs like Hugging Face
    // For now, return a placeholder
    return `I understand you're asking about "${query}". While I don't have direct AI access configured yet, I can help with form-specific guidance. What field or section do you need help with?`;
  };

  const generateFallbackResponse = (query: string): string => {
    const responses = [
      'I can help you with that! Could you be more specific about which field or section you\'re working on?',
      'Great question! Let me provide some general guidance while you work on this form.',
      'I\'m here to help! Try clicking on a specific field and I\'ll provide targeted assistance.',
      'That\'s an important consideration. Make sure to review the requirements for this section carefully.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && !isProcessing) {
      processUserQuery(inputValue.trim());
      setInputValue('');
    }
  };

  const handleMessageRating = (messageId: string, isHelpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful: isHelpful } : msg
    ));
    toast.success(isHelpful ? 'Thanks for the feedback!' : 'Sorry to hear that. I\'ll try to improve!');
  };

  return (
    <>
      {/* Floating Assistant Button - Always visible, changes color based on enabled state */}
      <button
        onClick={() => {
          if (!isEnabled) {
            toast.info('AI Assistant is currently disabled. Enable it in settings.');
            return;
          }
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className={`fixed bottom-6 right-6 ${isEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-full p-4 shadow-lg z-40 transition-all`}
        title={isEnabled ? "AI Form Assistant" : "AI Assistant (Disabled)"}
      >
        <Bot className="w-6 h-6" />
        {isEnabled && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        {isEnabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Assistant Chat Window */}
      {isOpen && isEnabled && (
        <div className={`fixed bottom-24 right-6 bg-white rounded-lg shadow-xl border border-gray-200 transition-all z-50 ${
          isMinimized ? 'h-16' : 'h-[500px] w-[400px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">AI Form Assistant</span>
              {isProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded"
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setUnreadCount(0);
                }}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[350px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white rounded-l-lg rounded-br-lg'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-800 rounded-r-lg rounded-bl-lg'
                        : message.type === 'tip'
                        ? 'bg-yellow-100 text-yellow-800 rounded-r-lg rounded-bl-lg'
                        : 'bg-gray-100 text-gray-800 rounded-r-lg rounded-bl-lg'
                    } p-3`}>
                      {message.type === 'assistant' && (
                        <div className="flex items-start space-x-2 mb-1">
                          <Bot className="w-4 h-4 mt-0.5" />
                          <span className="text-xs font-medium">Assistant</span>
                          {message.source && (
                            <span className="text-xs opacity-75">via {message.source}</span>
                          )}
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.actions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={action.action}
                              className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded flex items-center space-x-1"
                            >
                              {action.icon && React.createElement(action.icon as any, { className: "w-3 h-3" })}
                              <span>{action.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {message.type === 'assistant' && message.helpful === undefined && (
                        <div className="mt-2 flex items-center space-x-2">
                          <button
                            onClick={() => handleMessageRating(message.id, true)}
                            className="text-xs opacity-60 hover:opacity-100"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMessageRating(message.id, false)}
                            className="text-xs opacity-60 hover:opacity-100"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="border-t p-2 flex flex-wrap gap-2">
                <button
                  onClick={() => showFieldSpecificHelp(currentField || 'general')}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                >
                  <HelpCircle className="w-3 h-3 inline mr-1" />
                  Current Field Help
                </button>
                <button
                  onClick={showFieldTips}
                  className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                >
                  <Lightbulb className="w-3 h-3 inline mr-1" />
                  Tips
                </button>
                <button
                  onClick={showSectionHelp}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                >
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  Section Guide
                </button>
              </div>

              {/* Input Area */}
              <div className="border-t p-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isProcessing || !inputValue.trim()}
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default EnhancedSmartAssistant;