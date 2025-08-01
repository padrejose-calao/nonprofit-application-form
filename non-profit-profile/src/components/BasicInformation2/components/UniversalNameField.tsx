import React, { useState, useEffect, useCallback } from 'react';
import { User, Building2, Trash2, Plus, Download } from 'lucide-react';
import ContactSelectorSimple from '../../ContactSelectorSimple';
import { ContactCard, FieldGroup } from '../types';
import { contactCardToVCF, downloadVCF } from '../../../utils/vcfUtils';

export interface NameFieldProps {
  label: string;
  value: string;
  onChange: (value: string, contactCard?: ContactCard) => void;
  type?: 'person' | 'organization' | 'auto';
  required?: boolean;
  placeholder?: string;
  error?: string;
  description?: string;
  fieldGroups?: {
    [groupName: string]: FieldGroup;
  };
  relatedFields?: {
    [fieldName: string]: {
      value: string;
      onChange: (value: string) => void;
    };
  };
  contactCard?: ContactCard | null;
  onContactCardChange?: (card: ContactCard | null) => void;
  fieldName: string;
  className?: string;
}

const UniversalNameField: React.FC<NameFieldProps> = ({
  label,
  value,
  onChange,
  type = 'auto',
  required = false,
  placeholder,
  error,
  description,
  fieldGroups = {},
  relatedFields = {},
  contactCard,
  onContactCardChange,
  fieldName,
  className = ''
}) => {
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedType, setSelectedType] = useState<'person' | 'organization'>(type === 'auto' ? 'person' : type as 'person' | 'organization');
  const [groupOverrides, setGroupOverrides] = useState<Record<string, 'contact' | 'alternate' | 'overwrite'>>({});

  // Auto-populate field groups and related fields from contact card
  const populateFromContactCard = useCallback(() => {
    if (!contactCard) return;

    // Handle fieldGroups
    Object.entries(fieldGroups).forEach(([groupName, fields]) => {
      if (groupOverrides[groupName] !== 'alternate' && groupOverrides[groupName] !== 'overwrite') {
        Object.entries(fields).forEach(([fieldKey, fieldData]) => {
          let contactValue = '';
          
          switch (fieldKey) {
            case 'email':
              contactValue = contactCard.email || '';
              break;
            case 'phone':
              contactValue = contactCard.phone || '';
              break;
            case 'title':
              contactValue = contactCard.title || '';
              break;
            case 'organization':
              contactValue = contactCard.organization || '';
              break;
            case 'taxId':
            case 'ein':
              contactValue = contactCard.taxId || '';
              break;
            case 'address':
              if (contactCard.address) {
                contactValue = `${contactCard.address.street}, ${contactCard.address.city}, ${contactCard.address.state} ${contactCard.address.zipCode}`;
              }
              break;
            default:
              contactValue = '';
          }
          
          if (contactValue && fieldData.value !== contactValue) {
            fieldData.onChange(contactValue);
          }
        });
      }
    });

    // Handle relatedFields (legacy support)
    Object.entries(relatedFields).forEach(([fieldKey, fieldData]) => {
      let contactValue = '';
      
      switch (fieldKey) {
        case 'email':
          contactValue = contactCard.email || '';
          break;
        case 'phone':
          contactValue = contactCard.phone || '';
          break;
        case 'title':
          contactValue = contactCard.title || '';
          break;
        case 'organization':
          contactValue = contactCard.organization || '';
          break;
        case 'taxId':
        case 'ein':
          contactValue = contactCard.taxId || '';
          break;
        default:
          contactValue = '';
      }
      
      if (contactValue && fieldData.value !== contactValue) {
        fieldData.onChange(contactValue);
      }
    });
  }, [contactCard, fieldGroups, relatedFields, groupOverrides]);

  useEffect(() => {
    populateFromContactCard();
  }, [populateFromContactCard]);

  const handleContactSelect = (contact: any) => {
    const contactData = contact as {
      id?: string | number;
      name?: string;
      displayName?: string;
      email?: string;
      phone?: string;
      title?: string;
      organization?: string;
      taxId?: string;
      w9OnFile?: boolean;
      state?: string;
      roles?: string[];
      address?: any;
    };
    const newContactCard: ContactCard = {
      id: contactData.id?.toString() || `contact-${Date.now()}`,
      type: selectedType,
      name: contactData.name || contactData.displayName || '',
      displayName: contactData.displayName || contactData.name || '',
      email: contactData.email || '',
      phone: contactData.phone || '',
      title: contactData.title || '',
      organization: contactData.organization || '',
      taxId: contactData.taxId || '',
      w9OnFile: contactData.w9OnFile || false,
      state: contactData.state || '',
      roles: contactData.roles || [],
      address: contactData.address || undefined,
      documentIds: contact.documentIds || []
    };

    onChange(newContactCard.name, newContactCard);
    onContactCardChange?.(newContactCard);
    setShowContactSelector(false);
    setShowTypeSelector(false);
  };

  const handleGroupOverride = (groupName: string, mode: 'contact' | 'alternate' | 'overwrite') => {
    setGroupOverrides(prev => ({ ...prev, [groupName]: mode }));
  };

  const handleRemoveContact = () => {
    onChange('');
    onContactCardChange?.(null);
    setGroupOverrides({});
  };

  const handleExportVCF = () => {
    if (!contactCard) return;
    const vcfContent = contactCardToVCF(contactCard);
    const filename = `${contactCard.name.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
    downloadVCF(vcfContent, filename);
  };

  const openContactSelector = () => {
    if (type === 'auto') {
      setShowTypeSelector(true);
    } else {
      setShowContactSelector(true);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Description */}
      {description && (
        <p className="text-xs text-gray-600">{description}</p>
      )}

      {/* Name Input with Contact Management */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-3 py-2 border rounded-md ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        
        {/* Contact Management Buttons */}
        <button
          type="button"
          onClick={openContactSelector}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          title="Select from contact manager"
        >
          <Plus className="h-4 w-4" />
        </button>
        
        {contactCard && (
          <>
            <button
              type="button"
              onClick={handleExportVCF}
              className="p-2 text-green-600 hover:bg-green-50 rounded"
              title="Export as VCF"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleRemoveContact}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Remove contact card"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Contact Card Info */}
      {contactCard && (
        <div className="p-3 bg-blue-50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {contactCard.type === 'person' ? (
                <User className="h-4 w-4 text-blue-600" />
              ) : (
                <Building2 className="h-4 w-4 text-green-600" />
              )}
              <span className="font-medium">{contactCard.displayName}</span>
              {contactCard.w9OnFile && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                  W-9 on file
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleExportVCF}
              className="p-1 text-green-600 hover:bg-green-100 rounded text-xs flex items-center gap-1"
              title="Export as VCF"
            >
              <Download className="h-3 w-3" />
              VCF
            </button>
          </div>
          {contactCard.roles && contactCard.roles.length > 0 && (
            <p className="text-sm text-gray-600">
              Roles: {contactCard.roles.join(', ')}
            </p>
          )}
          {contactCard.email && (
            <p className="text-xs text-gray-500">📧 {contactCard.email}</p>
          )}
          {contactCard.phone && (
            <p className="text-xs text-gray-500">📞 {contactCard.phone}</p>
          )}
        </div>
      )}

      {/* Field Groups */}
      {Object.entries(fieldGroups).map(([groupName, fields]) => (
        <div key={groupName} className="border border-gray-200 rounded-md p-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 capitalize">
              {groupName.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </h4>
            
            {contactCard && (
              <div className="flex items-center gap-2">
                <label className="text-xs">
                  <input
                    type="radio"
                    name={`${fieldName}-${groupName}-mode`}
                    checked={!groupOverrides[groupName] || groupOverrides[groupName] === 'contact'}
                    onChange={() => handleGroupOverride(groupName, 'contact')}
                    className="mr-1"
                  />
                  Use Contact
                </label>
                <label className="text-xs">
                  <input
                    type="radio"
                    name={`${fieldName}-${groupName}-mode`}
                    checked={groupOverrides[groupName] === 'alternate'}
                    onChange={() => handleGroupOverride(groupName, 'alternate')}
                    className="mr-1"
                  />
                  Alternate
                </label>
                <label className="text-xs">
                  <input
                    type="radio"
                    name={`${fieldName}-${groupName}-mode`}
                    checked={groupOverrides[groupName] === 'overwrite'}
                    onChange={() => handleGroupOverride(groupName, 'overwrite')}
                    className="mr-1"
                  />
                  Overwrite
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(fields).map(([fieldKey, fieldData]) => (
              <div key={fieldKey}>
                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">
                  {fieldData.label || fieldKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <input
                  type={fieldData.type || 'text'}
                  value={fieldData.value}
                  onChange={(e) => fieldData.onChange(e.target.value)}
                  className={`w-full px-2 py-1 text-sm border rounded-md ${
                    contactCard && (!groupOverrides[groupName] || groupOverrides[groupName] === 'contact') 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'border-gray-300'
                  }`}
                  disabled={!!contactCard && (!groupOverrides[groupName] || groupOverrides[groupName] === 'contact')}
                  placeholder={`Enter ${fieldData.label || fieldKey}`}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Type Selector Modal */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Select Contact Type
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedType('person');
                  setShowTypeSelector(false);
                  setShowContactSelector(true);
                }}
                className="w-full p-3 border rounded-md hover:bg-gray-50 flex items-center gap-3"
              >
                <User className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Person</p>
                  <p className="text-sm text-gray-600">Individual contact</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setSelectedType('organization');
                  setShowTypeSelector(false);
                  setShowContactSelector(true);
                }}
                className="w-full p-3 border rounded-md hover:bg-gray-50 flex items-center gap-3"
              >
                <Building2 className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Organization</p>
                  <p className="text-sm text-gray-600">Company or entity</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowTypeSelector(false)}
              className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contact Selector Modal */}
      {showContactSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <ContactSelectorSimple
              type={selectedType}
              onSelect={handleContactSelect}
              onClose={() => setShowContactSelector(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversalNameField;