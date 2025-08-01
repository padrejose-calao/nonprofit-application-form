import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Building2,
  User,
  Users,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  Save,
  Edit2,
  Trash2,
  Search,
  Grid,
  List,
  TrendingUp,
  Clipboard,
  Mail,
  Printer,
  MessageSquare,
  Copy,
  QrCode,
  Share,
  Calendar,
  Globe,
  MapPin,
  Star,
  Filter,
  UserPlus,
  Settings,
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';

interface Contact {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  website: string;
  projectRoles: string[];
  tags: string[];
  notes: string;
  createdDate: string;
  lastModified: string;
  dataCompleteness: number;
  address: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  addressHistory: Array<{
    address: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    startDate: string;
    endDate?: string;
  }>;
  isOrganization?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  lastContact?: string;
  nextFollowUp?: string;
  groups?: string[];
  demographics?: {
    gender?: string;
    ethnicity?: string;
    ageRange?: string;
    language?: string;
  };
  boardInfo?: {
    role?: string;
    committees?: string[];
    termStart?: string;
    termEnd?: string;
    attendance?: number;
  };
  staffInfo?: {
    department?: string;
    hireDate?: string;
    employmentType?: 'full-time' | 'part-time' | 'contractor' | 'volunteer';
    reportsTo?: string;
  };
  donorInfo?: {
    firstDonation?: string;
    lastDonation?: string;
    totalDonations?: number;
    donationHistory?: Array<{
      date: string;
      amount: number;
      campaign?: string;
      notes?: string;
    }>;
  };
}

interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'board' | 'committee' | 'staff' | 'volunteer' | 'donor' | 'custom';
  members: number[];
  settings?: {
    trackAttendance?: boolean;
    requireDemographics?: boolean;
    customFields?: string[];
  };
}

interface ContactManagerProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
  onClose?: () => void;
  initialView?: 'contacts' | 'groups';
  initialEntityType?: 'person' | 'business';
  editingContactId?: number | null;
}

const ContactManager: React.FC<ContactManagerProps> = ({
  contacts,
  onContactsChange,
  onClose = () => {},
  initialView = 'contacts',
  initialEntityType = 'person',
  editingContactId = null,
}) => {
  const [mainView, setMainView] = useState<'contacts' | 'groups'>(initialView);
  const [view, setView] = useState<'form' | 'list' | 'grid'>('form');
  const [groups, setGroups] = useState<Group[]>([
    { id: 'board', name: 'Board Members', type: 'board', members: [], settings: { trackAttendance: true, requireDemographics: true } },
    { id: 'staff', name: 'Staff', type: 'staff', members: [], settings: { requireDemographics: true } },
    { id: 'volunteers', name: 'Volunteers', type: 'volunteer', members: [] },
    { id: 'donors', name: 'Donors', type: 'donor', members: [] },
  ]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isBusinessMode, setIsBusinessMode] = useState(initialEntityType === 'business');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(true);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(0);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'organization' | 'date' | 'completeness'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contactData, setContactData] = useState<Contact>({
    id: Date.now(),
    prefix: '',
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    projectRoles: [],
    tags: [],
    notes: '',
    createdDate: new Date().toISOString().split('T')[0],
    lastModified: new Date().toISOString().split('T')[0],
    dataCompleteness: 0,
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    addressHistory: [],
    isOrganization: false,
    priority: 'medium',
    lastContact: undefined,
    nextFollowUp: undefined,
    groups: [],
    demographics: {},
    boardInfo: {},
    staffInfo: {},
    donorInfo: {},
  });

  const [quickAddData, setQuickAddData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    title: '',
  });

  const [newTag, setNewTag] = useState('');
  const [sections, setSections] = useState({
    contact: true,
    address: true,
    projectRoles: true,
    additional: true,
  });

  const availableRoles = [
    'Project Manager',
    'Developer',
    'Designer',
    'QA Engineer',
    'Business Analyst',
    'Stakeholder',
    'Client',
    'Vendor',
    'Consultant',
    'Team Lead',
    'Board Member',
    'Board Chair',
    'Board Co-Chair',
    'Board Secretary',
    'Board Treasurer',
    'Committee Chair',
    'Committee Member',
    'Volunteer',
    'Volunteer Coordinator',
    'Donor',
    'Major Donor',
    'Partner',
    'Staff Member',
    'Executive Director',
    'Program Manager',
    'Advisor',
    'Contractor',
  ];

  // Calculate data completeness
  useEffect(() => {
    const requiredFields = ['firstName', 'lastName'];
    const optionalFields = ['email', 'phone', 'organization'];

    const requiredFilled = requiredFields.filter(
      (field) => contactData[field as keyof Contact]
    ).length;
    const optionalFilled = optionalFields.filter(
      (field) => contactData[field as keyof Contact]
    ).length;
    const hasRole = contactData.projectRoles && contactData.projectRoles.length > 0;

    const requiredPercentage = (requiredFilled / requiredFields.length) * 50;
    const rolePercentage = hasRole ? 10 : 0;
    const optionalPercentage = (optionalFilled / optionalFields.length) * 40;

    const completeness = Math.round(requiredPercentage + rolePercentage + optionalPercentage);
    setContactData((prev) => ({ ...prev, dataCompleteness: completeness }));
  }, [
    contactData.firstName,
    contactData.lastName,
    contactData.email,
    contactData.phone,
    contactData.organization,
    contactData.projectRoles,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setShowQuickAddModal(true);
            break;
          case 's':
            e.preventDefault();
            if (view === 'form') saveContact();
            break;
          case 'f':
            e.preventDefault();
            if (view === 'list' || view === 'grid') {
              const searchInput = document.querySelector(
                'input[placeholder="Search contacts..."]'
              ) as HTMLInputElement;
              searchInput?.focus();
            }
            break;
          case '1':
            e.preventDefault();
            setView('form');
            break;
          case '2':
            e.preventDefault();
            setView('list');
            break;
          case '3':
            e.preventDefault();
            setView('grid');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: value,
      lastModified: new Date().toISOString().split('T')[0],
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !(contactData.tags || []).includes(newTag.trim())) {
      setContactData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setContactData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addRole = (role: string) => {
    if (!(contactData.projectRoles || []).includes(role)) {
      setContactData((prev) => ({
        ...prev,
        projectRoles: [...(prev.projectRoles || []), role],
      }));
    }
    setShowRoleDropdown(false);
  };

  const removeRole = (roleToRemove: string) => {
    setContactData((prev) => ({
      ...prev,
      projectRoles: prev.projectRoles.filter((role) => role !== roleToRemove),
    }));
  };

  const generateVCF = () => {
    const fullName = isBusinessMode
      ? contactData.organization
      : `${contactData.prefix ? contactData.prefix + ' ' : ''}${contactData.firstName} ${contactData.lastName}`;

    const vcfData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      !isBusinessMode && `N:${contactData.lastName};${contactData.firstName};;;`,
      contactData.organization && `ORG:${contactData.organization}`,
      contactData.title && `TITLE:${contactData.title}`,
      contactData.email && `EMAIL:${contactData.email}`,
      contactData.phone && `TEL;TYPE=WORK:${contactData.phone}`,
      contactData.mobile && `TEL;TYPE=CELL:${contactData.mobile}`,
      contactData.website && `URL:${contactData.website}`,
      contactData.notes && `NOTE:${contactData.notes}`,
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    return vcfData;
  };

  const downloadVCF = () => {
    const vcfContent = generateVCF();
    const blob = new Blob([vcfContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    let filename = isBusinessMode ? contactData.organization : contactData.firstName;
    if (!isBusinessMode && contactData.lastName) filename += `_${contactData.lastName}`;

    a.download = `${filename}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importVCF = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const vcfContacts = parseVCF(content);

      if (vcfContacts.length > 0) {
        const newContacts = vcfContacts.map(
          (contact, index) =>
            ({
              ...contact,
              id: Date.now() + index,
              prefix: contact.prefix || '',
              firstName: contact.firstName || '',
              lastName: contact.lastName || '',
              organization: contact.organization || '',
              title: contact.title || '',
              email: contact.email || '',
              phone: contact.phone || '',
              mobile: contact.mobile || '',
              website: contact.website || '',
              notes: contact.notes || '',
              tags: contact.tags || [],
              projectRoles: contact.projectRoles || [],
              createdDate: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              dataCompleteness: calculateCompleteness(contact),
              address: contact.address || '',
              address2: contact.address2 || '',
              city: contact.city || '',
              state: contact.state || '',
              zipCode: contact.zipCode || '',
              country: contact.country || 'USA',
              addressHistory: contact.addressHistory || [],
              isOrganization: contact.isOrganization || false,
            }) as Contact
        );

        onContactsChange([...contacts, ...newContacts]);
        toast.success(`${vcfContacts.length} contacts imported from VCF`);
      } else {
        toast.error('No valid contacts found in VCF file');
      }
    };
    reader.readAsText(file);
  };

  const parseVCF = (content: string): Partial<Contact>[] => {
    const contacts: Partial<Contact>[] = [];
    const vcfBlocks = content.split('BEGIN:VCARD').filter((block) => block.trim());

    vcfBlocks.forEach((block) => {
      const contact: Partial<Contact> = {
        firstName: '',
        lastName: '',
        organization: '',
        title: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        notes: '',
        tags: [],
        projectRoles: [],
        address: '',
        address2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        addressHistory: [],
        isOrganization: false,
      };

      // Parse VCF fields
      const lines = block.split('\n');
      lines.forEach((line) => {
        if (line.startsWith('FN:')) {
          const fullName = line.substring(3).trim();
          const nameParts = fullName.split(' ');
          contact.firstName = nameParts[0] || '';
          contact.lastName = nameParts.slice(1).join(' ') || '';
        } else if (line.startsWith('ORG:')) {
          contact.organization = line.substring(4).trim();
        } else if (line.startsWith('TITLE:')) {
          contact.title = line.substring(6).trim();
        } else if (line.startsWith('EMAIL:')) {
          contact.email = line.substring(6).trim();
        } else if (line.startsWith('TEL:')) {
          if (!contact.phone) {
            contact.phone = line.substring(4).trim();
          } else {
            contact.mobile = line.substring(4).trim();
          }
        } else if (line.startsWith('URL:')) {
          contact.website = line.substring(4).trim();
        } else if (line.startsWith('NOTE:')) {
          contact.notes = line.substring(5).trim();
        }
      });

      if (contact.firstName || contact.organization) {
        contacts.push(contact);
      }
    });

    return contacts;
  };

  const calculateCompleteness = (contact: Partial<Contact>): number => {
    const requiredFields = ['firstName', 'lastName'];
    const optionalFields = ['email', 'phone', 'organization'];

    const requiredFilled = requiredFields.filter((field) => contact[field as keyof Contact]).length;
    const optionalFilled = optionalFields.filter((field) => contact[field as keyof Contact]).length;
    const hasRole = contact.projectRoles && contact.projectRoles.length > 0;

    const requiredPercentage = (requiredFilled / requiredFields.length) * 50;
    const rolePercentage = hasRole ? 10 : 0;
    const optionalPercentage = (optionalFilled / optionalFields.length) * 40;

    return Math.round(requiredPercentage + rolePercentage + optionalPercentage);
  };

  const generateCSV = (contactList: Contact[]) => {
    const headers = [
      'Name',
      'Organization',
      'Title',
      'Email',
      'Phone',
      'Mobile',
      'Website',
      'Roles',
      'Tags',
      'Notes',
      'Created',
      'Modified',
      'Completeness',
    ];
    const rows = contactList.map((contact) => [
      `${contact.firstName} ${contact.lastName}`.trim(),
      contact.organization || '',
      contact.title || '',
      contact.email || '',
      contact.phone || '',
      contact.mobile || '',
      contact.website || '',
      contact.projectRoles.join('; ') || '',
      contact.tags.join('; ') || '',
      contact.notes || '',
      contact.createdDate || '',
      contact.lastModified || '',
      `${contact.dataCompleteness}%`,
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveContact = () => {
    if (isBusinessMode) {
      if (!contactData.organization || contactData.projectRoles.length === 0) {
        toast.error('Business name and at least one role are required');
        return;
      }
    } else {
      if (
        !contactData.firstName ||
        !contactData.lastName ||
        contactData.projectRoles.length === 0
      ) {
        toast.error('First name, last name, and at least one role are required');
        return;
      }
    }

    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 3000);

    const existingIndex = contacts.findIndex((c) => c.id === contactData.id);
    if (existingIndex >= 0) {
      const updatedContacts = [...contacts];
      updatedContacts[existingIndex] = contactData;
      onContactsChange(updatedContacts);
    } else {
      onContactsChange([...contacts, contactData]);
    }

    toast.success('Contact saved successfully!');
  };

  const deleteContact = () => {
    if (showDeleteConfirm === 0) {
      setShowDeleteConfirm(1);
    } else if (showDeleteConfirm === 1) {
      setShowDeleteConfirm(2);
    } else {
      const updatedContacts = contacts.filter((c) => c.id !== contactData.id);
      onContactsChange(updatedContacts);
      toast.success('Contact deleted successfully!');
      setShowDeleteConfirm(0);
    }
  };

  const handleQuickAdd = () => {
    const newContact: Contact = {
      id: Date.now(),
      prefix: '',
      firstName: quickAddData.firstName,
      lastName: quickAddData.lastName,
      organization: quickAddData.organization,
      title: quickAddData.title,
      email: quickAddData.email,
      phone: quickAddData.phone,
      mobile: '',
      website: '',
      projectRoles: [],
      tags: [],
      notes: '',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      dataCompleteness: 0,
      address: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      addressHistory: [],
      isOrganization: quickAddData.organization ? true : false,
      priority: 'medium',
      lastContact: undefined,
      nextFollowUp: undefined,
    };

    onContactsChange([...contacts, newContact]);
    setQuickAddData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      organization: '',
      title: '',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowQuickAddModal(false);
    toast.success('Contact added successfully!');
  };

  const filterContacts = () => {
    let filtered = [...contacts];

    if (searchQuery) {
      filtered = filtered.filter((c) =>
        Object.values(c).some(
          (v) => v && typeof v !== 'object' && (String(v) || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Sort contacts
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase();
          bValue = `${b.firstName || ''} ${b.lastName || ''}`.toLowerCase();
          break;
        case 'organization':
          aValue = (a.organization || '').toLowerCase();
          bValue = (b.organization || '').toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.lastModified);
          bValue = new Date(b.lastModified);
          break;
        case 'completeness':
          aValue = a.dataCompleteness;
          bValue = b.dataCompleteness;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const renderContactList = () => {
    const filtered = filterContacts();

    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search contacts... (Ctrl+F)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="organization">Organization</option>
                <option value="date">Date Modified</option>
                <option value="completeness">Completeness</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {/* Contact Count and Select All */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {filtered.length} of {contacts.length} contacts
              </div>
              {filtered.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filtered.length && filtered.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedContacts(filtered.map((c) => c.id));
                      } else {
                        setSelectedContacts([]);
                      }
                    }}
                    className="mr-1"
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              )}
              {/* VCF Import Button */}
              <input
                type="file"
                accept=".vcf,.vcard"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    importVCF(file);
                    e.target.value = '';
                  }
                }}
                className="hidden"
                ref={fileInputRef}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"
              >
                <Upload size={14} />
                Import VCF
              </button>
            </div>

            {/* Bulk Actions */}
            {selectedContacts.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedContacts.length} selected</span>
                <button
                  onClick={() => {
                    const updatedContacts = contacts.filter(
                      (c) => !selectedContacts.includes(c.id)
                    );
                    onContactsChange(updatedContacts);
                    setSelectedContacts([]);
                    toast.success(`${selectedContacts.length} contacts deleted`);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    const selectedContactData = contacts.filter((c) =>
                      selectedContacts.includes(c.id)
                    );
                    const csvContent = generateCSV(selectedContactData);
                    downloadCSV(csvContent, 'selected_contacts.csv');
                    toast.success('Selected contacts exported to CSV');
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    const selectedContactData = contacts.filter((c) =>
                      selectedContacts.includes(c.id)
                    );
                    const vcfContent = selectedContactData
                      .map((contact) => {
                        const fullName = contact.organization
                          ? contact.organization
                          : `${contact.prefix ? contact.prefix + ' ' : ''}${contact.firstName} ${contact.lastName}`;

                        return [
                          'BEGIN:VCARD',
                          'VERSION:3.0',
                          `FN:${fullName}`,
                          !contact.organization && `N:${contact.lastName};${contact.firstName};;;`,
                          contact.organization && `ORG:${contact.organization}`,
                          contact.title && `TITLE:${contact.title}`,
                          contact.email && `EMAIL:${contact.email}`,
                          contact.phone && `TEL;TYPE=WORK:${contact.phone}`,
                          contact.mobile && `TEL;TYPE=CELL:${contact.mobile}`,
                          contact.website && `URL:${contact.website}`,
                          contact.notes && `NOTE:${contact.notes}`,
                          'END:VCARD',
                        ]
                          .filter(Boolean)
                          .join('\r\n');
                      })
                      .join('\n\n');

                    const blob = new Blob([vcfContent], { type: 'text/vcard' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `contacts_${selectedContactData.length}.vcf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Selected contacts exported to VCF');
                  }}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Export VCF
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          className={
            view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'
          }
        >
          {filtered.map((contact) => (
            <div
              key={contact.id}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
                view === 'grid' ? 'p-4' : 'p-3 flex items-center gap-4'
              } ${selectedContacts.includes(contact.id) ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Selection Checkbox */}
              <input
                type="checkbox"
                checked={selectedContacts.includes(contact.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.checked) {
                    setSelectedContacts([...selectedContacts, contact.id]);
                  } else {
                    setSelectedContacts(selectedContacts.filter((id) => id !== contact.id));
                  }
                }}
                className="mr-2"
              />

              <div
                className={`flex-1 cursor-pointer ${view === 'grid' ? '' : 'flex items-center gap-4'}`}
                onClick={() => {
                  setContactData(contact);
                  setView('form');
                }}
              >
                {view === 'grid' ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User size={24} className="text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {contact.firstName || contact.organization} {contact.lastName || ''}
                        </h3>
                        <p className="text-sm text-gray-600">{contact.organization}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">{contact.email}</p>
                      <p className="text-gray-600">{contact.phone}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.projectRoles?.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                      {contact.dataCompleteness}% complete
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {contact.firstName
                          ? `${contact.firstName} ${contact.lastName}`.trim()
                          : contact.organization}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {contact.organization} • {contact.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {contact.dataCompleteness}% complete
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white p-6 rounded-lg shadow-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">Contact & Group Manager</h1>
                        <p className="text-blue-100">Centralized management for all people, businesses, and groups</p>
                      </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors">
                      <X size={28} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Main Navigation */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setMainView('contacts')}
                        className={`px-4 py-2 rounded flex items-center gap-2 ${mainView === 'contacts' ? 'bg-white shadow' : ''}`}
                      >
                        <User size={16} />
                        Contacts
                      </button>
                      <button
                        onClick={() => setMainView('groups')}
                        className={`px-4 py-2 rounded flex items-center gap-2 ${mainView === 'groups' ? 'bg-white shadow' : ''}`}
                      >
                        <Users size={16} />
                        Groups
                      </button>
                    </div>
                    
                    {mainView === 'contacts' && (
                      <>
                        <div className="text-sm text-gray-500">
                          <span className="hidden md:inline">Keyboard shortcuts: </span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">Ctrl+N</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs ml-1">Ctrl+S</span>
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs ml-1">Ctrl+F</span>
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setView('form')}
                            className={`px-3 py-1 rounded ${view === 'form' ? 'bg-white shadow' : ''}`}
                          >
                            Form
                          </button>
                          <button
                            onClick={() => setView('list')}
                            className={`px-3 py-1 rounded flex items-center gap-1 ${view === 'list' ? 'bg-white shadow' : ''}`}
                          >
                            <List size={16} />
                            List
                          </button>
                          <button
                            onClick={() => setView('grid')}
                            className={`px-3 py-1 rounded flex items-center gap-1 ${view === 'grid' ? 'bg-white shadow' : ''}`}
                          >
                            <Grid size={16} />
                            Grid
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area - Consistent Height */}
              <div className="flex-1 overflow-auto">
                {mainView === 'groups' ? (
                  <div className="space-y-4">
                    {/* Groups Header */}
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Manage Groups</h2>
                        <button
                          onClick={() => {
                            setEditingGroup(null);
                            setShowGroupModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Create Group
                        </button>
                      </div>
                    </div>

                    {/* Groups Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groups.map((group) => {
                        const groupContacts = contacts.filter(c => c.groups?.includes(group.id));
                        return (
                          <div key={group.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold text-lg">{group.name}</h3>
                                <p className="text-sm text-gray-600 capitalize">{group.type} Group</p>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingGroup(group);
                                  setShowGroupModal(true);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <Settings size={16} />
                              </button>
                            </div>
                            
                            <div className="mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users size={16} />
                                <span>{groupContacts.length} members</span>
                              </div>
                              {group.description && (
                                <p className="text-sm text-gray-600 mt-2">{group.description}</p>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedGroup(group.id);
                                  setMainView('contacts');
                                  setSearchQuery(`group:${group.name}`);
                                }}
                                className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                              >
                                View Members
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedGroup(group.id);
                                  setShowQuickAddModal(true);
                                }}
                                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                              >
                                <UserPlus size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    {view === 'list' || view === 'grid' ? renderContactList() : null}

                    {view === 'form' && (
                  <>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                      <button
                        onClick={() => setIsBusinessMode(false)}
                        disabled={!editMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          !isBusinessMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        } ${!editMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <User size={18} />
                        Person
                      </button>
                      <button
                        onClick={() => setIsBusinessMode(true)}
                        disabled={!editMode}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isBusinessMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        } ${!editMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Building2 size={18} />
                        Business
                      </button>
                    </div>
                  </>
                )}

                {/* Contact Form */}
                {view === 'form' && (
                  <div className="space-y-6 bg-white rounded-lg shadow-lg p-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h2 className="text-lg font-semibold mb-4 text-gray-700">
                        Basic Information
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (* required fields)
                        </span>
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {!isBusinessMode && (
                          <>
                            <input
                              type="text"
                              name="prefix"
                              placeholder="Prefix (Mr., Ms., Dr., etc.)"
                              value={contactData.prefix}
                              onChange={handleInputChange}
                              disabled={!editMode}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              name="firstName"
                              placeholder="First Name *"
                              value={contactData.firstName}
                              onChange={handleInputChange}
                              disabled={!editMode}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              name="lastName"
                              placeholder="Last Name *"
                              value={contactData.lastName}
                              onChange={handleInputChange}
                              disabled={!editMode}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </>
                        )}
                        <input
                          type="text"
                          name="organization"
                          placeholder={isBusinessMode ? 'Business Name *' : 'Organization'}
                          value={contactData.organization}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            isBusinessMode ? 'md:col-span-2 lg:col-span-3' : ''
                          }`}
                        />
                        {!isBusinessMode && (
                          <input
                            type="text"
                            name="title"
                            placeholder="Job Title"
                            value={contactData.title}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-700">Contact Information</h2>
                        <button
                          onClick={() => toggleSection('contact')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {sections.contact ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                      {sections.contact && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={contactData.email}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={contactData.phone}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="tel"
                            name="mobile"
                            placeholder="Mobile"
                            value={contactData.mobile}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="url"
                            name="website"
                            placeholder="Website"
                            value={contactData.website}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Address Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                          <MapPin size={20} />
                          Address Information
                        </h2>
                        <button
                          onClick={() => toggleSection('address')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {sections.address ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </div>
                      {sections.address && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="address"
                            placeholder="Street Address"
                            value={contactData.address}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="address2"
                            placeholder="Apt, Suite, Unit"
                            value={contactData.address2}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={contactData.city}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="state"
                            placeholder="State/Province"
                            value={contactData.state}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="zipCode"
                            placeholder="ZIP/Postal Code"
                            value={contactData.zipCode}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={contactData.country}
                            onChange={handleInputChange}
                            disabled={!editMode}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-green-800">
                          Project Roles <span className="text-red-500">*</span>
                        </h2>
                        <button
                          onClick={() => toggleSection('projectRoles')}
                          className="text-green-600 hover:text-green-800"
                        >
                          {sections.projectRoles ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                      {sections.projectRoles && (
                        <>
                          <div className="relative">
                            <button
                              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                              disabled={!editMode}
                              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                              <Plus size={18} />
                              Add Role (Required)
                              <ChevronDown size={18} />
                            </button>
                            {showRoleDropdown && editMode && (
                              <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-64">
                                {availableRoles.map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => addRole(role)}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {contactData.projectRoles.map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                              >
                                {role}
                                {editMode && (
                                  <button
                                    onClick={() => removeRole(role)}
                                    className="hover:text-blue-900"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                          {contactData.projectRoles.length === 0 && (
                            <p className="text-sm text-red-500 mt-2">
                              At least one role is required
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-purple-800">
                          Additional Information
                        </h2>
                        <button
                          onClick={() => toggleSection('additional')}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          {sections.additional ? (
                            <ChevronUp size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>
                      </div>
                      {sections.additional && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tags
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add tag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                disabled={!editMode}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={addTag}
                                disabled={!editMode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                              >
                                Add
                              </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {contactData.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full"
                                >
                                  {tag}
                                  {editMode && (
                                    <button
                                      onClick={() => removeTag(tag)}
                                      className="hover:text-green-900"
                                    >
                                      <X size={16} />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Group Assignment */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Groups
                            </label>
                            <div className="space-y-2">
                              {groups.map((group) => (
                                <label key={group.id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={contactData.groups?.includes(group.id) || false}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setContactData(prev => ({
                                          ...prev,
                                          groups: [...(prev.groups || []), group.id],
                                          lastModified: new Date().toISOString().split('T')[0]
                                        }));
                                      } else {
                                        setContactData(prev => ({
                                          ...prev,
                                          groups: (prev.groups || []).filter(g => g !== group.id),
                                          lastModified: new Date().toISOString().split('T')[0]
                                        }));
                                      }
                                    }}
                                    disabled={!editMode}
                                    className="rounded"
                                  />
                                  <span className="text-sm">{group.name}</span>
                                  <span className="text-xs text-gray-500">({group.type})</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Priority and Follow-up */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority Level
                              </label>
                              <select
                                name="priority"
                                value={contactData.priority || 'medium'}
                                onChange={(e) => setContactData(prev => ({ ...prev, priority: e.target.value as Contact['priority'], lastModified: new Date().toISOString().split('T')[0] }))}
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="low">🟢 Low Priority</option>
                                <option value="medium">🟡 Medium Priority</option>
                                <option value="high">🟠 High Priority</option>
                                <option value="urgent">🔴 Urgent</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last Contact
                              </label>
                              <input
                                type="date"
                                name="lastContact"
                                value={contactData.lastContact || ''}
                                onChange={handleInputChange}
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Next Follow-up
                              </label>
                              <input
                                type="date"
                                name="nextFollowUp"
                                value={contactData.nextFollowUp || ''}
                                onChange={handleInputChange}
                                disabled={!editMode}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Notes
                            </label>
                            <RichTextEditor
                              value={contactData.notes}
                              onChange={(content) => setContactData(prev => ({ ...prev, notes: content, lastModified: new Date().toISOString().split('T')[0] }))}
                              placeholder="Add detailed notes about this contact..."
                              disabled={!editMode}
                              height={200}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Created:</span>{' '}
                              {contactData.createdDate}
                            </div>
                            <div>
                              <span className="font-medium">Last Modified:</span>{' '}
                              {contactData.lastModified}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-16 bg-white shadow-lg flex flex-col items-center py-6 space-y-4">
            {/* Quick Add */}
            <div className="relative group">
              <button
                onClick={() => setShowQuickAddModal(true)}
                className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} />
              </button>
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                Quick Add Contact
              </div>
            </div>

            {view === 'form' && (
              <>
                {/* Data Completeness */}
                <div className="relative group">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="relative">
                      <TrendingUp size={20} className="text-gray-600" />
                      <span className="absolute -top-1 -right-1 text-xs font-bold text-gray-700">
                        {contactData.dataCompleteness}%
                      </span>
                    </div>
                  </div>
                  <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {contactData.dataCompleteness}% Complete
                  </div>
                </div>

                {/* Download VCF */}
                <div className="relative group">
                  <button
                    onClick={downloadVCF}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={20} />
                  </button>
                  <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Download VCF
                  </div>
                </div>

                {/* Save */}
                <div className="relative group">
                  <button
                    onClick={saveContact}
                    className={`p-3 rounded-lg transition-colors ${
                      saved ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {saved ? <Check size={20} /> : <Save size={20} />}
                  </button>
                  <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Save Contact
                  </div>
                </div>

                {/* Edit Mode */}
                <div className="relative group">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`p-3 rounded-lg transition-colors ${
                      editMode
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    <Edit2 size={20} />
                  </button>
                  <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {editMode ? 'Disable Editing' : 'Enable Editing'}
                  </div>
                </div>

                {/* Delete */}
                <div className="relative group">
                  <button
                    onClick={deleteContact}
                    className={`p-3 rounded-lg transition-colors ${
                      showDeleteConfirm > 0
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-gray-600 text-white hover:bg-red-600'
                    }`}
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {showDeleteConfirm === 0
                      ? 'Delete Contact'
                      : showDeleteConfirm === 1
                        ? 'Click Again to Confirm'
                        : 'Final Confirmation'}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </h2>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Group Name"
                value={editingGroup?.name || ''}
                onChange={(e) => {
                  if (editingGroup) {
                    setEditingGroup({ ...editingGroup, name: e.target.value });
                  } else {
                    const newGroup: Group = {
                      id: `group_${Date.now()}`,
                      name: e.target.value,
                      type: 'custom',
                      members: []
                    };
                    setEditingGroup(newGroup);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={editingGroup?.type || 'custom'}
                onChange={(e) => {
                  if (editingGroup) {
                    setEditingGroup({ ...editingGroup, type: e.target.value as Group['type'] });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="board">Board</option>
                <option value="committee">Committee</option>
                <option value="staff">Staff</option>
                <option value="volunteer">Volunteer</option>
                <option value="donor">Donor</option>
                <option value="custom">Custom</option>
              </select>

              <textarea
                placeholder="Description (optional)"
                value={editingGroup?.description || ''}
                onChange={(e) => {
                  if (editingGroup) {
                    setEditingGroup({ ...editingGroup, description: e.target.value });
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (editingGroup && editingGroup.name) {
                      const existingIndex = groups.findIndex(g => g.id === editingGroup.id);
                      if (existingIndex >= 0) {
                        const updatedGroups = [...groups];
                        updatedGroups[existingIndex] = editingGroup;
                        setGroups(updatedGroups);
                      } else {
                        setGroups([...groups, editingGroup]);
                      }
                      setShowGroupModal(false);
                      toast.success(`Group ${editingGroup.name} ${existingIndex >= 0 ? 'updated' : 'created'} successfully!`);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingGroup && groups.find(g => g.id === editingGroup.id) ? 'Update' : 'Create'} Group
                </button>
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quick Add Contact</h2>
              <button
                onClick={() => setShowQuickAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={quickAddData.firstName}
                  onChange={(e) =>
                    setQuickAddData((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={quickAddData.lastName}
                  onChange={(e) =>
                    setQuickAddData((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={quickAddData.email}
                onChange={(e) => setQuickAddData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="tel"
                placeholder="Phone"
                value={quickAddData.phone}
                onChange={(e) => setQuickAddData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Organization"
                value={quickAddData.organization}
                onChange={(e) =>
                  setQuickAddData((prev) => ({ ...prev, organization: e.target.value }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={handleQuickAdd}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;
