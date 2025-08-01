import React, { useState, useEffect } from 'react';
import {
  Mail, MessageSquare, Upload, Share, Bluetooth, FileText as Fax, 
  Settings, ToggleLeft, ToggleRight, Phone, Globe,
  FileText, Image, Paperclip, Download, Send, Users,
  Shield, AlertCircle, CheckCircle, Clock, Zap, ExternalLink,
  Smartphone, Wifi, Cloud, Lock, Key, Bell, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';

interface CommunicationSettings {
  emailToApp: boolean;
  whatsappBusiness: boolean;
  appleDirect: boolean;
  bluetooth: boolean;
  efax: boolean;
  notifications: boolean;
  autoProcessing: boolean;
  secureMode: boolean;
}

interface IncomingMessage {
  id: string;
  type: 'email' | 'whatsapp' | 'apple_direct' | 'bluetooth' | 'fax' | 'upload';
  sender: string;
  subject?: string;
  content: string;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  timestamp: string;
  status: 'pending' | 'processed' | 'archived' | 'rejected';
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  processedBy?: string;
}

interface CommunicationsModuleProps {
  userRole: 'admin' | 'user';
  onClose: () => void;
}

const CommunicationsModule: React.FC<CommunicationsModuleProps> = ({
  userRole,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'settings' | 'history'>('inbox');
  const [settings, setSettings] = useState<CommunicationSettings>({
    emailToApp: false,
    whatsappBusiness: false,
    appleDirect: false,
    bluetooth: false,
    efax: false,
    notifications: true,
    autoProcessing: false,
    secureMode: true
  });
  
  const [messages, setMessages] = useState<IncomingMessage[]>([
    {
      id: '1',
      type: 'email',
      sender: 'donor@foundation.org',
      subject: 'Grant Application Documents',
      content: 'Please find attached our grant application and supporting documents.',
      attachments: [
        { name: 'grant_application.pdf', type: 'pdf', size: 2400000, url: '#' },
        { name: 'financial_statements.xlsx', type: 'excel', size: 850000, url: '#' }
      ],
      timestamp: new Date().toISOString(),
      status: 'pending',
      category: 'grants',
      priority: 'high'
    },
    {
      id: '2',
      type: 'whatsapp',
      sender: '+1-555-0123',
      content: 'Hi, I would like to volunteer for your upcoming community event. Can you send me the registration form?',
      attachments: [],
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
      category: 'volunteers',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'fax',
      sender: '555-FAX-0987',
      subject: 'Board Resolution Document',
      content: 'Faxed board resolution for nonprofit registration.',
      attachments: [
        { name: 'board_resolution.pdf', type: 'pdf', size: 1200000, url: '#' }
      ],
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'processed',
      category: 'governance',
      priority: 'high',
      processedBy: 'admin@calao.org'
    }
  ]);

  const [selectedMessage, setSelectedMessage] = useState<IncomingMessage | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('calao_comm_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage
  const updateSettings = (newSettings: Partial<CommunicationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('calao_comm_settings', JSON.stringify(updatedSettings));
    toast.success('Communication settings updated');
  };

  const handleToggleSetting = (key: keyof CommunicationSettings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const processMessage = (messageId: string, action: 'approve' | 'reject' | 'archive') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            status: action === 'approve' ? 'processed' : action === 'reject' ? 'rejected' : 'archived',
            processedBy: 'current-user@calao.org'
          }
        : msg
    ));
    
    const actionText = action === 'approve' ? 'processed' : action === 'reject' ? 'rejected' : 'archived';
    toast.success(`Message ${actionText} successfully`);
    setSelectedMessage(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'apple_direct': return <Share className="w-4 h-4" />;
      case 'bluetooth': return <Bluetooth className="w-4 h-4" />;
      case 'fax': return <Fax className="w-4 h-4" />;
      case 'upload': return <Upload className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processed': return 'text-green-600 bg-green-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredMessages = messages.filter(msg => {
    const typeMatch = filterType === 'all' || msg.type === filterType;
    const statusMatch = filterStatus === 'all' || msg.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const connectWhatsApp = async () => {
    toast.info('Redirecting to WhatsApp Business API setup...');
    // In a real implementation, this would redirect to WhatsApp Business API
    setTimeout(() => {
      updateSettings({ whatsappBusiness: true });
      toast.success('WhatsApp Business connected successfully!');
    }, 2000);
  };

  const connectEfax = async () => {
    toast.info('Connecting to eFax service...');
    // In a real implementation, this would integrate with eFax API
    setTimeout(() => {
      updateSettings({ efax: true });
      toast.success('eFax integration enabled!');
    }, 2000);
  };

  const renderInbox = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="apple_direct">Apple Direct</option>
              <option value="bluetooth">Bluetooth</option>
              <option value="fax">Fax</option>
              <option value="upload">Upload</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredMessages.length} messages
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-2">
        {filteredMessages.map(message => (
          <div
            key={message.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => setSelectedMessage(message)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(message.type)}
                  <span className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      {message.subject || `${message.type.replace('_', ' ').toUpperCase()} from ${message.sender}`}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{message.sender}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{message.content}</p>
                  {message.attachments.length > 0 && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Paperclip className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No messages found</p>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Channels</h3>
        <div className="space-y-4">
          {/* Email to App */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Email to App</h4>
                <p className="text-sm text-gray-600">Receive documents via dedicated email address</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('emailToApp')}
              className="flex items-center"
            >
              {settings.emailToApp ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          {/* WhatsApp Business */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">WhatsApp Business</h4>
                <p className="text-sm text-gray-600">Receive messages and documents via WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!settings.whatsappBusiness && (
                <button
                  onClick={connectWhatsApp}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Connect
                </button>
              )}
              <button
                onClick={() => handleToggleSetting('whatsappBusiness')}
                className="flex items-center"
              >
                {settings.whatsappBusiness ? (
                  <ToggleRight className="w-8 h-8 text-green-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Apple Direct/AirDrop */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Share className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Apple Direct Sharing</h4>
                <p className="text-sm text-gray-600">Receive files via AirDrop and Apple ecosystem</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('appleDirect')}
              className="flex items-center"
            >
              {settings.appleDirect ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          {/* Bluetooth */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bluetooth className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Bluetooth Sharing</h4>
                <p className="text-sm text-gray-600">Receive files via Bluetooth from nearby devices</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('bluetooth')}
              className="flex items-center"
            >
              {settings.bluetooth ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          {/* eFax */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Fax className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">eFax Integration</h4>
                <p className="text-sm text-gray-600">Receive faxes electronically via eFax service</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!settings.efax && (
                <button
                  onClick={connectEfax}
                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Setup
                </button>
              )}
              <button
                onClick={() => handleToggleSetting('efax')}
                className="flex items-center"
              >
                {settings.efax ? (
                  <ToggleRight className="w-8 h-8 text-green-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-gray-900">Notifications</h4>
                <p className="text-sm text-gray-600">Get notified when new messages arrive</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('notifications')}
              className="flex items-center"
            >
              {settings.notifications ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          {/* Auto Processing */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-orange-600" />
              <div>
                <h4 className="font-medium text-gray-900">Auto Processing</h4>
                <p className="text-sm text-gray-600">Automatically categorize and process messages</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('autoProcessing')}
              className="flex items-center"
            >
              {settings.autoProcessing ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>

          {/* Secure Mode */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-medium text-gray-900">Secure Mode</h4>
                <p className="text-sm text-gray-600">Enhanced security for sensitive documents</p>
              </div>
            </div>
            <button
              onClick={() => handleToggleSetting('secureMode')}
              className="flex items-center"
            >
              {settings.secureMode ? (
                <ToggleRight className="w-8 h-8 text-green-600" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Message history will appear here</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Communications Center</h2>
            {userRole === 'admin' && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Admin Access
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'inbox'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Inbox ({messages.filter(m => m.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'inbox' && renderInbox()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'history' && renderHistory()}
        </div>

        {/* Message Detail Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {selectedMessage.subject || `Message from ${selectedMessage.sender}`}
                  </h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(selectedMessage.type)}
                      <span className="font-medium">{selectedMessage.sender}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(selectedMessage.priority)}`}>
                      {selectedMessage.priority} priority
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {new Date(selectedMessage.timestamp).toLocaleString()}
                  </div>
                  
                  <div className="prose max-w-none">
                    <p>{selectedMessage.content}</p>
                  </div>
                  
                  {selectedMessage.attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Attachments</h4>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-medium">{attachment.name}</div>
                                <div className="text-sm text-gray-500">
                                  {(attachment.size / 1024 / 1024).toFixed(1)} MB
                                </div>
                              </div>
                            </div>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedMessage.status === 'pending' && userRole === 'admin' && (
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => processMessage(selectedMessage.id, 'reject')}
                      className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => processMessage(selectedMessage.id, 'archive')}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => processMessage(selectedMessage.id, 'approve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Process & Add to Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationsModule;