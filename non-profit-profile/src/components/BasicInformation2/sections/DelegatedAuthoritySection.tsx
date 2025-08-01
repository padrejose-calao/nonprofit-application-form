import React, { useState } from 'react';
import { SectionProps } from '../types';
import { Shield, User, Building2, Trash2, UserCheck, PenTool, FileSignature, ClipboardCheck } from 'lucide-react';
import ContactSelectorSimple from '../../ContactSelectorSimple';

interface DelegatedContact {
  id: string;
  name: string;
  type: 'person' | 'organization';
  email?: string;
  phone?: string;
  contactCardId?: string;
}

interface DelegatedAuthority {
  spokespersons: DelegatedContact[];
  authorizedSigners: DelegatedContact[];
  authorizedApplicants: DelegatedContact[];
  boardMembers: DelegatedContact[];
}

const AUTHORITY_TYPES = [
  {
    key: 'spokespersons',
    label: 'Spokespersons',
    icon: UserCheck,
    description: 'Authorized to speak on behalf of the organization'
  },
  {
    key: 'authorizedSigners',
    label: 'Authorized Signers',
    icon: PenTool,
    description: 'Authorized to sign contracts and legal documents'
  },
  {
    key: 'authorizedApplicants',
    label: 'Authorized Applicants',
    icon: FileSignature,
    description: 'Authorized to submit grant applications'
  },
  {
    key: 'boardMembers',
    label: 'Board Members',
    icon: ClipboardCheck,
    description: 'Members of the board of directors'
  }
];

const DelegatedAuthoritySection: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  const [showSelector, setShowSelector] = useState<{ type: string; contactType: 'person' | 'organization' } | null>(null);
  
  const typedData = (data || {}) as { delegatedAuthority?: DelegatedAuthority };
  const authority: DelegatedAuthority = typedData.delegatedAuthority || {
    spokespersons: [],
    authorizedSigners: [],
    authorizedApplicants: [],
    boardMembers: []
  };

  const handleAddContact = (authorityType: string, contact: unknown, contactType: 'person' | 'organization') => {
    const contactData = contact as {
      id?: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      phone?: string;
      mobile?: string;
    };
    
    const newContact: DelegatedContact = {
      id: Date.now().toString(),
      name: contactType === 'person' 
        ? (contactData.displayName || `${contactData.firstName || ''} ${contactData.lastName || ''}`.trim())
        : (contactData.name || contactData.displayName || ''),
      type: contactType,
      email: contactData.email,
      phone: contactData.phone || contactData.mobile,
      contactCardId: contactData.id
    };

    const updatedAuthority = {
      ...authority,
      [authorityType]: [...authority[authorityType as keyof DelegatedAuthority], newContact]
    };

    onChange('delegatedAuthority', updatedAuthority);
    setShowSelector(null);
  };

  const handleRemoveContact = (authorityType: string, contactId: string) => {
    const updatedAuthority = {
      ...authority,
      [authorityType]: authority[authorityType as keyof DelegatedAuthority].filter(
        contact => contact.id !== contactId
      )
    };

    onChange('delegatedAuthority', updatedAuthority);
  };

  const renderAuthorityColumn = (type: typeof AUTHORITY_TYPES[0]) => {
    const Icon = type.icon;
    const contacts = authority[type.key as keyof DelegatedAuthority];

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-gray-700">{type.label}</h3>
          </div>
          <p className="text-xs text-gray-500">{type.description}</p>
        </div>

        <div className="space-y-2 mb-4">
          {contacts.map((contact) => (
            <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {contact.type === 'person' ? (
                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  {contact.email && (
                    <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveContact(type.key, contact.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowSelector({ type: type.key, contactType: 'person' })}
            className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm flex items-center justify-center gap-1"
          >
            <User className="h-4 w-4" />
            Add Person
          </button>
          <button
            type="button"
            onClick={() => setShowSelector({ type: type.key, contactType: 'organization' })}
            className="w-full px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm flex items-center justify-center gap-1"
          >
            <Building2 className="h-4 w-4" />
            Add Organization
          </button>
        </div>

        {showSelector?.type === type.key && (
          <div className="mt-3 p-3 border rounded bg-gray-50">
            <ContactSelectorSimple
              type={showSelector.contactType}
              onSelect={(contact) => handleAddContact(type.key, contact, showSelector.contactType)}
              onClose={() => setShowSelector(null)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800">
            Assign delegated authority to individuals or organizations. These assignments will be tracked and can be referenced throughout the application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {AUTHORITY_TYPES.map((type) => renderAuthorityColumn(type))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Authority Guidelines</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• <strong>Spokespersons:</strong> Can make public statements and represent the organization in media</li>
          <li>• <strong>Authorized Signers:</strong> Can execute contracts, MOUs, and other binding agreements</li>
          <li>• <strong>Authorized Applicants:</strong> Can submit grant applications and funding requests</li>
          <li>• <strong>Board Members:</strong> Have governance and fiduciary responsibilities</li>
        </ul>
      </div>
    </div>
  );
};

export default DelegatedAuthoritySection;