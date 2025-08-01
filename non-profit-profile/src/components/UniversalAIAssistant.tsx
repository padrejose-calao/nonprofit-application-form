/**
 * Universal AI Assistant Component
 * Provides AI assistance across the entire application, not just forms
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, HelpCircle, Lightbulb, AlertCircle,
  CheckCircle, Info, X, Send, ThumbsUp, ThumbsDown,
  Sparkles, BookOpen, Target, TrendingUp, Star,
  ChevronDown, ChevronUp, Mic, MicOff, Brain,
  FileText, Database, Settings, Search, Code,
  Users, Calendar, DollarSign, Globe, Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { logger } from '../utils/logger';

interface UniversalAIAssistantProps {
  context?: {
    page?: string;
    section?: string;
    data?: unknown;
  };
  onAction?: (action: string, payload: unknown) => void;
}

interface AssistantMessage {
  id: string;
  type: 'user' | 'assistant' | 'suggestion' | 'tip' | 'action';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ElementType;
  }>;
  helpful?: boolean;
  context?: string;
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  examples: string[];
}

const UniversalAIAssistant: React.FC<UniversalAIAssistantProps> = ({
  context,
  onAction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Capabilities across the application
  const capabilities: AICapability[] = [
    {
      id: 'form-help',
      name: 'Form Assistance',
      description: 'Help with filling out forms and applications',
      icon: FileText,
      examples: ['Help me write a mission statement', 'What should I put for board structure?']
    },
    {
      id: 'data-analysis',
      name: 'Data Analysis',
      description: 'Analyze your nonprofit data and provide insights',
      icon: Database,
      examples: ['Show donation trends', 'Analyze volunteer engagement']
    },
    {
      id: 'document-help',
      name: 'Document Management',
      description: 'Help organize and manage your documents',
      icon: FileText,
      examples: ['Find my 501c3 letter', 'Create a new grant proposal template']
    },
    {
      id: 'compliance',
      name: 'Compliance Guide',
      description: 'Guidance on nonprofit compliance and regulations',
      icon: Shield,
      examples: ['What are 990 filing requirements?', 'Board governance best practices']
    },
    {
      id: 'fundraising',
      name: 'Fundraising Support',
      description: 'Tips and strategies for fundraising',
      icon: DollarSign,
      examples: ['Grant writing tips', 'Donor engagement strategies']
    },
    {
      id: 'general-help',
      name: 'General Assistance',
      description: 'Any other questions or help you need',
      icon: HelpCircle,
      examples: ['How do I export data?', 'Explain EUID system']
    }
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: AssistantMessage = {
        id: '1',
        type: 'assistant',
        content: 'Hi! I\'m your AI assistant. I can help you with forms, documents, compliance, fundraising, and much more. What can I help you with today?',
        timestamp: new Date(),
        context: 'welcome'
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update unread count when minimized
  useEffect(() => {
    if (isMinimized && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant' || lastMessage.type === 'tip') {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isMinimized]);

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  const processUserInput = async (input: string) => {
    // Add user message
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateAIResponse(input);
      setMessages(prev => [...prev, response]);
      setIsThinking(false);
    }, 1000 + Math.random() * 1000);
  };

  const generateAIResponse = (input: string): AssistantMessage => {
    const lowerInput = input.toLowerCase();
    
    // Context-aware responses
    if (lowerInput.includes('mission statement')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'A strong mission statement should be clear, concise, and impactful. Here\'s a framework:\n\n1. **What** you do (your primary activities)\n2. **Who** you serve (your target beneficiaries)\n3. **Why** it matters (the impact or change you create)\n\nExample: "We provide educational resources and mentorship to underserved youth, empowering them to achieve academic success and career readiness."\n\nWould you like me to help you draft one based on your organization\'s work?',
        timestamp: new Date(),
        actions: [
          {
            label: 'Draft Mission Statement',
            action: () => onAction?.('draft-mission', {}),
            icon: Sparkles
          }
        ]
      };
    }

    if (lowerInput.includes('990') || lowerInput.includes('filing')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Form 990 is the annual information return for tax-exempt organizations. Key requirements:\n\n• **990-N (e-Postcard)**: For organizations with gross receipts ≤ $50,000\n• **990-EZ**: For organizations with gross receipts < $200,000 and assets < $500,000\n• **990**: For larger organizations\n\n**Filing deadline**: 15th day of the 5th month after your fiscal year ends\n\nNeed help preparing your 990 filing?',
        timestamp: new Date(),
        actions: [
          {
            label: 'View 990 Checklist',
            action: () => onAction?.('view-990-checklist', {}),
            icon: CheckCircle
          },
          {
            label: 'Set Filing Reminder',
            action: () => onAction?.('set-reminder', { type: '990-filing' }),
            icon: Calendar
          }
        ]
      };
    }

    if (lowerInput.includes('export') || lowerInput.includes('download')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'You can export your data in multiple formats:\n\n• **PDF**: Best for sharing and printing\n• **Excel**: Ideal for data analysis\n• **CSV**: For importing into other systems\n• **JSON**: For technical integrations\n\nYou can export from any page using the export button in the top menu, or I can help you export specific data now.',
        timestamp: new Date(),
        actions: [
          {
            label: 'Export Current Page',
            action: () => onAction?.('export', { format: 'pdf' }),
            icon: FileText
          }
        ]
      };
    }

    if (lowerInput.includes('euid')) {
      return {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'EUID (Entity Unique Identifier) is our system for tracking all entities:\n\n• **Companies**: C00001, C00002...\n• **Nonprofits**: N00001, N00002...\n• **Individuals**: I00001, I00002...\n• **Documents**: D00001, D00002...\n• **AI Assistants**: AI00001, AI00002...\n\nEach EUID is permanent and never reused. You can see the EUID in the top-right corner of any record. This ensures complete traceability and accountability.',
        timestamp: new Date()
      };
    }

    // Default helpful response
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: 'I\'m here to help! I can assist with:\n\n• Writing and improving content\n• Understanding compliance requirements\n• Managing documents and data\n• Fundraising strategies\n• Technical questions about the platform\n\nWhat specifically would you like help with?',
      timestamp: new Date(),
      actions: [
        {
          label: 'Show All Capabilities',
          action: () => setShowCapabilities(true),
          icon: Brain
        }
      ]
    };
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      processUserInput(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(!isListening);
      // Implement speech recognition
      toast.success(isListening ? 'Voice input stopped' : 'Listening...');
    } else {
      toast.error('Voice input not supported in your browser');
    }
  };

  const handleCapabilityClick = (capability: AICapability) => {
    const example = capability.examples[Math.floor(Math.random() * capability.examples.length)];
    setInputValue(example);
    setShowCapabilities(false);
  };

  const handleFeedback = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, helpful } : msg
    ));
    toast.success('Thanks for your feedback!');
    logger.info('AI feedback', { messageId, helpful });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-110 relative group"
        aria-label="Open AI Assistant"
      >
        <Brain className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          AI Assistant
        </span>
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
      isMinimized ? 'w-64 h-12' : 'w-96 h-[600px]'
    } flex flex-col`}>
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between cursor-pointer"
           onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span className="font-semibold">AI Assistant</span>
          {unreadCount > 0 && isMinimized && (
            <span className="bg-red-500 text-xs rounded-full px-2 py-1">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="hover:bg-indigo-700 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Capabilities */}
          {showCapabilities && messages.length === 1 && (
            <div className="p-4 border-b overflow-y-auto max-h-48">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">How can I help?</h3>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.map(cap => (
                  <button
                    key={cap.id}
                    onClick={() => handleCapabilityClick(cap)}
                    className="text-left p-2 rounded hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <cap.icon className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-medium">{cap.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.type === 'tip'
                    ? 'bg-yellow-50 text-yellow-900 border border-yellow-200'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.type === 'assistant' && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Brain className="w-4 h-4" />
                      <span className="text-xs font-semibold">AI Assistant</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={action.action}
                          className="flex items-center space-x-2 text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors duration-200"
                        >
                          {action.icon && <action.icon className="w-3 h-3" />}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Feedback buttons */}
                  {message.type === 'assistant' && (
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => handleFeedback(message.id, true)}
                        className={`p-1 rounded ${message.helpful === true ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, false)}
                        className={`p-1 rounded ${message.helpful === false ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleVoiceInput}
                className={`p-2 rounded ${isListening ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              AI can make mistakes. Verify important information.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UniversalAIAssistant;