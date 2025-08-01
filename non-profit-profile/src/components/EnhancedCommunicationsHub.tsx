import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, MessageSquare, Upload, Share, FileText, Send, Users, Shield, 
  AlertCircle, CheckCircle, Clock, Zap, ExternalLink, Smartphone, 
  Wifi, Cloud, Lock, Key, Bell, Filter, Download, Paperclip, Image,
  Inbox, Archive, Star, Trash2, Tag, Phone, Video, Bot, QrCode,
  Copy, RefreshCw, MoreVertical, Search, ChevronRight, Settings,
  Globe, Layers, Database, FileText as Fax, X
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  type: 'email' | 'whatsapp' | 'sms' | 'fax' | 'internal' | 'document';
  sender: string;
  senderEmail?: string;
  senderPhone?: string;
  profileCode?: string;
  recipient: string;
  subject?: string;
  content: string;
  attachments: Attachment[];
  timestamp: Date;
  status: 'unread' | 'read' | 'replied' | 'forwarded' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category?: string;
  tags: string[];
  threadId?: string;
  isStarred: boolean;
  metadata?: any;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  category: string;
}

interface EnhancedCommunicationsHubProps {
  userRole: 'admin' | 'user';
  onClose: () => void;
  profileCode: string;
  profileEmail: string;
  adminEmail: string;
  whatsappCode: string;
}

const EnhancedCommunicationsHub: React.FC<EnhancedCommunicationsHubProps> = ({
  userRole,
  onClose,
  profileCode,
  profileEmail,
  adminEmail,
  whatsappCode
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'templates' | 'settings' | 'queue'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
    dateRange: 'all',
    search: ''
  });
  const [composeData, setComposeData] = useState({
    type: 'email' as 'email' | 'whatsapp' | 'sms',
    recipient: '',
    subject: '',
    content: '',
    attachments: [] as File[],
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  });
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [documentQueue, setDocumentQueue] = useState<Attachment[]>([]);
  const [settings, setSettings] = useState({
    emailIntegration: {
      enabled: true,
      gmail: profileEmail,
      autoReply: false,
      signature: ''
    },
    whatsappIntegration: {
      enabled: true,
      businessNumber: '',
      autoReply: false,
      welcomeMessage: `Hi! You've reached ${profileCode}. Please send your documents and we'll process them shortly.`
    },
    notifications: {
      email: true,
      desktop: true,
      mobile: false,
      sound: true
    },
    autoProcessing: {
      enabled: true,
      rules: [] as any[]
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with sample data
  useEffect(() => {
    loadMessages();
    loadTemplates();
    loadDocumentQueue();
  }, []);

  const loadMessages = () => {
    // Load from localStorage or API
    const stored = localStorage.getItem(`messages_${profileCode}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      setMessages(parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } else {
      // Sample messages
      setMessages([
        {
          id: '1',
          type: 'email',
          sender: 'John Doe',
          senderEmail: 'john@example.com',
          recipient: profileEmail,
          subject: 'Board Meeting Minutes',
          content: 'Please find attached the minutes from our last board meeting.',
          attachments: [],
          timestamp: new Date(),
          status: 'unread',
          priority: 'normal',
          tags: ['board', 'meeting'],
          isStarred: false
        },
        {
          id: '2',
          type: 'whatsapp',
          sender: 'Jane Smith',
          senderPhone: '+1234567890',
          profileCode: whatsappCode,
          recipient: 'Organization',
          content: 'Documents uploaded for review',
          attachments: [
            {
              id: 'a1',
              name: '501c3_certificate.pdf',
              type: 'application/pdf',
              size: 245760,
              url: '#',
              uploadedAt: new Date(),
              status: 'pending'
            }
          ],
          timestamp: new Date(Date.now() - 3600000),
          status: 'read',
          priority: 'high',
          tags: ['documents', 'compliance'],
          isStarred: true
        }
      ]);
    }
  };

  const loadTemplates = () => {
    const defaultTemplates: CommunicationTemplate[] = [
      {
        id: 't1',
        name: 'Welcome Email',
        type: 'email',
        subject: 'Welcome to {{organizationName}}',
        content: 'Dear {{name}},\n\nWelcome to our organization! We\'re excited to have you join us.\n\nBest regards,\n{{senderName}}',
        variables: ['organizationName', 'name', 'senderName'],
        category: 'onboarding'
      },
      {
        id: 't2',
        name: 'Document Request',
        type: 'whatsapp',
        content: 'Hi {{name}}, we need the following documents: {{documentList}}. Please upload them using code: {{code}}',
        variables: ['name', 'documentList', 'code'],
        category: 'documents'
      },
      {
        id: 't3',
        name: 'Meeting Reminder',
        type: 'email',
        subject: 'Reminder: {{meetingTitle}} - {{date}}',
        content: 'This is a reminder about the upcoming {{meetingTitle}} scheduled for {{date}} at {{time}}.\n\nLocation: {{location}}\n\nPlease confirm your attendance.',
        variables: ['meetingTitle', 'date', 'time', 'location'],
        category: 'meetings'
      }
    ];
    setTemplates(defaultTemplates);
  };

  const loadDocumentQueue = () => {
    const stored = localStorage.getItem(`documentQueue_${profileCode}`);
    if (stored) {
      setDocumentQueue(JSON.parse(stored));
    }
  };

  const saveMessages = (newMessages: Message[]) => {
    localStorage.setItem(`messages_${profileCode}`, JSON.stringify(newMessages));
    setMessages(newMessages);
  };

  const handleSendMessage = async () => {
    if (!composeData.recipient || !composeData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: composeData.type,
        sender: userRole === 'admin' ? 'Admin' : 'User',
        senderEmail: userRole === 'admin' ? adminEmail : profileEmail,
        recipient: composeData.recipient,
        subject: composeData.subject,
        content: composeData.content,
        attachments: [],
        timestamp: new Date(),
        status: 'read',
        priority: composeData.priority,
        tags: [],
        isStarred: false
      };

      // Handle attachments
      if (composeData.attachments.length > 0) {
        // In production, upload files to server
        newMessage.attachments = composeData.attachments.map((file, idx) => ({
          id: `attach_${Date.now()}_${idx}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          uploadedAt: new Date(),
          status: 'approved' as const
        }));
      }

      const updatedMessages = [...messages, newMessage];
      saveMessages(updatedMessages);
      
      toast.success(`${composeData.type} sent successfully!`);
      
      // Reset compose form
      setComposeData({
        type: 'email',
        recipient: '',
        subject: '',
        content: '',
        attachments: [],
        priority: 'normal'
      });
      
      setActiveTab('inbox');
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    
    setComposeData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const applyTemplate = (template: CommunicationTemplate) => {
    setComposeData({
      type: template.type,
      recipient: '',
      subject: template.subject || '',
      content: template.content,
      attachments: [],
      priority: 'normal'
    });
    setActiveTab('compose');
    toast.info('Template applied. Fill in the variables.');
  };

  const processDocumentFromQueue = (attachment: Attachment, action: 'approve' | 'reject') => {
    const updatedQueue = documentQueue.map(doc => 
      doc.id === attachment.id 
        ? { ...doc, status: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected' | 'pending' }
        : doc
    );
    
    setDocumentQueue(updatedQueue);
    localStorage.setItem(`documentQueue_${profileCode}`, JSON.stringify(updatedQueue));
    
    toast.success(`Document ${action === 'approve' ? 'approved' : 'rejected'}`);
  };

  const generateWhatsAppQR = () => {
    const whatsappUrl = `https://wa.me/${settings.whatsappIntegration.businessNumber}?text=CODE:${whatsappCode}`;
    return whatsappUrl;
  };

  const filteredMessages = messages.filter(msg => {
    if (filters.type !== 'all' && msg.type !== filters.type) return false;
    if (filters.status !== 'all' && msg.status !== filters.status) return false;
    if (filters.priority !== 'all' && msg.priority !== filters.priority) return false;
    if (filters.search && !(JSON.stringify(msg) || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const renderInbox = () => (
    <div className="flex flex-1 h-full">
      {/* Message List */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 mb-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="document">Documents</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages found</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredMessages.map(message => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  message.status === 'unread' ? 'bg-blue-50' : ''
                } ${selectedMessage?.id === message.id ? 'bg-gray-100' : ''}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    {message.type === 'email' && <Mail className="w-4 h-4 text-gray-500" />}
                    {message.type === 'whatsapp' && <MessageSquare className="w-4 h-4 text-green-500" />}
                    {message.type === 'sms' && <Smartphone className="w-4 h-4 text-blue-500" />}
                    {message.type === 'document' && <FileText className="w-4 h-4 text-purple-500" />}
                    <span className="font-medium text-sm">{message.sender}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {message.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                    {message.priority === 'urgent' && <AlertCircle className="w-3 h-3 text-red-500" />}
                    {message.attachments.length > 0 && <Paperclip className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
                
                {message.subject && (
                  <p className="font-medium text-sm mb-1">{message.subject}</p>
                )}
                
                <p className="text-sm text-gray-600 truncate">{message.content}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleDateString()}
                  </span>
                  {message.tags.length > 0 && (
                    <div className="flex space-x-1">
                      {message.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{selectedMessage.subject || 'No Subject'}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    <span>From: {selectedMessage.sender}</span>
                    {selectedMessage.senderEmail && <span>({selectedMessage.senderEmail})</span>}
                    <span>•</span>
                    <span>{selectedMessage.timestamp.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const updated = messages.map(m => 
                        m.id === selectedMessage.id 
                          ? { ...m, isStarred: !m.isStarred }
                          : m
                      );
                      saveMessages(updated);
                      setSelectedMessage({ ...selectedMessage, isStarred: !selectedMessage.isStarred });
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <Star className={`w-5 h-5 ${selectedMessage.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Archive className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Trash2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
              
              {selectedMessage.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Attachments ({selectedMessage.attachments.length})</h4>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {attachment.type?.includes('image') ? (
                            <Image className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-gray-500" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {attachment.status === 'pending' && userRole === 'admin' && (
                            <>
                              <button
                                onClick={() => processDocumentFromQueue(attachment, 'approve')}
                                className="text-green-600 hover:bg-green-50 p-1 rounded"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => processDocumentFromQueue(attachment, 'reject')}
                                className="text-red-600 hover:bg-red-50 p-1 rounded"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedMessage.profileCode && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Profile Code: <span className="font-mono font-medium">{selectedMessage.profileCode}</span>
                  </p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Reply
                </button>
                <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
                  Forward
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a message to view</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompose = () => (
    <div className="p-6 max-w-3xl mx-auto">
      <h3 className="text-xl font-semibold mb-6">Compose Message</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
          <div className="flex space-x-4">
            {['email', 'whatsapp', 'sms'].map(type => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="messageType"
                  value={type}
                  checked={composeData.type === type}
                  onChange={(e) => setComposeData({ ...composeData, type: e.target.value as any })}
                  className="text-blue-600"
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {composeData.type === 'email' ? 'To (Email)' : 'To (Phone)'}
          </label>
          <input
            type={composeData.type === 'email' ? 'email' : 'tel'}
            value={composeData.recipient}
            onChange={(e) => setComposeData({ ...composeData, recipient: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={composeData.type === 'email' ? 'recipient@example.com' : '+1234567890'}
          />
        </div>

        {composeData.type === 'email' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={composeData.content}
            onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={8}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={composeData.priority}
            onChange={(e) => setComposeData({ ...composeData, priority: e.target.value as any })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {composeData.type === 'email' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-blue-600 hover:text-blue-700"
              >
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Click to upload files</p>
              </button>
              
              {composeData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {composeData.attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <button
                        onClick={() => {
                          const updated = composeData.attachments.filter((_, i) => i !== idx);
                          setComposeData({ ...composeData, attachments: updated });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </>
            )}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">Message Templates</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-500 capitalize">{template.type} • {template.category}</p>
              </div>
              <button
                onClick={() => applyTemplate(template)}
                className="text-blue-600 hover:text-blue-700"
              >
                Use
              </button>
            </div>
            
            {template.subject && (
              <p className="text-sm font-medium mb-1">{template.subject}</p>
            )}
            
            <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
            
            {template.variables.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {template.variables.map(variable => (
                  <span key={variable} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {`{{${variable}}}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderQueue = () => (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">Document Queue</h3>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium mb-2">WhatsApp Upload Code</h4>
        <div className="flex items-center space-x-3">
          <code className="text-2xl font-mono bg-white px-4 py-2 rounded">{whatsappCode}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(whatsappCode);
              toast.success('Code copied to clipboard');
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Share this code with contacts to upload documents via WhatsApp
        </p>
      </div>
      
      {documentQueue.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No documents in queue</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documentQueue.map(doc => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {(doc.size / 1024).toFixed(1)} KB • Uploaded {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {doc.status === 'pending' && (
                    <>
                      <button
                        onClick={() => processDocumentFromQueue(doc, 'approve')}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => processDocumentFromQueue(doc, 'reject')}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {doc.status === 'approved' && (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      Approved
                    </span>
                  )}
                  {doc.status === 'rejected' && (
                    <span className="text-red-600 flex items-center">
                      <X className="w-5 h-5 mr-1" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-semibold mb-6">Communication Settings</h3>
      
      {/* Email Settings */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Email Integration
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Address</label>
            <input
              type="email"
              value={settings.emailIntegration.gmail}
              onChange={(e) => setSettings({
                ...settings,
                emailIntegration: { ...settings.emailIntegration, gmail: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="organization@gmail.com"
            />
          </div>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.emailIntegration.autoReply}
              onChange={(e) => setSettings({
                ...settings,
                emailIntegration: { ...settings.emailIntegration, autoReply: e.target.checked }
              })}
              className="rounded text-blue-600"
            />
            <span className="text-sm">Enable auto-reply</span>
          </label>
        </div>
      </div>
      
      {/* WhatsApp Settings */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-4 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          WhatsApp Business
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Number</label>
            <input
              type="tel"
              value={settings.whatsappIntegration.businessNumber}
              onChange={(e) => setSettings({
                ...settings,
                whatsappIntegration: { ...settings.whatsappIntegration, businessNumber: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
            <textarea
              value={settings.whatsappIntegration.welcomeMessage}
              onChange={(e) => setSettings({
                ...settings,
                whatsappIntegration: { ...settings.whatsappIntegration, welcomeMessage: e.target.value }
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h4>
        <div className="space-y-2">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, [key]: e.target.checked }
                })}
                className="rounded text-blue-600"
              />
              <span className="text-sm capitalize">{key} notifications</span>
            </label>
          ))}
        </div>
      </div>
      
      <button
        onClick={() => {
          localStorage.setItem(`commSettings_${profileCode}`, JSON.stringify(settings));
          toast.success('Settings saved');
        }}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Save Settings
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Enhanced Communications Hub</h2>
              <p className="text-blue-100">Unified messaging and document management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'inbox', label: 'Inbox', icon: Inbox, count: messages.filter(m => m.status === 'unread').length },
              { id: 'compose', label: 'Compose', icon: Send },
              { id: 'templates', label: 'Templates', icon: Layers },
              { id: 'queue', label: 'Document Queue', icon: Database, count: documentQueue.filter(d => d.status === 'pending').length },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count && tab.count > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'inbox' && renderInbox()}
          {activeTab === 'compose' && renderCompose()}
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'queue' && renderQueue()}
          {activeTab === 'settings' && renderSettings()}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Profile: <strong>{profileCode}</strong></span>
              <span>Email: <strong>{profileEmail || 'Not set'}</strong></span>
              <span>WhatsApp Code: <strong>{whatsappCode}</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCommunicationsHub;