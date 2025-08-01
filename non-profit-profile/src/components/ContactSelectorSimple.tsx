import React, { useState, useRef, useEffect } from 'react';
import { User, Building2, X, Plus, Edit2, Trash2, Search, Upload, Cloud } from 'lucide-react';
import { vcfToContactCard } from '../utils/vcfUtils';
import { useGoogleContacts } from '../utils/googleContactsApi';
import { PersonContact, OrganizationContact } from '../services/contactService';
import { netlifyContactService } from '../services/netlifyContactService';
import { toast } from 'react-hot-toast';
import { useOrganization } from '../contexts/OrganizationContext';
import { logger } from '../utils/logger';

export interface ContactSelectorProps {
  type: 'person' | 'organization';
  onSelect: (contact: PersonContact | OrganizationContact) => void;
  onClose: () => void;
}

const ContactSelectorSimple: React.FC<ContactSelectorProps> = ({ type, onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<PersonContact | OrganizationContact | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [_googleResults, setGoogleResults] = useState<any[]>([]);
  const [isGoogleSearching, setIsGoogleSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const googleContacts = useGoogleContacts();
  const [contacts, setContacts] = useState<(PersonContact | OrganizationContact)[]>([]);
  const { organizationId } = useOrganization();
  
  // Form state
  const [formData, setFormData] = useState({
    // Person fields
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    mobile: '',
    whatsApp: '',
    organization: '',
    w9OnFile: false,
    // Organization fields
    name: '',
    taxId: '',
    website: '',
    state: '',
    // Address fields
    address: '',
    address2: '',
    city: '',
    addressState: '',
    zipCode: '',
    country: 'United States'
  });
  
  // Load contacts from service on mount
  useEffect(() => {
    // Load contacts
    const loadContacts = async () => {
      const loadedContacts = await netlifyContactService.getContacts();
      setContacts(loadedContacts);
    };
    loadContacts();
  }, [organizationId]);
  
  // Initialize form when editing
  useEffect(() => {
    if (editingContact) {
      if ('taxId' in editingContact) {
        // Organization
        setFormData({
          ...formData,
          name: editingContact.name,
          taxId: editingContact.taxId,
          email: editingContact.email,
          phone: editingContact.phone,
          website: editingContact.website || '',
          state: editingContact.state || '',
          address: editingContact.addresses?.[0]?.address || '',
          address2: editingContact.addresses?.[0]?.address2 || '',
          city: editingContact.addresses?.[0]?.city || '',
          addressState: editingContact.addresses?.[0]?.state || '',
          zipCode: editingContact.addresses?.[0]?.zipCode || '',
          country: editingContact.addresses?.[0]?.country || 'United States'
        });
      } else {
        // Person
        setFormData({
          ...formData,
          firstName: editingContact.firstName,
          lastName: editingContact.lastName,
          title: editingContact.title || '',
          email: editingContact.email,
          phone: editingContact.phone,
          mobile: editingContact.mobile || '',
          whatsApp: editingContact.whatsApp || '',
          organization: editingContact.organization || '',
          w9OnFile: editingContact.w9OnFile || false
        });
      }
    }
  }, [editingContact]);
  
  const filteredContacts = type === 'person' 
    ? contacts.filter((contact): contact is PersonContact => 
        !('taxId' in contact) && (
          contact.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : contacts.filter((contact): contact is OrganizationContact => 
        'taxId' in contact && (
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.taxId.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );

  const handleVCFImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const content = await file.text();
      const contactCard = vcfToContactCard(content);
      
      if (contactCard) {
        // Convert ContactCard to PersonContact or OrganizationContact format
        if (type === 'person' && contactCard.type === 'person') {
          const nameParts = contactCard.name.split(' ');
          const newPersonContact: PersonContact = {
            id: contactCard.id,
            displayName: contactCard.displayName,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: contactCard.email || '',
            phone: contactCard.phone || '',
            title: contactCard.title || '',
            organization: contactCard.organization || '',
            w9OnFile: contactCard.w9OnFile || false,
            type: 'person',
            roles: contactCard.roles || []
          };
          netlifyContactService.saveContact(newPersonContact).then(savedContact => {
            onSelect(savedContact as PersonContact);
          });
        } else if (type === 'organization' && contactCard.type === 'organization') {
          const newOrgContact: OrganizationContact = {
            id: contactCard.id,
            name: contactCard.organization || contactCard.name,
            displayName: contactCard.displayName,
            taxId: contactCard.taxId || '',
            email: contactCard.email || '',
            phone: contactCard.phone || '',
            website: '',
            roles: contactCard.roles || []
          };
          netlifyContactService.saveContact(newOrgContact).then(savedContact => {
            onSelect(savedContact as OrganizationContact);
          });
        } else {
          toast.error(`Cannot import ${contactCard.type} as ${type}`);
        }
      }
    } catch (error) {
      logger.error('Import error:', error);
      toast.error('Failed to import contact');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = () => {
    try {
      if (type === 'person') {
        // Create person contact
        const personContact: PersonContact = {
          id: editingContact?.id || Date.now().toString(),
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          mobile: formData.mobile,
          whatsApp: formData.whatsApp || formData.mobile,
          title: formData.title,
          organization: formData.organization,
          w9OnFile: formData.w9OnFile,
          type: 'person',
          roles: (editingContact as PersonContact)?.roles || []
        };
        
        netlifyContactService.saveContact(personContact).then(savedContact => {
          onSelect(savedContact as PersonContact);
        });
      } else {
        // Create organization contact
        const orgContact: OrganizationContact = {
          id: editingContact?.id || Date.now().toString(),
          name: formData.name,
          displayName: formData.name,
          taxId: formData.taxId,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          state: formData.state,
          roles: (editingContact as OrganizationContact)?.roles || [],
          addresses: formData.address ? [{
            type: 'Main',
            address: formData.address,
            address2: formData.address2,
            city: formData.city,
            state: formData.addressState,
            zipCode: formData.zipCode,
            country: formData.country
          }] : []
        };
        
        netlifyContactService.saveContact(orgContact).then(savedContact => {
          onSelect(savedContact as OrganizationContact);
        });
      }
      
      // Reset form
      setShowAddForm(false);
      setEditingContact(null);
      setFormData({
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        mobile: '',
        whatsApp: '',
        organization: '',
        w9OnFile: false,
        name: '',
        taxId: '',
        website: '',
        state: '',
        address: '',
        address2: '',
        city: '',
        addressState: '',
        zipCode: '',
        country: 'United States'
      });
    } catch (error) {
      logger.error('Save error:', error);
      toast.error('Failed to save contact');
    }
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await netlifyContactService.deleteContact(contactId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {showAddForm ? `Add New ${type === 'person' ? 'Person' : 'Organization'}` :
           editingContact ? `Edit ${type === 'person' ? 'Person' : 'Organization'}` :
           `Select ${type === 'person' ? 'Person' : 'Organization'}`}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {!showAddForm && !editingContact && (
        <>
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${type === 'person' ? 'people' : 'organizations'}...`}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex items-center justify-center gap-1 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add New
            </button>
            <label className="px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex items-center justify-center gap-1 cursor-pointer text-sm">
              <Upload className="h-4 w-4" />
              Import VCF
              <input
                ref={fileInputRef}
                type="file"
                accept=".vcf,.vcard"
                onChange={handleVCFImport}
                className="hidden"
                disabled={isImporting}
              />
            </label>
            <button
              onClick={async () => {
                setIsGoogleSearching(true);
                try {
                  const results = await googleContacts.searchContacts(searchTerm || 'all', 10);
                  setGoogleResults(results);
                } catch (error) {
                  logger.error('Google search failed:', error);
                } finally {
                  setIsGoogleSearching(false);
                }
              }}
              disabled={isGoogleSearching}
              className="px-3 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex items-center justify-center gap-1 text-sm disabled:opacity-50"
            >
              <Cloud className="h-4 w-4" />
              {isGoogleSearching ? 'Searching...' : 'Google'}
            </button>
          </div>

          {/* Contacts List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <button
                  onClick={() => onSelect(contact)}
                  className="flex items-start gap-3 flex-1 text-left"
                >
                  <div className={`p-2 rounded-full ${type === 'person' ? 'bg-blue-100' : 'bg-green-100'}`}>
                    {type === 'person' ? (
                      <User className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Building2 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {type === 'person' 
                        ? (contact as PersonContact).displayName 
                        : (contact as OrganizationContact).name}
                    </p>
                    {type === 'person' ? (
                      <>
                        {(contact as PersonContact).title && (
                          <p className="text-sm text-gray-600">{(contact as PersonContact).title}</p>
                        )}
                        {(contact as PersonContact).organization && (
                          <p className="text-sm text-gray-500">{(contact as PersonContact).organization}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">EIN: {(contact as OrganizationContact).taxId}</p>
                      </>
                    )}
                    <p className="text-sm text-gray-500">{contact.email}</p>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingContact(contact);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(contact.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No {type === 'person' ? 'people' : 'organizations'} found</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                Add a new {type === 'person' ? 'person' : 'organization'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingContact) && (
        <div className="space-y-4">
          {type === 'person' ? (
            // Person Form
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <input
                type="text"
                placeholder="Title/Position"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="tel"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <input
                type="tel"
                placeholder="WhatsApp (if different from mobile)"
                value={formData.whatsApp}
                onChange={(e) => setFormData({...formData, whatsApp: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Organization"
                value={formData.organization}
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.w9OnFile}
                  onChange={(e) => setFormData({...formData, w9OnFile: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">W-9 on file</span>
              </label>
            </div>
          ) : (
            // Organization Form
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Organization Name *"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="EIN (XX-XXXXXXX) *"
                value={formData.taxId}
                onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="url"
                placeholder="Website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select State</option>
                {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
                  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
                  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
                  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
                  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              
              {/* Address Section */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Main Address</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={formData.address2}
                    onChange={(e) => setFormData({...formData, address2: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.addressState}
                      onChange={(e) => setFormData({...formData, addressState: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="ZIP"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingContact(null);
                setFormData({
                  firstName: '',
                  lastName: '',
                  title: '',
                  email: '',
                  phone: '',
                  mobile: '',
                  whatsApp: '',
                  organization: '',
                  w9OnFile: false,
                  name: '',
                  taxId: '',
                  website: '',
                  state: '',
                  address: '',
                  address2: '',
                  city: '',
                  addressState: '',
                  zipCode: '',
                  country: 'United States'
                });
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={type === 'person' ? !formData.firstName || !formData.lastName || !formData.email : !formData.name || !formData.taxId || !formData.email}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingContact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSelectorSimple;