import React, { useState } from 'react';
import { 
  Cpu, Globe, Shield, Database, Smartphone, Monitor,
  Wifi, Cloud, Lock, AlertTriangle, CheckCircle, Zap,
  Server, HardDrive, Network, Settings, Plus, Edit2,
  Trash2, Eye, Download, Upload, RefreshCw, Save
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';

interface TechnologySectionProps {
  formData: unknown;
  errors: unknown;
  locked: boolean;
  onInputChange: (field: string, value: unknown) => void;
  onFileUpload?: (field: string, file: File) => void;
}

interface TechnologyTool {
  id: string;
  category: string;
  name: string;
  vendor: string;
  version?: string;
  cost: number;
  users: number;
  status: 'active' | 'inactive' | 'planned' | 'deprecated';
  description?: string;
  implementationDate?: string;
  renewalDate?: string;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityMeasure {
  id: string;
  type: string;
  description: string;
  status: 'implemented' | 'planned' | 'in-progress';
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastReviewed?: string;
  nextReview?: string;
}

interface ITAsset {
  id: string;
  type: 'hardware' | 'software' | 'service';
  name: string;
  specifications?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  assignedTo?: string;
  location?: string;
  status: 'active' | 'maintenance' | 'retired';
}

const TechnologySection: React.FC<TechnologySectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload
}) => {
  const [activeTab, setActiveTab] = useState<'infrastructure' | 'security' | 'digital' | 'assets'>('infrastructure');
  const [showToolModal, setShowToolModal] = useState(false);
  const [editingTool, setEditingTool] = useState<TechnologyTool | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [editingSecurity, setEditingSecurity] = useState<SecurityMeasure | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);

  // Initialize technology data if not exists
  const technologyData = (formData as any).technologyData || {
    tools: [],
    securityMeasures: [],
    assets: [],
    budget: '',
    infrastructure: '',
    dataManagement: '',
    securityPolicies: '',
    disasterRecovery: '',
    itSupport: '',
    cloudServices: '',
    compliance: ''
  };

  const technologyCategories = [
    { category: 'CRM/Database', examples: 'Salesforce, DonorPerfect, Raiser\'s Edge', icon: Database },
    { category: 'Website/CMS', examples: 'WordPress, Drupal, Squarespace', icon: Globe },
    { category: 'Email Marketing', examples: 'MailChimp, Constant Contact, Campaign Monitor', icon: Monitor },
    { category: 'Accounting', examples: 'QuickBooks, Sage, Xero', icon: Cpu },
    { category: 'Communication', examples: 'Slack, Microsoft Teams, Zoom', icon: Smartphone },
    { category: 'Cloud Storage', examples: 'Google Drive, Dropbox, OneDrive', icon: Cloud },
    { category: 'Security', examples: 'Antivirus, Firewall, VPN', icon: Shield },
    { category: 'Backup', examples: 'Carbonite, Backblaze, Local backup', icon: HardDrive }
  ];

  const securityTypes = [
    'Firewall Protection',
    'Antivirus/Anti-malware',
    'Email Security',
    'Data Encryption',
    'Access Controls',
    'Network Security',
    'Backup Systems',
    'Incident Response Plan',
    'Staff Training',
    'Compliance Monitoring'
  ];

  const handleToolAdd = (tool: Omit<TechnologyTool, 'id'>) => {
    const newTool: TechnologyTool = {
      ...tool,
      id: Date.now().toString()
    };
    
    const updatedTools = [...technologyData.tools, newTool];
    onInputChange('technologyData', {
      ...technologyData,
      tools: updatedTools
    });
    
    setShowToolModal(false);
    setEditingTool(null);
    toast.success('Technology tool added successfully');
  };

  const handleToolUpdate = (updatedTool: TechnologyTool) => {
    const updatedTools = technologyData.tools.map((tool: TechnologyTool) =>
      tool.id === updatedTool.id ? updatedTool : tool
    );
    
    onInputChange('technologyData', {
      ...technologyData,
      tools: updatedTools
    });
    
    setShowToolModal(false);
    setEditingTool(null);
    toast.success('Technology tool updated successfully');
  };

  const handleToolDelete = (toolId: string) => {
    if (window.confirm('Are you sure you want to delete this technology tool?')) {
      const updatedTools = technologyData.tools.filter((tool: TechnologyTool) => tool.id !== toolId);
      onInputChange('technologyData', {
        ...technologyData,
        tools: updatedTools
      });
      toast.success('Technology tool deleted');
    }
  };

  const handleSecurityAdd = (security: Omit<SecurityMeasure, 'id'>) => {
    const newSecurity: SecurityMeasure = {
      ...security,
      id: Date.now().toString()
    };
    
    const updatedSecurity = [...technologyData.securityMeasures, newSecurity];
    onInputChange('technologyData', {
      ...technologyData,
      securityMeasures: updatedSecurity
    });
    
    setShowSecurityModal(false);
    setEditingSecurity(null);
    toast.success('Security measure added successfully');
  };

  const handleAssetAdd = (asset: Omit<ITAsset, 'id'>) => {
    const newAsset: ITAsset = {
      ...asset,
      id: Date.now().toString()
    };
    
    const updatedAssets = [...technologyData.assets, newAsset];
    onInputChange('technologyData', {
      ...technologyData,
      assets: updatedAssets
    });
    
    setShowAssetModal(false);
    setEditingAsset(null);
    toast.success('IT asset added successfully');
  };

  const renderToolModal = () => {
    if (!showToolModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {editingTool ? 'Edit Technology Tool' : 'Add Technology Tool'}
          </h3>
          
          <TechnologyToolForm
            tool={editingTool}
            categories={technologyCategories}
            onSubmit={editingTool ? handleToolUpdate : handleToolAdd}
            onCancel={() => {
              setShowToolModal(false);
              setEditingTool(null);
            }}
          />
        </div>
      </div>
    );
  };

  const renderInfrastructureTab = () => (
    <div className="space-y-6">
      {/* Technology Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Technology Budget
        </label>
        <input
          type="text"
          value={technologyData.budget || ''}
          onChange={(e) => onInputChange('technologyData', {
            ...technologyData,
            budget: e.target.value
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., $15,000"
          disabled={locked}
        />
      </div>

      {/* IT Infrastructure */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IT Infrastructure Overview
        </label>
        <RichTextEditor
          value={technologyData.infrastructure || ''}
          onChange={(content) => onInputChange('technologyData', {
            ...technologyData,
            infrastructure: content
          })}
          placeholder="Describe your current IT infrastructure, servers, network setup, and hardware..."
          disabled={locked}
          height={300}
        />
      </div>

      {/* Technology Tools */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Technology Tools & Software</h3>
          {!locked && (
            <button
              onClick={() => setShowToolModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </button>
          )}
        </div>

        {/* Technology Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {technologyCategories.map((cat) => {
            const IconComponent = cat.icon;
            const toolCount = technologyData.tools.filter((tool: TechnologyTool) => 
              tool.category === cat.category
            ).length;
            
            return (
              <div key={cat.category} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-2">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{cat.category}</h4>
                    <p className="text-sm text-gray-600">{toolCount} tools</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{cat.examples}</p>
              </div>
            );
          })}
        </div>

        {/* Current Tools List */}
        {technologyData.tools.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Current Tools</h4>
            {technologyData.tools.map((tool: TechnologyTool) => (
              <div key={tool.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h5 className="font-medium">{tool.name}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tool.status === 'active' ? 'bg-green-100 text-green-800' :
                      tool.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                      tool.status === 'deprecated' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tool.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tool.criticality === 'critical' ? 'bg-red-100 text-red-800' :
                      tool.criticality === 'high' ? 'bg-orange-100 text-orange-800' :
                      tool.criticality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tool.criticality} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{tool.category} • {tool.vendor}</p>
                  <div className="text-sm text-gray-500">
                    {tool.users} users • ${tool.cost}/year
                  </div>
                </div>
                {!locked && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingTool(tool);
                        setShowToolModal(true);
                      }}
                      className="p-1 text-gray-500 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToolDelete(tool.id)}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Management */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Management & Storage
        </label>
        <RichTextEditor
          value={technologyData.dataManagement || ''}
          onChange={(content) => onInputChange('technologyData', {
            ...technologyData,
            dataManagement: content
          })}
          placeholder="Describe how you manage, store, and backup organizational data..."
          disabled={locked}
          height={250}
        />
      </div>

      {/* Cloud Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cloud Services & Integration
        </label>
        <RichTextEditor
          value={technologyData.cloudServices || ''}
          onChange={(content) => onInputChange('technologyData', {
            ...technologyData,
            cloudServices: content
          })}
          placeholder="Describe your use of cloud services, SaaS applications, and integration strategies..."
          disabled={locked}
          height={200}
        />
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-red-600" />
          <h3 className="font-medium text-red-900">Security Status Overview</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-900">
              {technologyData.securityMeasures.filter((m: SecurityMeasure) => m.status === 'implemented').length}
            </div>
            <div className="text-red-700">Implemented</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-900">
              {technologyData.securityMeasures.filter((m: SecurityMeasure) => m.status === 'in-progress').length}
            </div>
            <div className="text-yellow-700">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-900">
              {technologyData.securityMeasures.filter((m: SecurityMeasure) => m.status === 'planned').length}
            </div>
            <div className="text-blue-700">Planned</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-900">
              {technologyData.securityMeasures.filter((m: SecurityMeasure) => m.priority === 'critical').length}
            </div>
            <div className="text-purple-700">Critical Priority</div>
          </div>
        </div>
      </div>

      {/* Security Measures */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Security Measures</h3>
          {!locked && (
            <button
              onClick={() => setShowSecurityModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Security Measure
            </button>
          )}
        </div>

        {technologyData.securityMeasures.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No security measures documented yet</p>
            <p className="text-sm">Add security measures to track your cybersecurity posture</p>
          </div>
        ) : (
          <div className="space-y-3">
            {technologyData.securityMeasures.map((measure: SecurityMeasure) => (
              <div key={measure.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-medium">{measure.type}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        measure.status === 'implemented' ? 'bg-green-100 text-green-800' :
                        measure.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {measure.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        measure.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        measure.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        measure.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {measure.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{measure.description}</p>
                    {measure.lastReviewed && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last reviewed: {new Date(measure.lastReviewed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {!locked && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingSecurity(measure);
                          setShowSecurityModal(true);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Policies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Information Security Policies
        </label>
        <RichTextEditor
          value={technologyData.securityPolicies || ''}
          onChange={(content) => onInputChange('technologyData', {
            ...technologyData,
            securityPolicies: content
          })}
          placeholder="Describe your information security policies, procedures, and guidelines..."
          disabled={locked}
          height={250}
        />
      </div>

      {/* Disaster Recovery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Disaster Recovery & Business Continuity
        </label>
        <RichTextEditor
          value={technologyData.disasterRecovery || ''}
          onChange={(content) => onInputChange('technologyData', {
            ...technologyData,
            disasterRecovery: content
          })}
          placeholder="Describe your disaster recovery plan, backup procedures, and business continuity strategies..."
          disabled={locked}
          height={250}
        />
      </div>

      {/* Compliance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Technology Compliance & Standards
        </label>
        <RichTextEditor
          value={technologyData.compliance || ''}
          onChange={(content) => onInputChange('technologyData', {
            ...technologyData,
            compliance: content
          })}
          placeholder="Describe compliance requirements, standards adherence (GDPR, HIPAA, etc.), and audit procedures..."
          disabled={locked}
          height={200}
        />
      </div>
    </div>
  );

  const renderDigitalTab = () => (
    <div className="space-y-6">
      {/* Digital Transformation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Digital Transformation Strategy
        </label>
        <RichTextEditor
          value={(formData as any).digitalTransformation || ''}
          onChange={(content) => onInputChange('digitalTransformation', content)}
          placeholder="Describe your organization's digital transformation goals and strategy..."
          disabled={locked}
          height={250}
        />
      </div>

      {/* Website & Online Presence */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website & Online Presence
        </label>
        <RichTextEditor
          value={(formData as any).onlinePresence || ''}
          onChange={(content) => onInputChange('onlinePresence', content)}
          placeholder="Describe your website, social media presence, and digital marketing efforts..."
          disabled={locked}
          height={200}
        />
      </div>

      {/* Digital Services */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Digital Services & Programs
        </label>
        <RichTextEditor
          value={(formData as any).digitalServices || ''}
          onChange={(content) => onInputChange('digitalServices', content)}
          placeholder="Describe any digital services you provide to beneficiaries, online programs, or virtual offerings..."
          disabled={locked}
          height={200}
        />
      </div>

      {/* Technology Training */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Staff Technology Training
        </label>
        <RichTextEditor
          value={(formData as any).techTraining || ''}
          onChange={(content) => onInputChange('techTraining', content)}
          placeholder="Describe technology training programs for staff and volunteers..."
          disabled={locked}
          height={150}
        />
      </div>
    </div>
  );

  const renderAssetsTab = () => (
    <div className="space-y-6">
      {/* IT Assets Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">IT Assets Inventory</h3>
          {!locked && (
            <button
              onClick={() => setShowAssetModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          )}
        </div>

        {technologyData.assets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Server className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No IT assets recorded yet</p>
            <p className="text-sm">Add hardware, software, and services to track your IT inventory</p>
          </div>
        ) : (
          <div className="space-y-3">
            {technologyData.assets.map((asset: ITAsset) => (
              <div key={asset.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-medium">{asset.name}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.type === 'hardware' ? 'bg-blue-100 text-blue-800' :
                        asset.type === 'software' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {asset.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        asset.status === 'active' ? 'bg-green-100 text-green-800' :
                        asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {asset.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {asset.specifications && <p>{asset.specifications}</p>}
                      {asset.assignedTo && <p>Assigned to: {asset.assignedTo}</p>}
                      {asset.location && <p>Location: {asset.location}</p>}
                      <div className="flex space-x-4">
                        {asset.purchaseDate && (
                          <span>Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}</span>
                        )}
                        {asset.warrantyExpiry && (
                          <span>Warranty expires: {new Date(asset.warrantyExpiry).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!locked && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingAsset(asset);
                          setShowAssetModal(true);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* IT Support */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IT Support & Maintenance
        </label>
        <RichTextEditor
          value={technologyData.itSupport || ''}
          onChange={(content) => onInputChange('technologyData', {
            ...technologyData,
            itSupport: content
          })}
          placeholder="Describe your IT support structure, maintenance procedures, and help desk operations..."
          disabled={locked}
          height={200}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Technology Overview Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Cpu className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Technology Infrastructure</h2>
            <p className="text-gray-600">Manage your organization's technology resources and digital capabilities</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{technologyData.tools.length}</div>
            <div className="text-sm text-gray-600">Tools</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{technologyData.securityMeasures.length}</div>
            <div className="text-sm text-gray-600">Security Measures</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{technologyData.assets.length}</div>
            <div className="text-sm text-gray-600">IT Assets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${technologyData.budget ? parseInt(technologyData.budget.replace(/[^0-9]/g, '') || '0').toLocaleString() : '0'}
            </div>
            <div className="text-sm text-gray-600">Annual Budget</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'infrastructure', label: 'Infrastructure', icon: Server },
            { key: 'security', label: 'Security', icon: Shield },
            { key: 'digital', label: 'Digital Services', icon: Globe },
            { key: 'assets', label: 'Assets', icon: HardDrive }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'infrastructure' && renderInfrastructureTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'digital' && renderDigitalTab()}
        {activeTab === 'assets' && renderAssetsTab()}
      </div>

      {/* Modals */}
      {renderToolModal()}
      {showSecurityModal && (
        <SecurityMeasureModal
          measure={editingSecurity}
          securityTypes={securityTypes}
          onSubmit={handleSecurityAdd as any}
          onCancel={() => {
            setShowSecurityModal(false);
            setEditingSecurity(null);
          }}
        />
      )}
      {showAssetModal && (
        <ITAssetModal
          asset={editingAsset}
          onSubmit={handleAssetAdd as any}
          onCancel={() => {
            setShowAssetModal(false);
            setEditingAsset(null);
          }}
        />
      )}
    </div>
  );
};

// Technology Tool Form Component
const TechnologyToolForm: React.FC<{
  tool: TechnologyTool | null;
  categories: unknown[];
  onSubmit: (tool: TechnologyTool) => void;
  onCancel: () => void;
}> = ({ tool, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: tool?.name || '',
    category: tool?.category || '',
    vendor: tool?.vendor || '',
    version: tool?.version || '',
    cost: tool?.cost || 0,
    users: tool?.users || 0,
    status: tool?.status || 'active',
    criticality: tool?.criticality || 'medium',
    description: tool?.description || '',
    implementationDate: tool?.implementationDate || '',
    renewalDate: tool?.renewalDate || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(tool ? { ...tool, ...formData } : { id: Date.now().toString(), ...formData } as TechnologyTool);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tool Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={(cat as any).category} value={(cat as any).category}>{(cat as any).category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
          <input
            type="text"
            value={formData.vendor}
            onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
          <input
            type="text"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Annual Cost ($)</label>
          <input
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Users</label>
          <input
            type="number"
            value={formData.users}
            onChange={(e) => setFormData({ ...formData, users: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="planned">Planned</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Criticality</label>
          <select
            value={formData.criticality}
            onChange={(e) => setFormData({ ...formData, criticality: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {tool ? 'Update Tool' : 'Add Tool'}
        </button>
      </div>
    </form>
  );
};

// Security Measure Modal Component
const SecurityMeasureModal: React.FC<{
  measure: SecurityMeasure | null;
  securityTypes: string[];
  onSubmit: (measure: unknown) => void;
  onCancel: () => void;
}> = ({ measure, securityTypes, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: measure?.type || '',
    description: measure?.description || '',
    status: measure?.status || 'planned',
    priority: measure?.priority || 'medium',
    lastReviewed: measure?.lastReviewed || '',
    nextReview: measure?.nextReview || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(measure ? { ...measure, ...formData } : { id: Date.now().toString(), ...formData } as SecurityMeasure);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {measure ? 'Edit Security Measure' : 'Add Security Measure'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Security Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type</option>
              {securityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="implemented">Implemented</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {measure ? 'Update' : 'Add'} Security Measure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// IT Asset Modal Component
const ITAssetModal: React.FC<{
  asset: ITAsset | null;
  onSubmit: (asset: unknown) => void;
  onCancel: () => void;
}> = ({ asset, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: asset?.type || 'hardware',
    name: asset?.name || '',
    specifications: asset?.specifications || '',
    purchaseDate: asset?.purchaseDate || '',
    warrantyExpiry: asset?.warrantyExpiry || '',
    assignedTo: asset?.assignedTo || '',
    location: asset?.location || '',
    status: asset?.status || 'active'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(asset ? { ...asset, ...formData } : { id: Date.now().toString(), ...formData } as ITAsset);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {asset ? 'Edit IT Asset' : 'Add IT Asset'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {asset ? 'Update' : 'Add'} Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechnologySection;
