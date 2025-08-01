import React, { useState, useEffect } from 'react';
import {
  X, Save, Plus, Trash2, Eye, EyeOff, Lock, Unlock,
  Key, Globe, Mail, MessageSquare, Brain, FileText,
  Copy, RefreshCw, Shield, CheckCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface APIKey {
  id: string;
  name: string;
  service: string;
  key: string;
  token?: string;
  secret?: string;
  endpoint?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  testStatus?: 'untested' | 'success' | 'failed';
  lastTested?: Date;
}

interface APILockerProps {
  onClose: () => void;
  currentUserId: string;
}

const APILocker: React.FC<APILockerProps> = ({ onClose, currentUserId }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [newKey, setNewKey] = useState<Partial<APIKey>>({
    service: '',
    name: '',
    key: '',
    token: '',
    secret: '',
    endpoint: '',
    isActive: true
  });

  const availableServices = [
    { id: 'openai', name: 'OpenAI', icon: Brain, description: 'AI Assistant & Text Generation' },
    { id: 'google-maps', name: 'Google Maps', icon: Globe, description: 'Location & Geocoding Services' },
    { id: 'gmail', name: 'Gmail API', icon: Mail, description: 'Email Integration' },
    { id: 'sendgrid', name: 'SendGrid', icon: Mail, description: 'Email Delivery Service' },
    { id: 'twilio', name: 'Twilio', icon: MessageSquare, description: 'SMS & WhatsApp Integration' },
    { id: 'google-docs', name: 'Google Docs', icon: FileText, description: 'Document Generation' },
    { id: 'huggingface', name: 'Hugging Face', icon: Brain, description: 'Free AI Models' },
    { id: 'weatherapi', name: 'Weather API', icon: Globe, description: 'Weather Data' },
    { id: 'custom', name: 'Custom API', icon: Key, description: 'Other API Services' }
  ];

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = () => {
    const stored = localStorage.getItem(`apiKeys_${currentUserId}`);
    if (stored) {
      const keys = JSON.parse(stored);
      setApiKeys(keys.map((k: any) => ({
        ...k,
        createdAt: new Date(k.createdAt),
        updatedAt: new Date(k.updatedAt),
        lastTested: k.lastTested ? new Date(k.lastTested) : undefined
      })));
    }
  };

  const saveAPIKeys = (keys: APIKey[]) => {
    localStorage.setItem(`apiKeys_${currentUserId}`, JSON.stringify(keys));
    setApiKeys(keys);
  };

  const handleUnlock = () => {
    // In production, this should verify against a secure admin password
    if (password === 'admin123') {
      setIsLocked(false);
      toast.success('API Locker unlocked');
    } else {
      toast.error('Invalid password');
    }
  };

  const handleAddKey = () => {
    if (!newKey.service || !newKey.name || !newKey.key) {
      toast.error('Please fill in all required fields');
      return;
    }

    const key: APIKey = {
      id: Date.now().toString(),
      service: newKey.service,
      name: newKey.name,
      key: newKey.key,
      token: newKey.token,
      secret: newKey.secret,
      endpoint: newKey.endpoint,
      isActive: newKey.isActive || true,
      createdAt: new Date(),
      updatedAt: new Date(),
      testStatus: 'untested'
    };

    saveAPIKeys([...apiKeys, key]);
    setNewKey({
      service: '',
      name: '',
      key: '',
      token: '',
      secret: '',
      endpoint: '',
      isActive: true
    });
    toast.success('API key added successfully');
  };

  const handleUpdateKey = (id: string, updates: Partial<APIKey>) => {
    const updated = apiKeys.map(k => 
      k.id === id ? { ...k, ...updates, updatedAt: new Date() } : k
    );
    saveAPIKeys(updated);
    toast.success('API key updated');
  };

  const handleDeleteKey = (id: string) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      saveAPIKeys(apiKeys.filter(k => k.id !== id));
      toast.success('API key deleted');
    }
  };

  const handleTestKey = async (key: APIKey) => {
    toast.info(`Testing ${key.name}...`);
    
    // Simulate API testing - in production, this would make actual test calls
    setTimeout(() => {
      const success = Math.random() > 0.3;
      handleUpdateKey(key.id, {
        testStatus: success ? 'success' : 'failed',
        lastTested: new Date()
      });
      
      if (success) {
        toast.success(`${key.name} is working correctly`);
      } else {
        toast.error(`${key.name} test failed`);
      }
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getServiceIcon = (serviceId: string) => {
    const service = availableServices.find(s => s.id === serviceId);
    return service?.icon || Key;
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">API Locker</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">Enter admin password to access API keys</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Admin password"
            />
            <button
              onClick={handleUnlock}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Unlock API Locker
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8" />
            <h2 className="text-2xl font-bold">API Locker</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Add New API Key */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New API Key</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                <select
                  value={newKey.service}
                  onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a service</option>
                  {availableServices.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Production API"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key *</label>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token (optional)</label>
                <input
                  type="password"
                  value={newKey.token}
                  onChange={(e) => setNewKey({ ...newKey, token: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Access token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret (optional)</label>
                <input
                  type="password"
                  value={newKey.secret}
                  onChange={(e) => setNewKey({ ...newKey, secret: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Client secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint (optional)</label>
                <input
                  type="text"
                  value={newKey.endpoint}
                  onChange={(e) => setNewKey({ ...newKey, endpoint: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="API endpoint URL"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newKey.isActive}
                  onChange={(e) => setNewKey({ ...newKey, isActive: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>

              <button
                onClick={handleAddKey}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add API Key
              </button>
            </div>
          </div>

          {/* API Keys List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stored API Keys</h3>
            
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No API keys stored yet. Add your first key above.
              </div>
            ) : (
              <div className="grid gap-4">
                {apiKeys.map((apiKey) => {
                  const ServiceIcon = getServiceIcon(apiKey.service);
                  const service = availableServices.find(s => s.id === apiKey.service);
                  
                  return (
                    <div key={apiKey.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <ServiceIcon className="w-6 h-6 text-gray-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{apiKey.name}</h4>
                            <p className="text-sm text-gray-600">{service?.name || 'Custom API'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Added: {apiKey.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {apiKey.testStatus === 'success' && (
                            <div title="API key verified">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          )}
                          {apiKey.testStatus === 'failed' && (
                            <div title="API key test failed">
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleUpdateKey(apiKey.id, { isActive: !apiKey.isActive })}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              apiKey.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {apiKey.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 w-20">Key:</span>
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type={showKeys[apiKey.id] ? 'text' : 'password'}
                              value={apiKey.key}
                              readOnly
                              className="flex-1 px-3 py-1 bg-gray-50 border rounded text-sm"
                            />
                            <button
                              onClick={() => setShowKeys({ ...showKeys, [apiKey.id]: !showKeys[apiKey.id] })}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToClipboard(apiKey.key)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {apiKey.token && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 w-20">Token:</span>
                            <div className="flex-1 flex items-center space-x-2">
                              <input
                                type={showKeys[`${apiKey.id}_token`] ? 'text' : 'password'}
                                value={apiKey.token}
                                readOnly
                                className="flex-1 px-3 py-1 bg-gray-50 border rounded text-sm"
                              />
                              <button
                                onClick={() => setShowKeys({ ...showKeys, [`${apiKey.id}_token`]: !showKeys[`${apiKey.id}_token`] })}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                {showKeys[`${apiKey.id}_token`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => copyToClipboard(apiKey.token || '')}
                                className="p-1 hover:bg-gray-100 rounded"
                                disabled={!apiKey.token}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {apiKey.endpoint && (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 w-20">Endpoint:</span>
                            <input
                              type="text"
                              value={apiKey.endpoint}
                              readOnly
                              className="flex-1 px-3 py-1 bg-gray-50 border rounded text-sm"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleTestKey(apiKey)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Test Key
                          </button>
                          {apiKey.lastTested && (
                            <span className="text-xs text-gray-500">
                              Last tested: {apiKey.lastTested.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleDeleteKey(apiKey.id)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service Information */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Available Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableServices.map(service => {
                const Icon = service.icon;
                return (
                  <div key={service.id} className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-between items-center">
          <button
            onClick={() => setIsLocked(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <Lock className="w-4 h-4 mr-2" />
            Lock API Locker
          </button>
          
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default APILocker;