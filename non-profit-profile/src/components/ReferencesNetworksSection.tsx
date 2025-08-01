import React, { useState } from 'react';
import { 
  Users, Globe, Building2, Plus, Edit2, Trash2, Link,
  Star, UserCheck, Network, Shield, Award, Calendar,
  Mail, Phone, MapPin, FileText, ExternalLink, Share2,
  CheckCircle, XCircle, Clock, Filter, Search, Download
} from 'lucide-react';
import ContactSelector from './ContactSelector';
import NarrativeEntryField from './NarrativeEntryField';
import DocumentUploadField from './DocumentUploadField';
import { SectionLock } from './PermissionsManager';
import { toast } from 'react-toastify';
import ConfirmationDialog, { useConfirmation } from './ConfirmationDialog';

interface Reference {
  id: string;
  contactId: string;
  contact: any; // From Contact Manager
  type: 'professional' | 'partner' | 'funder' | 'beneficiary' | 'community' | 'other';
  relationship: string;
  yearsKnown: number;
  canContact: boolean;
  preferredContactMethod: 'email' | 'phone' | 'mail';
  lastContacted?: string;
  notes?: string;
  rating?: number; // 1-5 stars
  verified?: boolean;
}

interface NetworkAffiliation {
  id: string;
  name: string;
  type: 'national' | 'state' | 'local' | 'international' | 'industry' | 'faith' | 'other';
  memberSince: string;
  membershipLevel?: string;
  role?: string; // e.g., "Board Member", "Committee Chair"
  benefits?: string;
  dues?: number;
  primaryContact?: string;
  website?: string;
  description?: string;
  logo?: string;
}

interface Partnership {
  id: string;
  organizationId: string; // From Contact Manager organizations
  organization: any;
  type: 'implementation' | 'funding' | 'referral' | 'resource' | 'advocacy' | 'other';
  status: 'active' | 'pending' | 'inactive' | 'ended';
  startDate: string;
  endDate?: string;
  description: string;
  outcomes?: string;
  agreementDocument?: any;
  primaryContact?: string;
  value?: number; // Monetary value if applicable
}

interface ReferencesNetworksSectionProps {
  references: Reference[];
  networkAffiliations: NetworkAffiliation[];
  partnerships: Partnership[];
  contacts: any[];
  narrativeFields: Record<string, any>;
  documents: Record<string, any>;
  onReferenceAdd: (reference: Reference) => void;
  onReferenceUpdate: (referenceId: string, updates: Partial<Reference>) => void;
  onReferenceRemove: (referenceId: string) => void;
  onNetworkAdd: (network: NetworkAffiliation) => void;
  onNetworkUpdate: (networkId: string, updates: Partial<NetworkAffiliation>) => void;
  onNetworkRemove: (networkId: string) => void;
  onPartnershipAdd: (partnership: Partnership) => void;
  onPartnershipUpdate: (partnershipId: string, updates: Partial<Partnership>) => void;
  onPartnershipRemove: (partnershipId: string) => void;
  onNarrativeChange: (fieldId: string, content: string) => void;
  onDocumentUpload: (fieldId: string, file: File) => void;
  className?: string;
}

const ReferencesNetworksSection: React.FC<ReferencesNetworksSectionProps> = ({
  references,
  networkAffiliations,
  partnerships,
  contacts,
  narrativeFields,
  documents,
  onReferenceAdd,
  onReferenceUpdate,
  onReferenceRemove,
  onNetworkAdd,
  onNetworkUpdate,
  onNetworkRemove,
  onPartnershipAdd,
  onPartnershipUpdate,
  onPartnershipRemove,
  onNarrativeChange,
  onDocumentUpload,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'references' | 'networks' | 'partnerships'>('references');
  const [addingReference, setAddingReference] = useState(false);
  const [addingNetwork, setAddingNetwork] = useState(false);
  const [addingPartnership, setAddingPartnership] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Reference types
  const referenceTypes = [
    { id: 'professional', label: 'Professional Reference', icon: UserCheck },
    { id: 'partner', label: 'Partner Organization', icon: Building2 },
    { id: 'funder', label: 'Funder/Donor', icon: Shield },
    { id: 'beneficiary', label: 'Beneficiary/Client', icon: Users },
    { id: 'community', label: 'Community Leader', icon: Award },
    { id: 'other', label: 'Other', icon: Star }
  ];

  // Network types
  const networkTypes = [
    { id: 'national', label: 'National Organization' },
    { id: 'state', label: 'State Association' },
    { id: 'local', label: 'Local Network' },
    { id: 'international', label: 'International Body' },
    { id: 'industry', label: 'Industry Association' },
    { id: 'faith', label: 'Faith-Based Network' },
    { id: 'other', label: 'Other' }
  ];

  // Partnership types
  const partnershipTypes = [
    { id: 'implementation', label: 'Implementation Partner' },
    { id: 'funding', label: 'Funding Partner' },
    { id: 'referral', label: 'Referral Partner' },
    { id: 'resource', label: 'Resource Sharing' },
    { id: 'advocacy', label: 'Advocacy Partner' },
    { id: 'other', label: 'Other' }
  ];

  // Filter items based on search and filter
  const filterItems = (items: any[], type: string) => {
    return items.filter(item => {
      const matchesFilter = filterType === 'all' || item.type === filterType;
      const matchesSearch = searchTerm === '' || 
        (JSON.stringify(item) || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  // Render reference card
  const renderReferenceCard = (reference: Reference) => {
    const isEditing = editingItem === reference.id;
    const typeInfo = referenceTypes.find(t => t.id === reference.type);

    return (
      <div key={reference.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {typeInfo && <typeInfo.icon className="w-5 h-5 text-gray-500" />}
              <h4 className="font-medium text-gray-900">
                {reference.contact?.name || 'Unknown Contact'}
              </h4>
              {reference.verified && (
                <span title="Verified reference">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-1">{reference.relationship}</p>
            <p className="text-xs text-gray-500">Known for {reference.yearsKnown} years</p>
            
            {reference.rating && (
              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < reference.rating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            )}
            
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              {reference.canContact ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Can contact
                </span>
              ) : (
                <span className="flex items-center text-red-600">
                  <XCircle className="w-3 h-3 mr-1" />
                  Do not contact
                </span>
              )}
              
              <span className="flex items-center">
                {reference.preferredContactMethod === 'email' && <Mail className="w-3 h-3 mr-1" />}
                {reference.preferredContactMethod === 'phone' && <Phone className="w-3 h-3 mr-1" />}
                {reference.preferredContactMethod === 'mail' && <MapPin className="w-3 h-3 mr-1" />}
                {reference.preferredContactMethod}
              </span>
              
              {reference.lastContacted && (
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Last: {new Date(reference.lastContacted).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingItem(isEditing ? null : reference.id)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded"
              title={isEditing ? "Save" : "Edit"}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRemoveReference(reference.id)}
              className="p-1 text-gray-500 hover:text-red-600 rounded"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {reference.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
            {reference.notes}
          </div>
        )}
      </div>
    );
  };

  // Render network card
  const renderNetworkCard = (network: NetworkAffiliation) => {
    return (
      <div key={network.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {network.logo && (
                <img src={network.logo} alt={network.name} className="w-10 h-10 object-contain" />
              )}
              <div>
                <h4 className="font-medium text-gray-900">{network.name}</h4>
                <p className="text-sm text-gray-600">
                  {networkTypes.find(t => t.id === network.type)?.label || network.type}
                </p>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p>Member since {new Date(network.memberSince).getFullYear()}</p>
              {network.membershipLevel && <p>Level: {network.membershipLevel}</p>}
              {network.role && <p>Role: {network.role}</p>}
              {network.dues && <p>Annual dues: ${network.dues.toLocaleString()}</p>}
            </div>
            
            {network.website && (
              <a
                href={network.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit website
              </a>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingItem(network.id)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRemoveNetwork(network.id)}
              className="p-1 text-gray-500 hover:text-red-600 rounded"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render partnership card
  const renderPartnershipCard = (partnership: Partnership) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-gray-100 text-gray-800',
      ended: 'bg-red-100 text-red-800'
    };

    return (
      <div key={partnership.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <h4 className="font-medium text-gray-900">
                {partnership.organization?.name || 'Unknown Organization'}
              </h4>
              <span className={`px-2 py-0.5 text-xs rounded ${statusColors[partnership.status]}`}>
                {partnership.status}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {partnershipTypes.find(t => t.id === partnership.type)?.label || partnership.type}
            </p>
            
            <p className="text-sm text-gray-700 mb-2">{partnership.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                Since {new Date(partnership.startDate).toLocaleDateString()}
              </span>
              
              {partnership.value && (
                <span className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  ${partnership.value.toLocaleString()}
                </span>
              )}
              
              {partnership.agreementDocument && (
                <span className="flex items-center text-green-600">
                  <FileText className="w-3 h-3 mr-1" />
                  Agreement on file
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setEditingItem(partnership.id)}
              className="p-1 text-gray-500 hover:text-blue-600 rounded"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRemovePartnership(partnership.id)}
              className="p-1 text-gray-500 hover:text-red-600 rounded"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle remove actions
  const handleRemoveReference = async (referenceId: string) => {
    const confirmed = await confirm({
      title: 'Remove Reference',
      message: 'Are you sure you want to remove this reference?',
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        onReferenceRemove(referenceId);
        toast.success('Reference removed');
      }
    });
  };

  const handleRemoveNetwork = async (networkId: string) => {
    const confirmed = await confirm({
      title: 'Remove Network Affiliation',
      message: 'Are you sure you want to remove this network affiliation?',
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        onNetworkRemove(networkId);
        toast.success('Network affiliation removed');
      }
    });
  };

  const handleRemovePartnership = async (partnershipId: string) => {
    const confirmed = await confirm({
      title: 'Remove Partnership',
      message: 'Are you sure you want to remove this partnership?',
      confirmText: 'Remove',
      variant: 'danger',
      onConfirm: () => {
        onPartnershipRemove(partnershipId);
        toast.success('Partnership removed');
      }
    });
  };

  return (
    <div className={`references-networks-section ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">References & Networks</h2>
          <p className="text-gray-600 mt-1">Professional references, network affiliations, and partnerships</p>
        </div>
        <SectionLock resourceId="references-networks" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('references')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'references'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          References ({references.length})
        </button>
        <button
          onClick={() => setActiveTab('networks')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'networks'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Networks ({networkAffiliations.length})
        </button>
        <button
          onClick={() => setActiveTab('partnerships')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'partnerships'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Partnerships ({partnerships.length})
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          {activeTab === 'references' && referenceTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
          {activeTab === 'networks' && networkTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
          {activeTab === 'partnerships' && partnershipTypes.map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* References Tab */}
      {activeTab === 'references' && (
        <div className="space-y-6">
          {!addingReference && (
            <button
              onClick={() => setAddingReference(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Reference
            </button>
          )}

          {addingReference && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Reference</h3>
              <div className="space-y-4">
                <ContactSelector
                  label="Select Contact"
                  value={null}
                  onChange={(contact) => {
                    if (contact && !(contact instanceof Array)) {
                      const newReference: Reference = {
                        id: Date.now().toString(),
                        contactId: contact.id,
                        contact,
                        type: 'professional',
                        relationship: '',
                        yearsKnown: 1,
                        canContact: true,
                        preferredContactMethod: 'email'
                      };
                      onReferenceAdd(newReference);
                      setAddingReference(false);
                      toast.success('Reference added');
                    }
                  }}
                  type="both"
                  showAddButton={true}
                  placeholder="Search for contact..."
                />
                <button
                  onClick={() => setAddingReference(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filterItems(references, 'references').map(reference => renderReferenceCard(reference))}
          </div>

          {references.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No references added yet. Click "Add Reference" to get started.
            </div>
          )}
        </div>
      )}

      {/* Networks Tab */}
      {activeTab === 'networks' && (
        <div className="space-y-6">
          {!addingNetwork && (
            <button
              onClick={() => setAddingNetwork(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Network Affiliation
            </button>
          )}

          {addingNetwork && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Network Affiliation</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const newNetwork: NetworkAffiliation = {
                    id: Date.now().toString(),
                    name: formData.get('name') as string,
                    type: formData.get('type') as any,
                    memberSince: formData.get('memberSince') as string,
                    membershipLevel: formData.get('membershipLevel') as string,
                    website: formData.get('website') as string
                  };
                  onNetworkAdd(newNetwork);
                  setAddingNetwork(false);
                  toast.success('Network affiliation added');
                }}
                className="space-y-4"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="Network name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <select
                  name="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {networkTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                <input
                  name="memberSince"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="membershipLevel"
                  type="text"
                  placeholder="Membership level (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  name="website"
                  type="url"
                  placeholder="Website (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setAddingNetwork(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Network
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filterItems(networkAffiliations, 'networks').map(network => renderNetworkCard(network))}
          </div>

          {networkAffiliations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No network affiliations added yet.
            </div>
          )}
        </div>
      )}

      {/* Partnerships Tab */}
      {activeTab === 'partnerships' && (
        <div className="space-y-6">
          {!addingPartnership && (
            <button
              onClick={() => setAddingPartnership(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Partnership
            </button>
          )}

          {addingPartnership && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Partnership</h3>
              <div className="space-y-4">
                <ContactSelector
                  label="Select Partner Organization"
                  value={null}
                  onChange={(contact) => {
                    if (contact && !(contact instanceof Array)) {
                      const newPartnership: Partnership = {
                        id: Date.now().toString(),
                        organizationId: contact.id,
                        organization: contact,
                        type: 'implementation',
                        status: 'active',
                        startDate: new Date().toISOString().split('T')[0],
                        description: ''
                      };
                      onPartnershipAdd(newPartnership);
                      setAddingPartnership(false);
                      toast.success('Partnership added');
                    }
                  }}
                  type="organization"
                  showAddButton={true}
                  placeholder="Search for organization..."
                />
                <button
                  onClick={() => setAddingPartnership(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {filterItems(partnerships, 'partnerships').map(partnership => renderPartnershipCard(partnership))}
          </div>

          {partnerships.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No partnerships added yet. Click "Add Partnership" to get started.
            </div>
          )}
        </div>
      )}

      {/* Narrative Fields */}
      <div className="mt-8 space-y-6">
        <NarrativeEntryField
          label="References Statement"
          value={narrativeFields.referencesStatement || ''}
          onChange={(content) => onNarrativeChange('referencesStatement', content)}
          placeholder="Provide a summary of your organization's references and their relationships..."
        />

        <NarrativeEntryField
          label="Network Participation"
          value={narrativeFields.networkParticipation || ''}
          onChange={(content) => onNarrativeChange('networkParticipation', content)}
          placeholder="Describe your organization's participation in networks and associations..."
        />

        <NarrativeEntryField
          label="Partnership Strategy"
          value={narrativeFields.partnershipStrategy || ''}
          onChange={(content) => onNarrativeChange('partnershipStrategy', content)}
          placeholder="Explain your approach to partnerships and collaboration..."
        />
      </div>

      {/* Document Uploads */}
      <div className="mt-8 space-y-6">
        <DocumentUploadField
          label="Reference Letters"
          value={documents.referenceLetters}
          onChange={(files) => onDocumentUpload('referenceLetters', files as any)}
          multiple={true}
          helpText="Upload letters of reference or recommendation"
        />

        <DocumentUploadField
          label="Partnership Agreements"
          value={documents.partnershipAgreements}
          onChange={(files) => onDocumentUpload('partnershipAgreements', files as any)}
          multiple={true}
          helpText="Upload MOUs, partnership agreements, or collaboration documents"
        />

        <DocumentUploadField
          label="Network Memberships"
          value={documents.networkMemberships}
          onChange={(files) => onDocumentUpload('networkMemberships', files as any)}
          multiple={true}
          helpText="Upload membership certificates or documentation"
        />
      </div>

      {/* Export Options */}
      <div className="mt-8 flex justify-end">
        <button
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export References & Networks
        </button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default ReferencesNetworksSection;