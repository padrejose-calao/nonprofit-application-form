import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import {
  Hash, Plus, Link as LinkIcon, History, Settings,
  Search, Filter, Download, RefreshCw, AlertTriangle,
  Building, User, FileText, Calendar, ArrowRight
} from 'lucide-react';
import { 
  euidService, 
  EntityType, 
  EntityStatus, 
  AccessLevel, 
  RelationshipType
} from '../../services/euidService';
import type { EUID } from '../../services/euidTypes';
import { toast } from 'react-toastify';
// import EUIDDisplay from '../EUIDDisplay';

interface EUIDManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  organizationId: string;
  onEUIDCreated?: (euid: string) => void;
}

const EUIDManager: React.FC<EUIDManagerProps> = ({
  isOpen,
  onClose,
  currentUserId,
  organizationId,
  onEUIDCreated
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'search' | 'relationships' | 'status'>('create');
  const [loading, setLoading] = useState(false);
  
  // Create EUID state
  const [entityType, setEntityType] = useState<EntityType>(EntityType.DOCUMENT);
  const [accessLevel, setAccessLevel] = useState<AccessLevel | ''>('');
  const [externalRef, setExternalRef] = useState('');
  const [relationships, setRelationships] = useState<Array<{
    targetEUID: string;
    type: RelationshipType;
    startDate?: string;
    endDate?: string;
  }>>([]);

  // Search state
  const [_searchQuery, _setSearchQuery] = useState('');
  const [_searchResults, _setSearchResults] = useState<EUID[]>([]);
  const [_filterType, _setFilterType] = useState<EntityType | ''>('');
  const [_filterStatus, _setFilterStatus] = useState<EntityStatus | ''>('');

  // Status management state
  const [selectedEUID, setSelectedEUID] = useState('');
  const [newStatus, setNewStatus] = useState<EntityStatus>(EntityStatus.ACTIVE);
  const [cascadeChanges, setCascadeChanges] = useState(true);

  const entityTypeOptions = [
    { value: EntityType.COMPANY, label: 'Company', icon: Building },
    { value: EntityType.INDIVIDUAL, label: 'Individual', icon: User },
    { value: EntityType.DOCUMENT, label: 'Document', icon: FileText },
    { value: EntityType.REPORT, label: 'Report', icon: FileText },
    { value: EntityType.NONPROFIT, label: 'Nonprofit', icon: Building },
    { value: EntityType.PROJECT, label: 'Project', icon: Calendar },
    { value: EntityType.EVENT, label: 'Event', icon: Calendar },
  ];

  const relationshipTypeOptions = [
    { value: RelationshipType.CEO, label: 'CEO' },
    { value: RelationshipType.MANAGER, label: 'Manager' },
    { value: RelationshipType.EMPLOYEE, label: 'Employee' },
    { value: RelationshipType.BOARD, label: 'Board Member' },
    { value: RelationshipType.VOLUNTEER, label: 'Volunteer' },
    { value: RelationshipType.DONOR, label: 'Donor' },
    { value: RelationshipType.BENEFICIARY, label: 'Beneficiary' },
    { value: RelationshipType.PARENT, label: 'Parent' },
    { value: RelationshipType.CHILD, label: 'Child' },
    { value: RelationshipType.REPLACES, label: 'Replaces' }
  ];

  const handleCreateEUID = async () => {
    setLoading(true);
    try {
      let euid: string;
      
      if (relationships.length > 0) {
        euid = await euidService.generateRelatedEUID(
          entityType,
          currentUserId,
          relationships,
          accessLevel as AccessLevel || undefined
        );
      } else {
        euid = await euidService.generateEUID(
          entityType,
          currentUserId,
          accessLevel as AccessLevel || undefined,
          externalRef || undefined
        );
      }

      toast.success(`EUID created: ${euid}`);
      onEUIDCreated?.(euid);
      
      // Reset form
      setEntityType(EntityType.DOCUMENT);
      setAccessLevel('');
      setExternalRef('');
      setRelationships([]);
    } catch (error) {
      logger.error('Failed to create EUID:', error);
      toast.error('Failed to create EUID');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelationship = () => {
    setRelationships([
      ...relationships,
      {
        targetEUID: '',
        type: RelationshipType.PARENT,
        startDate: new Date().toISOString().split('T')[0]
      }
    ]);
  };

  const handleUpdateRelationship = (index: number, field: string, value: unknown) => {
    const updated = [...relationships];
    updated[index] = { ...updated[index], [field]: value };
    setRelationships(updated);
  };

  const handleRemoveRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const _handleSearch = async () => {
    // This would implement actual search functionality
    toast.info('Search functionality to be implemented');
  };

  const handleUpdateStatus = async () => {
    if (!selectedEUID) {
      toast.error('Please enter an EUID');
      return;
    }

    setLoading(true);
    try {
      await euidService.updateStatus(
        selectedEUID,
        newStatus,
        currentUserId,
        cascadeChanges
      );
      
      toast.success('Status updated successfully');
      setSelectedEUID('');
    } catch (error) {
      logger.error('Failed to update status:', error);
      toast.error('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Hash className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">EUID Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create EUID
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Search
          </button>
          <button
            onClick={() => setActiveTab('relationships')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'relationships'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-2" />
            Relationships
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'status'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Status Management
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'create' && (
            <div className="space-y-6">
              {/* Entity Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Entity Type *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {entityTypeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setEntityType(option.value)}
                        className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          entityType === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Access Level */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Access Level (Optional)
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as AccessLevel | '')}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default</option>
                  <option value={AccessLevel.PUBLIC}>🌐 Public</option>
                  <option value={AccessLevel.RESTRICTED}>🔒 Restricted</option>
                  <option value={AccessLevel.VIP}>⭐ VIP</option>
                </select>
              </div>

              {/* External Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  External Reference (Optional)
                </label>
                <input
                  type="text"
                  value={externalRef}
                  onChange={(e) => setExternalRef(e.target.value)}
                  placeholder="e.g., Legacy system ID"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Relationships */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-900">
                    Relationships (Optional)
                  </label>
                  <button
                    onClick={handleAddRelationship}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Relationship
                  </button>
                </div>
                
                {relationships.length > 0 && (
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    {relationships.map((rel, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={rel.targetEUID}
                          onChange={(e) => handleUpdateRelationship(index, 'targetEUID', e.target.value)}
                          placeholder="Target EUID"
                          className="flex-1 px-3 py-2 border rounded-md text-sm"
                        />
                        <select
                          value={rel.type}
                          onChange={(e) => handleUpdateRelationship(index, 'type', e.target.value)}
                          className="px-3 py-2 border rounded-md text-sm"
                        >
                          {relationshipTypeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveRelationship(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreateEUID}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create EUID'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Search form would go here */}
              <div className="text-center py-12 text-gray-500">
                Search functionality coming soon...
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="space-y-6">
              {/* Relationship management would go here */}
              <div className="text-center py-12 text-gray-500">
                Relationship management coming soon...
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  EUID to Update
                </label>
                <input
                  type="text"
                  value={selectedEUID}
                  onChange={(e) => setSelectedEUID(e.target.value)}
                  placeholder="Enter EUID (e.g., C12345)"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as EntityStatus)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={EntityStatus.ACTIVE}>Active</option>
                  <option value={EntityStatus.HISTORICAL}>Historical (Expired)</option>
                  <option value={EntityStatus.RETIRED}>Retired (Inactive)</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cascade"
                  checked={cascadeChanges}
                  onChange={(e) => setCascadeChanges(e.target.checked)}
                  className="rounded border-gray-200 text-blue-600"
                />
                <label htmlFor="cascade" className="text-sm text-gray-900">
                  Cascade status changes to related entities
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Status Change Rules:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Active → Historical: Document expired but org still active</li>
                      <li>Historical → Retired: When organization becomes inactive</li>
                      <li>Active → Retired: Entity removed from system</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdateStatus}
                  disabled={loading || !selectedEUID}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EUIDManager;