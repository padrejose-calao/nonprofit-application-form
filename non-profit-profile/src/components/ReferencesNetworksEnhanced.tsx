import React, { useState, useMemo } from 'react';
import { 
  Users, Globe, Building2, Plus, Edit2, Trash2, Link,
  Star, UserCheck, Network, Shield, Award, Calendar,
  Mail, Phone, MapPin, FileText, ExternalLink, Share2,
  CheckCircle, XCircle, Clock, Filter, Search, Download,
  User, ChevronRight, Tag, FolderOpen, UserPlus
} from 'lucide-react';
import ContactSelector, { ContactInfo } from './ContactSelector';
import { SectionLock } from './PermissionsManager';
import { toast } from 'react-toastify';
import ConfirmationDialog, { useConfirmation } from './ConfirmationDialog';
import ModuleHeader from './ModuleHeader';

// Enhanced interfaces that leverage contact manager
interface BaseRelationship {
  id: string;
  contactId: string;
  contact: ContactInfo; // From Contact Manager
  type: string;
  status: 'active' | 'pending' | 'inactive' | 'ended';
  startDate: string;
  endDate?: string;
  notes?: string;
  tags?: string[];
  documents?: string[];
  lastInteraction?: string;
  nextFollowUp?: string;
  rating?: number; // 1-5 stars
  customFields?: Record<string, any>;
}

interface Reference extends BaseRelationship {
  type: 'professional' | 'character' | 'board' | 'donor' | 'beneficiary' | 'community' | 'other';
  relationship: string;
  yearsKnown: number;
  canContact: boolean;
  preferredContactMethod: 'email' | 'phone' | 'mail';
  verified?: boolean;
  verifiedDate?: string;
  verifiedBy?: string;
}

interface Partner extends BaseRelationship {
  type: 'implementation' | 'funding' | 'referral' | 'resource' | 'advocacy' | 'strategic' | 'other';
  partnershipScope: string;
  agreementType?: 'mou' | 'contract' | 'informal' | 'grant';
  primaryContact?: ContactInfo;
  value?: number; // Monetary value if applicable
  deliverables?: string[];
  outcomes?: string[];
}

interface NetworkRelationship extends BaseRelationship {
  type: 'member' | 'affiliate' | 'chapter' | 'coalition' | 'alliance' | 'federation' | 'other';
  organizationId: string; // The network organization
  organization: ContactInfo; // Must be an organization
  membershipLevel?: string;
  role?: string; // Role within the network
  dues?: number;
  benefits?: string[];
  obligations?: string[];
  groupId?: string; // Link to group in contact manager
  leadOrganization?: ContactInfo; // Lead org if this is part of a group
}

interface EnhancedReferencesNetworksSectionProps {
  references: Reference[];
  partners: Partner[];
  networks: NetworkRelationship[];
  contacts: ContactInfo[];
  groups?: Array<{ // Groups from contact manager
    id: string;
    name: string;
    type: string;
    leadId?: string;
    leadContact?: ContactInfo;
    members: string[];
  }>;
  onReferenceChange: (references: Reference[]) => void;
  onPartnerChange: (partners: Partner[]) => void;
  onNetworkChange: (networks: NetworkRelationship[]) => void;
  className?: string;
  readonly?: boolean;
}

const EnhancedReferencesNetworksSection: React.FC<EnhancedReferencesNetworksSectionProps> = ({
  references = [],
  partners = [],
  networks = [],
  contacts = [],
  groups = [],
  onReferenceChange,
  onPartnerChange,
  onNetworkChange,
  className = '',
  readonly = false
}) => {
  const [activeTab, setActiveTab] = useState<'references' | 'partners' | 'networks'>('references');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const { confirm, ConfirmationComponent } = useConfirmation();

  // Type definitions for each tab
  const referenceTypes = [
    { id: 'professional', label: 'Professional Reference', icon: UserCheck, color: 'blue' },
    { id: 'character', label: 'Character Reference', icon: Star, color: 'green' },
    { id: 'board', label: 'Board Reference', icon: Users, color: 'purple' },
    { id: 'donor', label: 'Donor Reference', icon: Shield, color: 'yellow' },
    { id: 'beneficiary', label: 'Beneficiary Reference', icon: User, color: 'orange' },
    { id: 'community', label: 'Community Reference', icon: Award, color: 'indigo' },
    { id: 'other', label: 'Other', icon: Tag, color: 'gray' }
  ];

  const partnerTypes = [
    { id: 'implementation', label: 'Implementation Partner', icon: Users, color: 'blue' },
    { id: 'funding', label: 'Funding Partner', icon: Shield, color: 'green' },
    { id: 'referral', label: 'Referral Partner', icon: Share2, color: 'yellow' },
    { id: 'resource', label: 'Resource Partner', icon: FolderOpen, color: 'purple' },
    { id: 'advocacy', label: 'Advocacy Partner', icon: Globe, color: 'orange' },
    { id: 'strategic', label: 'Strategic Partner', icon: Network, color: 'indigo' },
    { id: 'other', label: 'Other', icon: Tag, color: 'gray' }
  ];

  const networkTypes = [
    { id: 'member', label: 'Member Organization', icon: Building2, color: 'blue' },
    { id: 'affiliate', label: 'Affiliate', icon: Link, color: 'green' },
    { id: 'chapter', label: 'Chapter', icon: Users, color: 'purple' },
    { id: 'coalition', label: 'Coalition Member', icon: Network, color: 'yellow' },
    { id: 'alliance', label: 'Alliance Partner', icon: Globe, color: 'orange' },
    { id: 'federation', label: 'Federation Member', icon: Building2, color: 'indigo' },
    { id: 'other', label: 'Other', icon: Tag, color: 'gray' }
  ];

  // Get the appropriate type configuration based on active tab
  const getTypeConfig = () => {
    switch (activeTab) {
      case 'references': return referenceTypes;
      case 'partners': return partnerTypes;
      case 'networks': return networkTypes;
      default: return [];
    }
  };

  // Filter and search functionality
  const filteredItems = useMemo(() => {
    let items: (Reference | Partner | NetworkRelationship)[] = [];
    
    switch (activeTab) {
      case 'references': items = references; break;
      case 'partners': items = partners; break;
      case 'networks': items = networks; break;
    }

    return items.filter(item => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        item.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contact.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [activeTab, references, partners, networks, filterType, filterStatus, searchTerm]);

  // Contact Card Component - Unified for all types
  const ContactCard: React.FC<{ item: Reference | Partner | NetworkRelationship }> = ({ item }) => {
    const typeConfig = getTypeConfig().find(t => t.id === item.type) || getTypeConfig()[0];
    const Icon = typeConfig.icon;
    const isEditing = editingItem === item.id;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'inactive': return 'bg-gray-100 text-gray-800';
        case 'ended': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const renderRating = (rating?: number) => {
      if (!rating) return null;
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      );
    };

    if (viewMode === 'list') {
      return (
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${typeConfig.color}-100`}>
                <Icon className={`w-4 h-4 text-${typeConfig.color}-600`} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{item.contact.name}</div>
                {item.contact.organization && (
                  <div className="text-sm text-gray-500">{item.contact.organization}</div>
                )}
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <span className="text-sm text-gray-600">{typeConfig.label}</span>
          </td>
          <td className="px-4 py-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
              {item.status}
            </span>
          </td>
          <td className="px-4 py-3">
            {item.contact.email && (
              <a href={`mailto:${item.contact.email}`} className="text-blue-600 hover:underline text-sm">
                {item.contact.email}
              </a>
            )}
          </td>
          <td className="px-4 py-3">{renderRating(item.rating)}</td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingItem(item.id)}
                className="text-gray-500 hover:text-gray-700"
                disabled={readonly}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-500 hover:text-red-700"
                disabled={readonly}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-${typeConfig.color}-100`}>
              <Icon className={`w-5 h-5 text-${typeConfig.color}-600`} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{item.contact.name}</h3>
              {item.contact.organization && (
                <p className="text-sm text-gray-500">{item.contact.organization}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{typeConfig.label}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
          {!readonly && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditingItem(item.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2 text-sm">
          {item.contact.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              <a href={`mailto:${item.contact.email}`} className="hover:text-blue-600">
                {item.contact.email}
              </a>
            </div>
          )}
          {item.contact.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <a href={`tel:${item.contact.phone}`} className="hover:text-blue-600">
                {item.contact.phone}
              </a>
            </div>
          )}
          {item.contact.address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{item.contact.address}</span>
            </div>
          )}
        </div>

        {/* Type-specific information */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {activeTab === 'references' && (
            <ReferenceDetails reference={item as Reference} />
          )}
          {activeTab === 'partners' && (
            <PartnerDetails partner={item as Partner} />
          )}
          {activeTab === 'networks' && (
            <NetworkDetails network={item as NetworkRelationship} groups={groups} />
          )}
        </div>

        {/* Rating and tags */}
        <div className="mt-3 flex items-center justify-between">
          {renderRating(item.rating)}
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1">
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {item.nextFollowUp && (
          <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
            <Clock className="w-3 h-3 inline mr-1" />
            Follow up: {new Date(item.nextFollowUp).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  // Type-specific detail components
  const ReferenceDetails: React.FC<{ reference: Reference }> = ({ reference }) => (
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex justify-between">
        <span>Relationship:</span>
        <span className="font-medium text-gray-900">{reference.relationship}</span>
      </div>
      <div className="flex justify-between">
        <span>Years Known:</span>
        <span className="font-medium text-gray-900">{reference.yearsKnown} years</span>
      </div>
      <div className="flex justify-between">
        <span>Can Contact:</span>
        <span className="font-medium text-gray-900">
          {reference.canContact ? (
            <CheckCircle className="w-4 h-4 text-green-600 inline" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 inline" />
          )}
        </span>
      </div>
      {reference.verified && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs">Verified on {reference.verifiedDate}</span>
        </div>
      )}
    </div>
  );

  const PartnerDetails: React.FC<{ partner: Partner }> = ({ partner }) => (
    <div className="space-y-2 text-sm text-gray-600">
      <div className="flex justify-between">
        <span>Partnership Scope:</span>
        <span className="font-medium text-gray-900">{partner.partnershipScope}</span>
      </div>
      {partner.agreementType && (
        <div className="flex justify-between">
          <span>Agreement:</span>
          <span className="font-medium text-gray-900 capitalize">{partner.agreementType}</span>
        </div>
      )}
      {partner.value && (
        <div className="flex justify-between">
          <span>Value:</span>
          <span className="font-medium text-gray-900">${partner.value.toLocaleString()}</span>
        </div>
      )}
      {partner.primaryContact && (
        <div className="mt-2 p-2 bg-gray-50 rounded">
          <span className="text-xs text-gray-500">Primary Contact:</span>
          <div className="font-medium text-gray-900">{partner.primaryContact.name}</div>
        </div>
      )}
    </div>
  );

  const NetworkDetails: React.FC<{ network: NetworkRelationship; groups: any[] }> = ({ network, groups }) => {
    const group = groups.find(g => g.id === network.groupId);
    
    return (
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Network:</span>
          <span className="font-medium text-gray-900">{network.organization.name}</span>
        </div>
        {network.membershipLevel && (
          <div className="flex justify-between">
            <span>Level:</span>
            <span className="font-medium text-gray-900">{network.membershipLevel}</span>
          </div>
        )}
        {network.role && (
          <div className="flex justify-between">
            <span>Role:</span>
            <span className="font-medium text-gray-900">{network.role}</span>
          </div>
        )}
        {group && (
          <div className="mt-2 p-2 bg-blue-50 rounded">
            <span className="text-xs text-blue-600">Part of Group:</span>
            <div className="font-medium text-blue-900">{group.name}</div>
            {group.leadContact && (
              <div className="text-xs text-blue-700 mt-1">
                Led by: {group.leadContact.name}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Handle CRUD operations
  const handleAdd = (newItem: Partial<Reference | Partner | NetworkRelationship>) => {
    switch (activeTab) {
      case 'references':
        onReferenceChange([...references, { ...newItem, id: Date.now().toString() } as Reference]);
        break;
      case 'partners':
        onPartnerChange([...partners, { ...newItem, id: Date.now().toString() } as Partner]);
        break;
      case 'networks':
        onNetworkChange([...networks, { ...newItem, id: Date.now().toString() } as NetworkRelationship]);
        break;
    }
    setShowAddModal(false);
    toast.success(`${activeTab.slice(0, -1)} added successfully`);
  };

  const handleUpdate = (id: string, updates: Partial<Reference | Partner | NetworkRelationship>) => {
    switch (activeTab) {
      case 'references':
        onReferenceChange(references.map(r => r.id === id ? { ...r, ...updates } as Reference : r));
        break;
      case 'partners':
        onPartnerChange(partners.map(p => p.id === id ? { ...p, ...updates } as Partner : p));
        break;
      case 'networks':
        onNetworkChange(networks.map(n => n.id === id ? { ...n, ...updates } as NetworkRelationship : n));
        break;
    }
    setEditingItem(null);
    toast.success(`${activeTab.slice(0, -1)} updated successfully`);
  };

  const handleDelete = async (id: string) => {
    await confirm({
      title: `Delete ${activeTab.slice(0, -1)}?`,
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: () => {
        switch (activeTab) {
          case 'references':
            onReferenceChange(references.filter(r => r.id !== id));
            break;
          case 'partners':
            onPartnerChange(partners.filter(p => p.id !== id));
            break;
          case 'networks':
            onNetworkChange(networks.filter(n => n.id !== id));
            break;
        }
        toast.success(`${activeTab.slice(0, -1)} deleted successfully`);
      }
    });
  };

  // Add/Edit Modal Component
  const AddEditModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    item?: Reference | Partner | NetworkRelationship;
  }> = ({ isOpen, onClose, item }) => {
    const [formData, setFormData] = useState<any>(item || {
      type: getTypeConfig()[0].id,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0]
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (item) {
        handleUpdate(item.id, formData);
      } else {
        handleAdd(formData);
      }
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {item ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Contact Selection */}
            <ContactSelector
              label={activeTab === 'networks' ? 'Select Organization' : 'Select Contact'}
              value={formData.contact}
              onChange={(contact) => {
                if (contact && !(contact instanceof Array)) {
                  setFormData({ 
                    ...formData, 
                    contactId: contact.id,
                    contact: contact 
                  });
                }
              }}
              type={activeTab === 'networks' ? 'organization' : 'both'}
              required
              showAddButton={true}
              placeholder={`Search for ${activeTab === 'networks' ? 'organization' : 'contact'}...`}
            />

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                {getTypeConfig().map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            {/* Type-specific fields */}
            {activeTab === 'references' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship || ''}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years Known</label>
                    <input
                      type="number"
                      value={formData.yearsKnown || 0}
                      onChange={(e) => setFormData({ ...formData, yearsKnown: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Can Contact</label>
                    <select
                      value={formData.canContact ? 'yes' : 'no'}
                      onChange={(e) => setFormData({ ...formData, canContact: e.target.value === 'yes' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'partners' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partnership Scope</label>
                  <textarea
                    value={formData.partnershipScope || ''}
                    onChange={(e) => setFormData({ ...formData, partnershipScope: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agreement Type</label>
                    <select
                      value={formData.agreementType || ''}
                      onChange={(e) => setFormData({ ...formData, agreementType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option value="mou">MOU</option>
                      <option value="contract">Contract</option>
                      <option value="informal">Informal</option>
                      <option value="grant">Grant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
                    <input
                      type="number"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'networks' && (
              <>
                {/* Network Organization Selection */}
                <ContactSelector
                  label="Network Organization"
                  value={formData.organization}
                  onChange={(contact) => {
                    if (contact && !(contact instanceof Array)) {
                      setFormData({ 
                        ...formData, 
                        organizationId: contact.id,
                        organization: contact 
                      });
                    }
                  }}
                  type="organization"
                  required
                  showAddButton={true}
                  placeholder="Search for network organization..."
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Membership Level</label>
                    <input
                      type="text"
                      value={formData.membershipLevel || ''}
                      onChange={(e) => setFormData({ ...formData, membershipLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Gold, Silver, Basic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Board Member, Committee Chair"
                    />
                  </div>
                </div>

                {/* Group Selection */}
                {groups.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part of Group</label>
                    <select
                      value={formData.groupId || ''}
                      onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Not part of a group</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>
                          {group.name} {group.leadContact && `(Led by ${group.leadContact.name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating })}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        rating <= (formData.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {item ? 'Update' : 'Add'} {activeTab.slice(0, -1)}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`references-networks-enhanced flex flex-col h-full ${className}`}>
      {/* Fixed Header and Tabs Container */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="bg-white rounded-t-lg border border-gray-200 p-6 pb-0">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Network className="w-6 h-6 mr-2 text-blue-600" />
              References & Networks
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage professional references, partnership relationships, and network affiliations
            </p>
          </div>
          
          {/* Tab Navigation - Styled like Financials */}
          <div className="flex gap-1 border-b -mx-6 px-6">
            <button
              onClick={() => setActiveTab('references')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'references'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              References
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'references' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {references.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'partners'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Partners
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'partners' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {partners.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('networks')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'networks'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              Networks
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'networks' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {networks.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-b-lg border-x border-b border-gray-200 p-6 pt-4">
        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          {getTypeConfig().map(type => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
          <option value="ended">Ended</option>
        </select>

        {/* View Toggle */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode('card')}
            className={`p-1 rounded ${viewMode === 'card' ? 'bg-gray-200' : ''}`}
          >
            <Globe className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-200' : ''}`}
          >
            <Users className="w-4 h-4" />
          </button>
        </div>

        {/* Add Button */}
        {!readonly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab.slice(0, -1)}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <ContactCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map(item => (
                  <ContactCard key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {activeTab === 'references' && <UserCheck className="w-12 h-12 mx-auto" />}
              {activeTab === 'partners' && <Users className="w-12 h-12 mx-auto" />}
              {activeTab === 'networks' && <Network className="w-12 h-12 mx-auto" />}
            </div>
            <p className="text-gray-500">
              No {activeTab} found. 
              {!readonly && ' Click the add button to get started.'}
            </p>
          </div>
        )}
        
        {/* Lock Status */}
        <div className="mt-6 flex justify-end">
          <SectionLock resourceId="references-networks" />
        </div>
      </div>
      </div>

      {/* Modals */}
      <AddEditModal 
        isOpen={showAddModal || !!editingItem}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        item={editingItem ? filteredItems.find(i => i.id === editingItem) : undefined}
      />

      {/* Confirmation Dialog */}
      <ConfirmationComponent />
    </div>
  );
};

export default EnhancedReferencesNetworksSection;