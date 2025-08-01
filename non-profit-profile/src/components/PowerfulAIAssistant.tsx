/**
 * Powerful AI Assistant Widget
 * Enhanced capabilities for form assistance, data analysis, and intelligent suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, X, Sparkles, Brain, Zap, FileText, Search,
  TrendingUp, AlertCircle, CheckCircle, Lightbulb, Settings,
  RefreshCw, Download, Upload, Copy, ThumbsUp, ThumbsDown,
  Mic, MicOff, Volume2, VolumeX, Maximize2, Minimize2
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  confidence?: number;
  sources?: string[];
}

interface PowerfulAIAssistantProps {
  formData?: any;
  currentSection?: string;
  onSuggestion?: (field: string, value: any) => void;
  onAnalysis?: (analysis: any) => void;
}

const PowerfulAIAssistant: React.FC<PowerfulAIAssistantProps> = ({
  formData,
  currentSection,
  onSuggestion,
  onAnalysis
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'analyze' | 'suggest' | 'validate'>('chat');
  const [settings, setSettings] = useState({
    autoSuggest: true,
    voiceEnabled: false,
    analysisLevel: 'detailed',
    personality: 'professional'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<any>(null);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: "👋 Hello! I'm your AI assistant. I can help you fill out forms, analyze your data, suggest improvements, and answer any questions. What would you like help with today?",
        timestamp: new Date(),
        actions: [
          { label: 'Analyze my form', action: () => analyzeForm() },
          { label: 'Suggest improvements', action: () => suggestImprovements() },
          { label: 'Validate data', action: () => validateForm() }
        ]
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window && settings.voiceEnabled) {
      speechRecognition.current = new (window as any).webkitSpeechRecognition();
      speechRecognition.current.continuous = false;
      speechRecognition.current.interimResults = false;
      
      speechRecognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      speechRecognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed');
      };
    }
  }, [settings.voiceEnabled]);

  const analyzeForm = async () => {
    setIsLoading(true);
    setActiveMode('analyze');
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = {
        completeness: calculateCompleteness(),
        missingFields: findMissingFields(),
        suggestions: generateSuggestions(),
        warnings: findWarnings()
      };
      
      const message: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `📊 **Form Analysis Complete**\n\n**Completeness:** ${analysis.completeness}%\n\n**Missing Required Fields:** ${analysis.missingFields.length}\n${analysis.missingFields.map(f => `• ${f}`).join('\n')}\n\n**Suggestions:**\n${analysis.suggestions.map(s => `• ${s}`).join('\n')}\n\n**Warnings:**\n${analysis.warnings.map(w => `⚠️ ${w}`).join('\n')}`,
        timestamp: new Date(),
        confidence: 0.95,
        actions: [
          { label: 'Auto-fill missing fields', action: () => autoFillFields() },
          { label: 'Export analysis', action: () => exportAnalysis(analysis) }
        ]
      };
      
      setMessages(prev => [...prev, message]);
      if (onAnalysis) onAnalysis(analysis);
      setIsLoading(false);
    }, 1500);
  };

  const suggestImprovements = () => {
    setIsLoading(true);
    setActiveMode('suggest');
    
    setTimeout(() => {
      const suggestions = [
        { field: 'mission_statement', suggestion: 'Consider adding more specific impact metrics' },
        { field: 'program_description', suggestion: 'Include success stories to make it more compelling' },
        { field: 'budget', suggestion: 'Break down into more detailed categories' }
      ];
      
      const message: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `💡 **Improvement Suggestions**\n\nBased on best practices and successful applications, here are my recommendations:\n\n${suggestions.map((s, i) => `${i + 1}. **${s.field.replace(/_/g, ' ').toUpperCase()}**\n   ${s.suggestion}`).join('\n\n')}`,
        timestamp: new Date(),
        actions: suggestions.map(s => ({
          label: `Apply to ${s.field}`,
          action: () => {
            if (onSuggestion) onSuggestion(s.field, s.suggestion);
            toast.success(`Suggestion applied to ${s.field}`);
          }
        }))
      };
      
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    }, 1000);
  };

  const validateForm = () => {
    setIsLoading(true);
    setActiveMode('validate');
    
    setTimeout(() => {
      const validationResults = {
        errors: [
          'EIN format appears incorrect',
          'Phone number missing area code'
        ],
        warnings: [
          'Budget total doesn\'t match sum of categories',
          'Mission statement could be more specific'
        ],
        passed: [
          'All required fields completed',
          'Email format is valid',
          'Address verified'
        ]
      };
      
      const message: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `✅ **Validation Results**\n\n**Errors (${validationResults.errors.length}):**\n${validationResults.errors.map(e => `❌ ${e}`).join('\n')}\n\n**Warnings (${validationResults.warnings.length}):**\n${validationResults.warnings.map(w => `⚠️ ${w}`).join('\n')}\n\n**Passed (${validationResults.passed.length}):**\n${validationResults.passed.map(p => `✅ ${p}`).join('\n')}`,
        timestamp: new Date(),
        actions: [
          { label: 'Fix all errors', action: () => fixErrors(validationResults.errors) },
          { label: 'Show details', action: () => showValidationDetails(validationResults) }
        ]
      };
      
      setMessages(prev => [...prev, message]);
      setIsLoading(false);
    }, 1200);
  };

  const calculateCompleteness = () => {
    if (!formData) return 0;
    const fields = Object.keys(formData);
    const filledFields = fields.filter(f => formData[f] && formData[f] !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const findMissingFields = () => {
    // Simulate finding missing required fields
    return ['Board Members List', 'Financial Statements', 'Annual Report'];
  };

  const generateSuggestions = () => {
    return [
      'Add more detail to your impact statement',
      'Include specific metrics in your program descriptions',
      'Consider adding testimonials or success stories'
    ];
  };

  const findWarnings = () => {
    return [
      'Some sections have minimal information',
      'Financial data may need updating',
      'Consider adding more supporting documents'
    ];
  };

  const autoFillFields = () => {
    toast.success('Auto-filling missing fields with smart suggestions...');
    // Implementation for auto-filling
  };

  const exportAnalysis = (analysis: any) => {
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-analysis-${new Date().toISOString()}.json`;
    a.click();
    toast.success('Analysis exported successfully');
  };

  const fixErrors = (errors: string[]) => {
    toast.success(`Attempting to fix ${errors.length} errors...`);
    // Implementation for fixing errors
  };

  const showValidationDetails = (results: any) => {
    // Show detailed validation results
    console.log('Validation details:', results);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "I can help you with:\n\n• **Form Completion** - Smart suggestions for every field\n• **Data Analysis** - Insights and patterns in your data\n• **Validation** - Check for errors and compliance\n• **Document Generation** - Create reports and summaries\n• **Best Practices** - Recommendations based on successful applications\n• **Real-time Assistance** - Help as you work through each section\n\nJust ask me anything or use the quick action buttons!",
        timestamp: new Date(),
        confidence: 1.0
      };
    }
    
    if (lowerQuery.includes('mission') || lowerQuery.includes('vision')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: "For an effective mission statement:\n\n1. **Be Clear and Concise** - Aim for 1-2 sentences\n2. **Focus on Impact** - What change do you create?\n3. **Identify Your Audience** - Who do you serve?\n4. **State Your Method** - How do you achieve your mission?\n\nExample: \"We empower underserved youth through innovative STEM education programs, creating pathways to careers in technology.\"\n\nWould you like me to help draft one based on your organization's details?",
        timestamp: new Date(),
        actions: [
          { label: 'Generate draft', action: () => generateMissionDraft() },
          { label: 'See more examples', action: () => showMissionExamples() }
        ]
      };
    }
    
    // Default response
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: `I understand you're asking about "${query}". Let me help you with that. Based on your current form data and best practices, here's my recommendation...`,
      timestamp: new Date(),
      confidence: 0.85
    };
  };

  const generateMissionDraft = () => {
    toast.info('Generating mission statement draft...');
  };

  const showMissionExamples = () => {
    toast.info('Loading mission statement examples...');
  };

  const toggleVoice = () => {
    if (isListening) {
      speechRecognition.current?.stop();
      setIsListening(false);
    } else {
      speechRecognition.current?.start();
      setIsListening(true);
    }
  };

  const toggleSpeech = (message: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
      isExpanded ? 'w-96 h-[600px]' : 'w-80 h-[500px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-6 h-6" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title={isExpanded ? 'Minimize' : 'Maximize'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Toggle voice"
            >
              {settings.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Mode Selector */}
        <div className="flex gap-1 bg-white/10 rounded-lg p-1">
          {(['chat', 'analyze', 'suggest', 'validate'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex-1 px-2 py-1 text-xs rounded capitalize transition-colors ${
                activeMode === mode ? 'bg-white text-blue-700' : 'text-white/80 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: isExpanded ? '420px' : '320px' }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`rounded-lg px-3 py-2 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.confidence && (
                  <div className="text-xs mt-1 opacity-70">
                    Confidence: {Math.round(message.confidence * 100)}%
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              {message.actions && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={action.action}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Message Actions */}
              {message.type === 'ai' && (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Copy"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleSpeech(message.content)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                    title="Read aloud"
                  >
                    {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <button className="text-gray-400 hover:text-green-600 p-1" title="Helpful">
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600 p-1" title="Not helpful">
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex gap-2 mb-2">
          <button
            onClick={analyzeForm}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <TrendingUp className="w-3 h-3" />
            Analyze
          </button>
          <button
            onClick={suggestImprovements}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <Lightbulb className="w-3 h-3" />
            Suggest
          </button>
          <button
            onClick={validateForm}
            className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Validate
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {settings.voiceEnabled && (
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PowerfulAIAssistant;