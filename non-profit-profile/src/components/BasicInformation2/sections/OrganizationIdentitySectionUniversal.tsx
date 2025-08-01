import React, { useState } from 'react';
import { Plus, Trash2, Users, Upload, FileText } from 'lucide-react';
import { SectionProps, ContactCard } from '../types';
import UniversalNameField from '../components/UniversalNameField';
import { logger } from '../../../utils/logger';

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
  contactCard?: ContactCard | null;
  contactPerson?: string;
  contactPersonCard?: ContactCard | null;
  email?: string;
  phone?: string;
  relationship?: string;
}

const OrganizationIdentitySectionUniversal: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  const typedData = data as any;
  const [relatedOrganizations, setRelatedOrganizations] = useState<RelatedOrganization[]>([]);
  const [uploadedOrgDocs, setUploadedOrgDocs] = useState<Array<{
    id: string;
    name: string;
    uploadDate: Date;
    url?: string;
  }>>([]);
  const [_editingOrgId, setEditingOrgId] = useState<string | null>(null);

  const handleOrgCardChange = (card: ContactCard | null) => {
    if (card) {
      // Auto-populate organization fields from contact card
      onChange('orgLegalName', card.name);
      if (card.taxId) {
        onChange('ein', card.taxId);
      }
      // If organization has state info, update state of incorporation
      if (card.email) {
        onChange('orgEmail', card.email);
      }
    }
  };

  const handleAddRelatedOrg = (type: RelatedOrganization['type']) => {
    const newOrg: RelatedOrganization = {
      id: Date.now().toString(),
      name: '',
      type,
    };
    setRelatedOrganizations([...relatedOrganizations, newOrg]);
    setEditingOrgId(newOrg.id);
  };

  const handleUpdateRelatedOrg = (orgId: string, updates: Partial<RelatedOrganization>) => {
    const updatedOrgs = relatedOrganizations.map(org =>
      org.id === orgId ? { ...org, ...updates } : org
    );
    setRelatedOrganizations(updatedOrgs);

    // Update form data based on organization type
    const org = updatedOrgs.find(o => o.id === orgId);
    if (org) {
      if (org.type === 'parent') {
        onChange('parentOrgDetails', {
          parentName: org.name,
          parentTaxId: org.ein
        });
        onChange('hasParentOrg', true);
      } else if (org.type === 'child') {
        const subsidiaries = updatedOrgs.filter(o => o.type === 'child').map(o => ({
          name: o.name,
          ein: o.ein,
          contactPerson: o.contactPerson,
          email: o.email,
          phone: o.phone,
          relationship: o.relationship
        }));
        onChange('subsidiaries', subsidiaries);
        onChange('hasSubsidiaries', subsidiaries.length > 0);
      }
    }
  };

  const handleDeleteRelatedOrg = (orgId: string) => {
    const org = relatedOrganizations.find(o => o.id === orgId);
    const updatedOrgs = relatedOrganizations.filter(o => o.id !== orgId);
    setRelatedOrganizations(updatedOrgs);

    if (org?.type === 'parent') {
      onChange('parentOrgDetails', null);
      onChange('hasParentOrg', false);
    } else if (org?.type === 'child') {
      const subsidiaries = updatedOrgs.filter(o => o.type === 'child').map(o => ({
        name: o.name,
        ein: o.ein,
        contactPerson: o.contactPerson,
        email: o.email,
        phone: o.phone,
        relationship: o.relationship
      }));
      onChange('subsidiaries', subsidiaries);
      onChange('hasSubsidiaries', subsidiaries.length > 0);
    }
  };

  const handleOrgDocUpload = async (file: File) => {
    try {
      const api = (await import('../../../services/api/basicInformationApi')).BasicInformationApi;
      const result = await api.uploadDocument(file, 'organizationIdentity', 'orgNameDocs');
      
      if (result.success && result.data) {
        const newDoc = {
          id: result.data.id,
          name: file.name,
          uploadDate: new Date(),
          url: result.data.url
        };
        setUploadedOrgDocs([...uploadedOrgDocs, newDoc]);
        
        const currentDocs = typedData.orgNameDocs || [];
        onChange('orgNameDocs', [...currentDocs, result.data.url]);
      }
    } catch (error) {
      logger.error('Upload error:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* State of Incorporation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          State of Incorporation *
        </label>
        <select
          value={typedData.stateOfIncorporation || ''}
          onChange={(e) => onChange('stateOfIncorporation', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md ${
            errors?.stateOfIncorporation ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select state</option>
          {US_STATES.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errors?.stateOfIncorporation && (
          <p className="mt-1 text-sm text-red-600">{errors.stateOfIncorporation}</p>
        )}
      </div>

      {/* Organization Legal Name with Universal Name Field */}
      <UniversalNameField
        label="Organization Legal Name"
        value={typedData.orgLegalName || ''}
        onChange={(value, contactCard) => {
          onChange('orgLegalName', value);
          if (contactCard) {
            handleOrgCardChange(contactCard);
          }
        }}
        type="organization"
        required={true}
        placeholder="Enter legal organization name"
        error={errors?.orgLegalName}
        description="The official legal name as registered with the state"
        fieldName="orgLegalName"
        relatedFields={{
          ein: {
            value: typedData.ein || '',
            onChange: (value) => onChange('ein', value)
          },
          email: {
            value: typedData.orgEmail || '',
            onChange: (value) => onChange('orgEmail', value)
          },
          phone: {
            value: typedData.orgPhone || '',
            onChange: (value) => onChange('orgPhone', value)
          }
        }}
      />

      {/* Organization Name Supporting Documents */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Name Supporting Documents
        </label>
        <div className="border border-gray-300 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">
              Upload documents that verify your organization's legal name
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleOrgDocUpload(file);
                }}
                className="hidden"
              />
              <div className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1">
                <Upload className="h-4 w-4" />
                Upload Document
              </div>
            </label>
          </div>

          {uploadedOrgDocs.length > 0 ? (
            <div className="space-y-2">
              {uploadedOrgDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {doc.uploadDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedOrgDocs(uploadedOrgDocs.filter(d => d.id !== doc.id));
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No documents uploaded yet
            </p>
          )}
        </div>
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
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Related Organizations
        </h3>

        {/* Parent Organization */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Parent Organization</h4>
            {!relatedOrganizations.some(org => org.type === 'parent') && (
              <button
                type="button"
                onClick={() => handleAddRelatedOrg('parent')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Parent
              </button>
            )}
          </div>

          {relatedOrganizations.filter(org => org.type === 'parent').map(org => (
            <div key={org.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <UniversalNameField
                label="Parent Organization Name"
                value={org.name}
                onChange={(value, contactCard) => {
                  handleUpdateRelatedOrg(org.id, { 
                    name: value, 
                    contactCard,
                    ein: contactCard?.taxId 
                  });
                }}
                type="organization"
                required={true}
                placeholder="Enter parent organization name"
                fieldName="parentOrgName"
                contactCard={org.contactCard}
                onContactCardChange={(card) => handleUpdateRelatedOrg(org.id, { contactCard: card })}
                relatedFields={{
                  ein: {
                    value: org.ein || '',
                    onChange: (value) => handleUpdateRelatedOrg(org.id, { ein: value })
                  }
                }}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDeleteRelatedOrg(org.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove parent organization"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Child Organizations */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Child Organizations</h4>
            <button
              type="button"
              onClick={() => handleAddRelatedOrg('child')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Child
            </button>
          </div>

          <div className="space-y-3">
            {relatedOrganizations.filter(org => org.type === 'child').map(org => (
              <div key={org.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <UniversalNameField
                    label="Child Organization Name"
                    value={org.name}
                    onChange={(value, contactCard) => {
                      handleUpdateRelatedOrg(org.id, { 
                        name: value, 
                        contactCard,
                        ein: contactCard?.taxId 
                      });
                    }}
                    type="organization"
                    required={true}
                    placeholder="Enter child organization name"
                    fieldName="childOrgName"
                    contactCard={org.contactCard}
                    onContactCardChange={(card) => handleUpdateRelatedOrg(org.id, { contactCard: card })}
                    relatedFields={{
                      ein: {
                        value: org.ein || '',
                        onChange: (value) => handleUpdateRelatedOrg(org.id, { ein: value })
                      }
                    }}
                  />

                  <UniversalNameField
                    label="Contact Person"
                    value={org.contactPerson || ''}
                    onChange={(value, contactCard) => {
                      handleUpdateRelatedOrg(org.id, { 
                        contactPerson: value, 
                        contactPersonCard: contactCard,
                        email: contactCard?.email || org.email,
                        phone: contactCard?.phone || org.phone
                      });
                    }}
                    type="person"
                    placeholder="Contact person for this organization"
                    fieldName="childOrgContactPerson"
                    contactCard={org.contactPersonCard}
                    onContactCardChange={(card) => handleUpdateRelatedOrg(org.id, { contactPersonCard: card })}
                    relatedFields={{
                      email: {
                        value: org.email || '',
                        onChange: (value) => handleUpdateRelatedOrg(org.id, { email: value })
                      },
                      phone: {
                        value: org.phone || '',
                        onChange: (value) => handleUpdateRelatedOrg(org.id, { phone: value })
                      },
                      title: {
                        value: org.contactPersonCard?.title || '',
                        onChange: () => {} // Read-only from contact card
                      }
                    }}
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship Description
                  </label>
                  <textarea
                    value={org.relationship || ''}
                    onChange={(e) => handleUpdateRelatedOrg(org.id, { relationship: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Describe the relationship with this organization"
                  />
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteRelatedOrg(org.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Remove child organization"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sibling Organizations */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Sibling Organizations</h4>
            <button
              type="button"
              onClick={() => handleAddRelatedOrg('sibling')}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Sibling
            </button>
          </div>

          <div className="space-y-3">
            {relatedOrganizations.filter(org => org.type === 'sibling').map(org => (
              <div key={org.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <UniversalNameField
                  label="Sibling Organization Name"
                  value={org.name}
                  onChange={(value, contactCard) => {
                    handleUpdateRelatedOrg(org.id, { 
                      name: value, 
                      contactCard,
                      ein: contactCard?.taxId 
                    });
                  }}
                  type="organization"
                  required={true}
                  placeholder="Enter sibling organization name"
                  fieldName="siblingOrgName"
                  contactCard={org.contactCard}
                  onContactCardChange={(card) => handleUpdateRelatedOrg(org.id, { contactCard: card })}
                  relatedFields={{
                    ein: {
                      value: org.ein || '',
                      onChange: (value) => handleUpdateRelatedOrg(org.id, { ein: value })
                    }
                  }}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteRelatedOrg(org.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Remove sibling organization"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fiscal Sponsor */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Fiscal Sponsor</h4>
            {!relatedOrganizations.some(org => org.type === 'fiscal_sponsor') && (
              <button
                type="button"
                onClick={() => handleAddRelatedOrg('fiscal_sponsor')}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Fiscal Sponsor
              </button>
            )}
          </div>

          {relatedOrganizations.filter(org => org.type === 'fiscal_sponsor').map(org => (
            <div key={org.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <UniversalNameField
                label="Fiscal Sponsor Organization"
                value={org.name}
                onChange={(value, contactCard) => {
                  handleUpdateRelatedOrg(org.id, { 
                    name: value, 
                    contactCard,
                    ein: contactCard?.taxId 
                  });
                }}
                type="organization"
                required={true}
                placeholder="Enter fiscal sponsor organization name"
                fieldName="fiscalSponsorName"
                contactCard={org.contactCard}
                onContactCardChange={(card) => handleUpdateRelatedOrg(org.id, { contactCard: card })}
                relatedFields={{
                  ein: {
                    value: org.ein || '',
                    onChange: (value) => handleUpdateRelatedOrg(org.id, { ein: value })
                  },
                  email: {
                    value: org.email || '',
                    onChange: (value) => handleUpdateRelatedOrg(org.id, { email: value })
                  },
                  phone: {
                    value: org.phone || '',
                    onChange: (value) => handleUpdateRelatedOrg(org.id, { phone: value })
                  }
                }}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDeleteRelatedOrg(org.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove fiscal sponsor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationIdentitySectionUniversal;