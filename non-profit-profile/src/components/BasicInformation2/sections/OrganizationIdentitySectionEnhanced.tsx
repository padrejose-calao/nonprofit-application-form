import React, { useState } from 'react';
import { SectionProps, ContactCard } from '../types';
import { Plus, Edit2, Check, X, ChevronDown, ChevronUp, Trash2, Users } from 'lucide-react';
import ContactSelectorSimple from '../../ContactSelectorSimple';
import UniversalNameField from '../components/UniversalNameField';
import DocumentUpload from '../shared/DocumentUpload/DocumentUpload';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface RelatedOrganization {
  id: string;
  name: string;
  ein?: string;
  type: 'parent' | 'child' | 'sibling' | 'fiscal_sponsor';
  contactCardId?: string;
  contactPerson?: string;
  contactPersonId?: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

const OrganizationIdentitySectionEnhanced: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  const typedData = data as any;
  const [selectedOrgCard, setSelectedOrgCard] = useState<ContactCard | null>(null);
  const [showStatesDropdown, setShowStatesDropdown] = useState(false);
  const [showOrgSelector, setShowOrgSelector] = useState<string | null>(null);
  const [relatedOrganizations, setRelatedOrganizations] = useState<RelatedOrganization[]>([]);
  const [editingSubOrg, setEditingSubOrg] = useState<string | null>(null);
  const [subOrgForm, setSubOrgForm] = useState<Partial<RelatedOrganization>>({});
  const [showPersonSelector, setShowPersonSelector] = useState<string | null>(null);


  const handleStateToggle = (state: string) => {
    const currentStates = typedData.statesOfOperation || [];
    if (currentStates.includes(state)) {
      onChange('statesOfOperation', currentStates.filter((s: string) => s !== state));
    } else {
      onChange('statesOfOperation', [...currentStates, state]);
    }
  };

  const handleAddOrganization = (type: 'parent' | 'child' | 'sibling' | 'fiscal_sponsor') => {
    setShowOrgSelector(type);
  };

  const handleSelectOrganization = (type: string, orgCard: unknown) => {
    const typedOrgCard = orgCard as any;
    const newOrg: RelatedOrganization = {
      id: Date.now().toString(),
      name: typedOrgCard.name || typedOrgCard.displayName,
      ein: typedOrgCard.taxId,
      type: type as RelatedOrganization['type'],
      contactCardId: typedOrgCard.id,
      email: typedOrgCard.email || '',
      phone: typedOrgCard.phone || ''
    };

    if (type === 'parent') {
      // Only one parent allowed
      setRelatedOrganizations(prev => [
        ...prev.filter(org => org.type !== 'parent'),
        newOrg
      ]);
      onChange('parentOrgDetails', {
        parentName: newOrg.name,
        parentTaxId: newOrg.ein
      });
      onChange('hasParentOrg', true);
    } else if (type === 'child') {
      setRelatedOrganizations(prev => [...prev, newOrg]);
      // Update subsidiaries in form data
      const currentSubs = typedData.subsidiaries || [];
      onChange('subsidiaries', [...currentSubs, {
        name: newOrg.name,
        ein: newOrg.ein,
        contactPerson: '',
        email: newOrg.email,
        phone: newOrg.phone,
        relationship: ''
      }]);
      onChange('hasSubsidiaries', true);
    } else {
      setRelatedOrganizations(prev => [...prev, newOrg]);
    }
    
    setShowOrgSelector(null);
  };

  const handleDeleteOrganization = (orgId: string) => {
    const org = relatedOrganizations.find(o => o.id === orgId);
    if (org?.type === 'parent') {
      onChange('parentOrgDetails', null);
      onChange('hasParentOrg', false);
    } else if (org?.type === 'child') {
      // Remove from subsidiaries
      const currentSubs = typedData.subsidiaries || [];
      const updatedSubs = currentSubs.filter((sub: unknown) => (sub as any).name !== org.name);
      onChange('subsidiaries', updatedSubs);
      if (updatedSubs.length === 0) {
        onChange('hasSubsidiaries', false);
      }
    }
    setRelatedOrganizations(prev => prev.filter(org => org.id !== orgId));
  };

  const selectedStatesCount = (typedData.statesOfOperation || []).length;

  const handleEditSubOrg = (org: RelatedOrganization) => {
    setEditingSubOrg(org.id);
    setSubOrgForm({
      contactPerson: org.contactPerson || '',
      email: org.email || '',
      phone: org.phone || '',
      relationship: org.relationship || ''
    });
  };

  const handleSaveSubOrg = (orgId: string) => {
    const orgIndex = relatedOrganizations.findIndex(o => o.id === orgId);
    if (orgIndex !== -1) {
      const updatedOrg = {
        ...relatedOrganizations[orgIndex],
        ...subOrgForm
      };
      
      const updatedOrgs = [...relatedOrganizations];
      updatedOrgs[orgIndex] = updatedOrg;
      setRelatedOrganizations(updatedOrgs);
      
      // Update subsidiaries in form data if it's a child org
      if (updatedOrg.type === 'child') {
        const currentSubs = typedData.subsidiaries || [];
        const subIndex = currentSubs.findIndex((sub: unknown) => (sub as any).name === updatedOrg.name);
        if (subIndex !== -1) {
          const updatedSubs = [...currentSubs];
          updatedSubs[subIndex] = {
            name: updatedOrg.name,
            ein: updatedOrg.ein,
            contactPerson: updatedOrg.contactPerson,
            email: updatedOrg.email,
            phone: updatedOrg.phone,
            relationship: updatedOrg.relationship
          };
          onChange('subsidiaries', updatedSubs);
        }
      }
    }
    
    setEditingSubOrg(null);
    setSubOrgForm({});
  };

  const handleCancelEdit = () => {
    setEditingSubOrg(null);
    setSubOrgForm({});
  };


  return (
    <div className="space-y-4">
      {/* State of Incorporation - FIRST */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State of Incorporation *
        </label>
        <div className="flex items-center gap-2">
          <select
            value={typedData.stateOfIncorporation || ''}
            onChange={(e) => onChange('stateOfIncorporation', e.target.value)}
            className={`flex-1 px-3 py-2 border rounded-md ${
              errors?.stateOfIncorporation ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select state</option>
            {US_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        {errors?.stateOfIncorporation && (
          <p className="mt-1 text-sm text-red-600">{errors.stateOfIncorporation}</p>
        )}
      </div>

      {/* States of Operation - SECOND */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          States of Operation
        </label>
        <button
          type="button"
          onClick={() => setShowStatesDropdown(!showStatesDropdown)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-left flex justify-between items-center hover:bg-gray-50"
        >
          <span>
            {selectedStatesCount > 0 
              ? `${selectedStatesCount} state${selectedStatesCount > 1 ? 's' : ''} selected`
              : 'Select states'}
          </span>
          {showStatesDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {showStatesDropdown && (
          <div className="mt-1 border rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
            <div className="grid grid-cols-5 gap-1 p-2">
              {US_STATES.map(state => (
                <label
                  key={state}
                  className="flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(typedData.statesOfOperation || []).includes(state)}
                    onChange={() => handleStateToggle(state)}
                    className="mr-1"
                  />
                  <span className="text-sm">{state}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {selectedStatesCount > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {typedData.statesOfOperation?.map((state: string) => (
              <span key={state} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {state}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Organization Legal Name with Universal Name Field */}
      <UniversalNameField
        label="Organization Legal Name"
        value={typedData.orgLegalName || ''}
        onChange={(value, contactCard) => {
          onChange('orgLegalName', value);
          if (contactCard) {
            setSelectedOrgCard(contactCard);
          }
        }}
        type="organization"
        required={true}
        placeholder="Enter legal organization name"
        error={errors?.orgLegalName}
        description="The official legal name as registered with the state"
        fieldName="orgLegalName"
        contactCard={selectedOrgCard}
        onContactCardChange={(card) => setSelectedOrgCard(card)}
        fieldGroups={{
          organizationDetails: {
            ein: {
              value: typedData.ein || '',
              onChange: (value) => onChange('ein', value),
              label: 'EIN',
              type: 'text'
            },
            email: {
              value: typedData.orgEmail || '',
              onChange: (value) => onChange('orgEmail', value),
              label: 'Organization Email',
              type: 'email'
            },
            phone: {
              value: typedData.orgPhone || '',
              onChange: (value) => onChange('orgPhone', value),
              label: 'Organization Phone',
              type: 'tel'
            }
          }
        }}
      />

      {/* Organization Name Supporting Documents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name Supporting Documents
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Upload documents that verify your organization's legal name (e.g., Articles of Incorporation, IRS determination letter)
        </p>
        <DocumentUpload
          fieldId="orgNameDocs"
          sectionId="organizationIdentity"
          acceptedFormats={['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']}
          onUpload={(documentId) => {
            onChange('orgNameDocs', documentId);
          }}
          currentDocId={typedData.orgNameDocs}
          maxSize={10}
          organizationId={typedData.id || 'default'}
        />
      </div>

      {/* Incorporation Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Incorporation Date
        </label>
        <input
          type="date"
          value={typedData.incorporationDate || ''}
          onChange={(e) => onChange('incorporationDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Related Organizations Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Related Organizations
        </h3>

        {/* Parent Organization */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Parent Organization</label>
            {!relatedOrganizations.some(org => org.type === 'parent') && (
              <button
                type="button"
                onClick={() => handleAddOrganization('parent')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Parent
              </button>
            )}
          </div>
          {relatedOrganizations.filter(org => org.type === 'parent').map(org => (
            <div key={org.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">{org.name}</p>
                {org.ein && <p className="text-xs text-gray-500">EIN: {org.ein}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteOrganization(org.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Has Subsidiaries Checkbox */}
        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={typedData.hasSubsidiaries || false}
              onChange={(e) => onChange('hasSubsidiaries', e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Has Subsidiaries</span>
          </label>
        </div>

        {/* Child Organizations */}
        {typedData.hasSubsidiaries && (
          <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Child Organizations (Subsidiaries)</label>
            <button
              type="button"
              onClick={() => handleAddOrganization('child')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Child
            </button>
          </div>
          <div className="space-y-2">
            {relatedOrganizations.filter(org => org.type === 'child').map(org => (
              <div key={org.id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                {editingSubOrg === org.id ? (
                  // Edit Form
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">{org.name}</h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveSubOrg(org.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save changes"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {org.ein && <p className="text-xs text-gray-500 mb-2">EIN: {org.ein}</p>}
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Contact Person
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={subOrgForm.contactPerson || ''}
                            onChange={(e) => setSubOrgForm({...subOrgForm, contactPerson: e.target.value})}
                            placeholder="Enter contact person name"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPersonSelector(org.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Select from contacts"
                          >
                            <Users className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={subOrgForm.email || ''}
                            onChange={(e) => setSubOrgForm({...subOrgForm, email: e.target.value})}
                            placeholder="email@example.com"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={subOrgForm.phone || ''}
                            onChange={(e) => setSubOrgForm({...subOrgForm, phone: e.target.value})}
                            placeholder="(555) 123-4567"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Relationship Description
                        </label>
                        <textarea
                          value={subOrgForm.relationship || ''}
                          onChange={(e) => setSubOrgForm({...subOrgForm, relationship: e.target.value})}
                          placeholder="Describe the relationship with this organization"
                          rows={2}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{org.name}</p>
                      {org.ein && <p className="text-xs text-gray-500">EIN: {org.ein}</p>}
                      {org.contactPerson && (
                        <p className="text-xs text-gray-600 mt-1">Contact: {org.contactPerson}</p>
                      )}
                      {(org.email || org.phone) && (
                        <div className="text-xs text-gray-600 mt-1">
                          {org.email && <span>{org.email}</span>}
                          {org.email && org.phone && <span> • </span>}
                          {org.phone && <span>{org.phone}</span>}
                        </div>
                      )}
                      {org.relationship && (
                        <p className="text-xs text-gray-600 mt-1 italic">{org.relationship}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => handleEditSubOrg(org)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit details"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOrganization(org.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Remove organization"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Sibling Organizations */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Sibling Organizations</label>
            <button
              type="button"
              onClick={() => handleAddOrganization('sibling')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Sibling
            </button>
          </div>
          <div className="space-y-2">
            {relatedOrganizations.filter(org => org.type === 'sibling').map(org => (
              <div key={org.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{org.name}</p>
                  {org.ein && <p className="text-xs text-gray-500">EIN: {org.ein}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteOrganization(org.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Fiscal Sponsor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Fiscal Sponsor</label>
            {!relatedOrganizations.some(org => org.type === 'fiscal_sponsor') && (
              <button
                type="button"
                onClick={() => handleAddOrganization('fiscal_sponsor')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Fiscal Sponsor
              </button>
            )}
          </div>
          {relatedOrganizations.filter(org => org.type === 'fiscal_sponsor').map(org => (
            <div key={org.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">{org.name}</p>
                {org.ein && <p className="text-xs text-gray-500">EIN: {org.ein}</p>}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteOrganization(org.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Organization Selector Modal */}
      {showOrgSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Select {showOrgSelector === 'parent' ? 'Parent' : 
                       showOrgSelector === 'child' ? 'Child' : 
                       showOrgSelector === 'sibling' ? 'Sibling' : 'Fiscal Sponsor'} Organization
            </h3>
            <ContactSelectorSimple
              type="organization"
              onSelect={(contact) => handleSelectOrganization(showOrgSelector, contact)}
              onClose={() => setShowOrgSelector(null)}
            />
          </div>
        </div>
      )}

      {/* Contact Person Selector Modal */}
      {showPersonSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Select Contact Person
            </h3>
            <ContactSelectorSimple
              type="person"
              onSelect={(contact) => {
                const typedContact = contact as any;
                setSubOrgForm({
                  ...subOrgForm,
                  contactPerson: typedContact.displayName || typedContact.name || '',
                  contactPersonId: typedContact.id,
                  email: typedContact.email || subOrgForm.email,
                  phone: typedContact.phone || subOrgForm.phone
                });
                setShowPersonSelector(null);
              }}
              onClose={() => setShowPersonSelector(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationIdentitySectionEnhanced;