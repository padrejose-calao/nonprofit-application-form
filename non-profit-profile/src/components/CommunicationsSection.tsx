import React, { useState } from 'react';
import { 
  MessageSquare, Send, Globe, Users, Megaphone, Mail,
  Phone, MessageCircle, Instagram, Facebook, Twitter,
  Calendar, FileText, Target, BarChart3, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';

interface CommunicationChannel {
  id: string | number;
  channel: string;
  frequency: string;
  audience: string;
  purpose: string;
  effectiveness: string;
  notes: string;
}

interface CommunicationsSectionProps {
  communicationChannels: CommunicationChannel[];
  errors: any;
  locked: boolean;
  onCommunicationChannelsChange: (channels: CommunicationChannel[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: any;
  onInputChange?: (field: string, value: any) => void;
}

const CommunicationsSection: React.FC<CommunicationsSectionProps> = ({
  communicationChannels,
  errors,
  locked,
  onCommunicationChannelsChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'channels' | 'marketing'>('strategy');

  const defaultChannels = [
    'Email Newsletter', 'Website', 'Social Media', 'Print Materials', 
    'Events', 'Direct Mail', 'Phone Calls', 'Text Messages', 
    'Press Releases', 'Community Presentations'
  ];

  const addCommunicationChannel = () => {
    const newChannel: CommunicationChannel = {
      id: Date.now(),
      channel: '',
      frequency: '',
      audience: '',
      purpose: '',
      effectiveness: '',
      notes: ''
    };
    onCommunicationChannelsChange([...communicationChannels, newChannel]);
  };

  const updateChannel = (id: string | number, updates: Partial<CommunicationChannel>) => {
    onCommunicationChannelsChange(communicationChannels.map(channel => 
      channel.id === id ? { ...channel, ...updates } : channel
    ));
  };

  const removeChannel = (id: string | number) => {
    onCommunicationChannelsChange(communicationChannels.filter(channel => channel.id !== id));
    toast.info('Communication channel removed');
  };

  return (
    <div className="space-y-6">
      {/* Communications Overview */}
      <div className="bg-teal-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Communications Strategy
        </h3>

        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-teal-600">{communicationChannels.length}</div>
            <div className="text-sm text-gray-600">Active Channels</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formData?.communicationBudget ? `$${parseInt(formData.communicationBudget).toLocaleString()}` : '$0'}
            </div>
            <div className="text-sm text-gray-600">Annual Budget</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {formData?.emailSubscribers || '0'}
            </div>
            <div className="text-sm text-gray-600">Email Subscribers</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formData?.socialFollowers || '0'}
            </div>
            <div className="text-sm text-gray-600">Social Followers</div>
          </div>
        </div>

        {/* Quick Communication Metrics */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-3">Communication Reach</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Website Monthly Visitors</label>
              <input
                type="number"
                value={formData?.websiteVisitors || ''}
                onChange={(e) => onInputChange?.('websiteVisitors', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                disabled={locked}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email Open Rate (%)</label>
              <input
                type="number"
                value={formData?.emailOpenRate || ''}
                onChange={(e) => onInputChange?.('emailOpenRate', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                placeholder="25"
                disabled={locked}
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Social Engagement Rate (%)</label>
              <input
                type="number"
                value={formData?.socialEngagementRate || ''}
                onChange={(e) => onInputChange?.('socialEngagementRate', e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                placeholder="5"
                disabled={locked}
                max="100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'strategy'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Communication Strategy
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'channels'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Communication Channels
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'marketing'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Marketing & Outreach
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Strategy Tab */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              {/* Communication Objectives */}
              <div>
                <label className="block font-semibold mb-2">
                  Communication Objectives <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={formData?.communicationObjectives || ''}
                  onChange={(content) => onInputChange?.('communicationObjectives', content)}
                  placeholder="Describe your organization's communication goals and objectives..."
                  disabled={locked}
                  height={150}
                />
                {errors?.communicationObjectives && (
                  <p className="text-red-600 text-sm mt-1">{errors.communicationObjectives}</p>
                )}
              </div>

              {/* Target Audiences */}
              <div>
                <label className="block font-semibold mb-2">
                  Target Audiences
                </label>
                <RichTextEditor
                  value={formData?.targetAudiences || ''}
                  onChange={(content) => onInputChange?.('targetAudiences', content)}
                  placeholder="Describe your primary and secondary target audiences..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Key Messages */}
              <div>
                <label className="block font-semibold mb-2">
                  Key Messages
                </label>
                <RichTextEditor
                  value={formData?.keyMessages || ''}
                  onChange={(content) => onInputChange?.('keyMessages', content)}
                  placeholder="What are your core messages and value propositions?"
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Communication Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Annual Communications Budget
                  </label>
                  <input
                    type="number"
                    value={formData?.communicationBudget || ''}
                    onChange={(e) => onInputChange?.('communicationBudget', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="$0"
                    disabled={locked}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Communication Staff (FTE)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData?.communicationStaff || ''}
                    onChange={(e) => onInputChange?.('communicationStaff', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="1.0"
                    disabled={locked}
                  />
                </div>
              </div>

              {/* Communication Plan Document */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Communication Plan
                </h4>
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('communicationPlan', file);
                        toast.success('Communication plan uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    disabled={locked}
                    className="block"
                  />
                  <small className="text-gray-500 block mt-1">
                    Upload your comprehensive communication strategy document
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Channels Tab */}
          {activeTab === 'channels' && (
            <div className="space-y-6">
              {/* Channel Management */}
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Communication Channels</h4>
                <button
                  type="button"
                  onClick={addCommunicationChannel}
                  disabled={locked}
                  className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  Add Channel
                </button>
              </div>

              {communicationChannels.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No communication channels defined yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {communicationChannels.map((channel) => (
                    <div key={channel.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Channel</label>
                          <select
                            value={channel.channel}
                            onChange={(e) => updateChannel(channel.id, { channel: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                            disabled={locked}
                          >
                            <option value="">Select channel</option>
                            {defaultChannels.map(ch => (
                              <option key={ch} value={ch}>{ch}</option>
                            ))}
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Frequency</label>
                          <select
                            value={channel.frequency}
                            onChange={(e) => updateChannel(channel.id, { frequency: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                            disabled={locked}
                          >
                            <option value="">Select frequency</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="annually">Annually</option>
                            <option value="as-needed">As Needed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Effectiveness</label>
                          <select
                            value={channel.effectiveness}
                            onChange={(e) => updateChannel(channel.id, { effectiveness: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                            disabled={locked}
                          >
                            <option value="">Rate effectiveness</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                            <option value="unknown">Unknown</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Target Audience</label>
                          <input
                            type="text"
                            value={channel.audience}
                            onChange={(e) => updateChannel(channel.id, { audience: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                            placeholder="e.g., Donors, Volunteers, General Public"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Primary Purpose</label>
                          <input
                            type="text"
                            value={channel.purpose}
                            onChange={(e) => updateChannel(channel.id, { purpose: e.target.value })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                            placeholder="e.g., Fundraising, Awareness, Engagement"
                            disabled={locked}
                          />
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="block text-sm text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={channel.notes}
                          onChange={(e) => updateChannel(channel.id, { notes: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                          rows={2}
                          placeholder="Additional details about this communication channel..."
                          disabled={locked}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeChannel(channel.id)}
                          disabled={locked}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Channel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Digital Presence */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Digital Presence & Social Media
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website Analytics Tool</label>
                    <input
                      type="text"
                      value={formData?.analyticsTools || ''}
                      onChange={(e) => onInputChange?.('analyticsTools', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                      placeholder="Google Analytics, etc."
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Social Media Management Tool</label>
                    <input
                      type="text"
                      value={formData?.socialMediaTools || ''}
                      onChange={(e) => onInputChange?.('socialMediaTools', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                      placeholder="Hootsuite, Buffer, etc."
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Marketing Tab */}
          {activeTab === 'marketing' && (
            <div className="space-y-6">
              {/* Marketing Strategy */}
              <div>
                <label className="block font-semibold mb-2">
                  Marketing Strategy
                </label>
                <RichTextEditor
                  value={formData?.marketingStrategy || ''}
                  onChange={(content) => onInputChange?.('marketingStrategy', content)}
                  placeholder="Describe your marketing and outreach strategy..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Brand Guidelines */}
              <div>
                <label className="block font-semibold mb-2">
                  Brand Guidelines & Messaging
                </label>
                <RichTextEditor
                  value={formData?.brandGuidelines || ''}
                  onChange={(content) => onInputChange?.('brandGuidelines', content)}
                  placeholder="Describe your brand voice, style, and messaging guidelines..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Event Marketing */}
              <div>
                <label className="block font-semibold mb-2">
                  Event Marketing & Promotion
                </label>
                <RichTextEditor
                  value={formData?.eventMarketing || ''}
                  onChange={(content) => onInputChange?.('eventMarketing', content)}
                  placeholder="How do you promote and market your events?"
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Media Relations */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Megaphone className="w-4 h-4 mr-2" />
                  Media Relations
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media Contact List
                    </label>
                    <textarea
                      value={formData?.mediaContacts || ''}
                      onChange={(e) => onInputChange?.('mediaContacts', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-teal-500"
                      rows={3}
                      placeholder="List key media contacts and outlets..."
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Press Kit / Media Materials
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('pressKit', file);
                          toast.success('Press kit uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx,.zip"
                      disabled={locked}
                      className="block"
                    />
                    <small className="text-gray-500 block mt-1">
                      Upload press releases, fact sheets, high-res images
                    </small>
                  </div>
                </div>
              </div>

              {/* Marketing Materials */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Marketing Materials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brochures & Print Materials
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('printMaterials', file);
                          toast.success('Print materials uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Digital Marketing Assets
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('digitalAssets', file);
                          toast.success('Digital assets uploaded');
                        }
                      }}
                      accept=".pdf,.jpg,.jpeg,.png,.zip"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunicationsSection;