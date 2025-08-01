import React, { useState } from 'react';
import { 
  Cpu, Globe, Shield, Database, Smartphone, Monitor,
  Wifi, Cloud, Lock, AlertTriangle, CheckCircle, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';

interface TechnologySectionProps {
  formData: any;
  errors: any;
  locked: boolean;
  onInputChange: (field: string, value: any) => void;
  onFileUpload?: (field: string, file: File) => void;
}

const TechnologySection: React.FC<TechnologySectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload
}) => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'security' | 'digital'>('infrastructure');

  const technologyTools = [
    { category: 'CRM/Database', examples: 'Salesforce, DonorPerfect, Raiser\'s Edge' },
    { category: 'Website/CMS', examples: 'WordPress, Drupal, Squarespace' },
    { category: 'Email Marketing', examples: 'MailChimp, Constant Contact, Campaign Monitor' },
    { category: 'Accounting', examples: 'QuickBooks, Sage, Xero' },
    { category: 'Project Management', examples: 'Asana, Trello, Monday.com' },
    { category: 'Communication', examples: 'Slack, Zoom, Microsoft Teams' },
    { category: 'Social Media', examples: 'Hootsuite, Buffer, Sprout Social' },
    { category: 'Fundraising', examples: 'GoFundMe, JustGiving, Facebook Fundraisers' }
  ];

  return (
    <div className="space-y-6">
      {/* Technology Overview */}
      <div className="bg-cyan-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Cpu className="w-5 h-5 mr-2" />
          Technology Infrastructure
        </h3>

        {/* Tech Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {formData?.techBudget ? `$${parseInt(formData.techBudget).toLocaleString()}` : '$0'}
            </div>
            <div className="text-sm text-gray-600">Annual Tech Budget</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {formData?.staffTechSkill || 'Basic'}
            </div>
            <div className="text-sm text-gray-600">Team Tech Skill</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formData?.hasITSupport ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-600">IT Support</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formData?.cloudAdoption || 'Partial'}
            </div>
            <div className="text-sm text-gray-600">Cloud Adoption</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'infrastructure'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Infrastructure & Tools
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'security'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Security & Privacy
            </button>
            <button
              onClick={() => setActiveTab('digital')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'digital'
                  ? 'border-cyan-600 text-cyan-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Digital Strategy
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Infrastructure Tab */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-6">
              {/* Technology Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Annual Technology Budget
                  </label>
                  <input
                    type="number"
                    value={formData?.techBudget || ''}
                    onChange={(e) => onInputChange('techBudget', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="$0"
                    disabled={locked}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    IT Support
                  </label>
                  <select
                    value={formData?.itSupportType || ''}
                    onChange={(e) => onInputChange('itSupportType', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    disabled={locked}
                  >
                    <option value="">Select type</option>
                    <option value="internal">Internal IT Staff</option>
                    <option value="external">External IT Provider</option>
                    <option value="volunteer">Volunteer IT Support</option>
                    <option value="none">No IT Support</option>
                  </select>
                </div>
              </div>

              {/* Current Technology Tools */}
              <div>
                <h4 className="font-semibold mb-3">Current Technology Tools</h4>
                <div className="space-y-4">
                  {technologyTools.map((tool, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {tool.category}
                          </label>
                          <input
                            type="text"
                            value={formData?.[`tech_${tool.category.toLowerCase().replace(/[^a-z0-9]/g, '')}`] || ''}
                            onChange={(e) => onInputChange(`tech_${tool.category.toLowerCase().replace(/[^a-z0-9]/g, '')}`, e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                            placeholder={`e.g., ${tool.examples.split(',')[0]}`}
                            disabled={locked}
                          />
                        </div>
                        <div className="flex items-end">
                          <select
                            value={formData?.[`tech_${tool.category.toLowerCase().replace(/[^a-z0-9]/g, '')}_satisfaction`] || ''}
                            onChange={(e) => onInputChange(`tech_${tool.category.toLowerCase().replace(/[^a-z0-9]/g, '')}_satisfaction`, e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                            disabled={locked}
                          >
                            <option value="">Satisfaction Level</option>
                            <option value="very-satisfied">Very Satisfied</option>
                            <option value="satisfied">Satisfied</option>
                            <option value="neutral">Neutral</option>
                            <option value="dissatisfied">Dissatisfied</option>
                            <option value="not-using">Not Using</option>
                          </select>
                        </div>
                      </div>
                      <small className="text-gray-500 block mt-1">
                        Examples: {tool.examples}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware & Infrastructure */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Monitor className="w-4 h-4 mr-2" />
                  Hardware & Infrastructure
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Computers
                    </label>
                    <input
                      type="number"
                      value={formData?.computerCount || ''}
                      onChange={(e) => onInputChange('computerCount', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                      placeholder="0"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internet Connection
                    </label>
                    <select
                      value={formData?.internetConnection || ''}
                      onChange={(e) => onInputChange('internetConnection', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                      disabled={locked}
                    >
                      <option value="">Select type</option>
                      <option value="high-speed">High-Speed Broadband</option>
                      <option value="standard">Standard Broadband</option>
                      <option value="dsl">DSL</option>
                      <option value="satellite">Satellite</option>
                      <option value="mobile">Mobile/Cellular</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Network Setup
                    </label>
                    <select
                      value={formData?.networkSetup || ''}
                      onChange={(e) => onInputChange('networkSetup', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                      disabled={locked}
                    >
                      <option value="">Select setup</option>
                      <option value="wired">Wired Network</option>
                      <option value="wireless">Wireless Network</option>
                      <option value="hybrid">Hybrid (Wired + Wireless)</option>
                      <option value="none">No Network</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Server Infrastructure
                    </label>
                    <select
                      value={formData?.serverInfrastructure || ''}
                      onChange={(e) => onInputChange('serverInfrastructure', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                      disabled={locked}
                    >
                      <option value="">Select type</option>
                      <option value="cloud-only">Cloud Only</option>
                      <option value="on-premise">On-Premise Server</option>
                      <option value="hybrid">Hybrid Cloud/On-Premise</option>
                      <option value="none">No Server</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Policies */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Cybersecurity Measures
                </h4>
                <div className="space-y-3">
                  {[
                    { field: 'hasFirewall', label: 'Firewall Protection' },
                    { field: 'hasAntivirus', label: 'Antivirus Software' },
                    { field: 'hasBackups', label: 'Regular Data Backups' },
                    { field: 'hasPasswordPolicy', label: 'Password Policy' },
                    { field: 'hasTwoFactor', label: 'Two-Factor Authentication' },
                    { field: 'hasEncryption', label: 'Data Encryption' },
                    { field: 'hasSecurityTraining', label: 'Staff Security Training' },
                    { field: 'hasIncidentResponse', label: 'Incident Response Plan' }
                  ].map(item => (
                    <label key={item.field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData?.[item.field] || false}
                        onChange={(e) => onInputChange(item.field, e.target.checked)}
                        className="rounded"
                        disabled={locked}
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data Privacy */}
              <div>
                <label className="block font-semibold mb-2">
                  Data Privacy & Protection Measures
                </label>
                <RichTextEditor
                  value={formData?.dataPrivacyMeasures || ''}
                  onChange={(content) => onInputChange('dataPrivacyMeasures', content)}
                  placeholder="Describe your data privacy and protection policies..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Vulnerability Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Last Security Assessment
                  </label>
                  <input
                    type="date"
                    value={formData?.lastSecurityAssessment || ''}
                    onChange={(e) => onInputChange('lastSecurityAssessment', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    disabled={locked}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Security Assessment Provider
                  </label>
                  <input
                    type="text"
                    value={formData?.securityAssessmentProvider || ''}
                    onChange={(e) => onInputChange('securityAssessmentProvider', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="Internal, external provider, or none"
                    disabled={locked}
                  />
                </div>
              </div>

              {/* Security Documentation */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Security Documentation
                </h4>
                <div>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('securityPolicy', file);
                        toast.success('Security policy uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx"
                    disabled={locked}
                    className="block"
                  />
                  <small className="text-gray-500 block mt-1">
                    Upload your cybersecurity policy or incident response plan
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Digital Strategy Tab */}
          {activeTab === 'digital' && (
            <div className="space-y-6">
              {/* Digital Transformation */}
              <div>
                <label className="block font-semibold mb-2">
                  Digital Transformation Goals
                </label>
                <RichTextEditor
                  value={formData?.digitalTransformation || ''}
                  onChange={(content) => onInputChange('digitalTransformation', content)}
                  placeholder="Describe your organization's digital transformation goals..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Online Presence */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Online Presence
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData?.websiteUrl || ''}
                      onChange={(e) => onInputChange('websiteUrl', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                      placeholder="https://www.example.org"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website Last Updated
                    </label>
                    <input
                      type="date"
                      value={formData?.websiteLastUpdated || ''}
                      onChange={(e) => onInputChange('websiteLastUpdated', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-semibold mb-3">Social Media Presence</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok'].map(platform => (
                    <div key={platform}>
                      <label className="block text-sm text-gray-700 mb-1">
                        {platform}
                      </label>
                      <input
                        type="url"
                        value={formData?.[`${platform.toLowerCase()}Url`] || ''}
                        onChange={(e) => onInputChange(`${platform.toLowerCase()}Url`, e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-cyan-500"
                        placeholder={`https://${platform.toLowerCase()}.com/yourorg`}
                        disabled={locked}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Technology Training */}
              <div>
                <label className="block font-semibold mb-2">
                  Staff Technology Training Needs
                </label>
                <RichTextEditor
                  value={formData?.technologyTraining || ''}
                  onChange={(content) => onInputChange('technologyTraining', content)}
                  placeholder="Describe technology training needs for your staff..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Future Technology Plans */}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Future Technology Plans
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Technology Roadmap
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileUpload) {
                        onFileUpload('technologyRoadmap', file);
                        toast.success('Technology roadmap uploaded');
                      }
                    }}
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    disabled={locked}
                    className="block"
                  />
                  <small className="text-gray-500 block mt-1">
                    Upload your technology planning document or roadmap
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnologySection;