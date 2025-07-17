# Complete Basic Information Form - Development Specification

## System Overview
This specification defines a multi-section form system for collecting organizational basic information. The form features dynamic field visibility, integrated contact management, automatic document linking, and comprehensive data relationships.

## Core Architecture Principles

1. **Contact Card Integration**: Organization and person data are stored in a central Contact Manager. Form fields reference these cards rather than storing duplicate data.
2. **Document Management**: All uploads go to a central Document Manager. Upload fields are merely references to documents, not storage locations.
3. **Field Linking**: When the same data appears in multiple locations (e.g., EIN in Tax section and Organization section), it's the same field instance displayed in multiple places.
4. **Progressive Disclosure**: Fields appear/hide based on user selections to reduce complexity.

## Technical Requirements

### Frontend Framework
- React or Vue.js for dynamic component management
- State management (Redux/Vuex) for form data
- Real-time validation
- Auto-save functionality

### Page Structure
```
┌─────────────────────────────────────────────┐
│ Header: Form Title & Progress Indicator      │
├─────────────────────────────────────────────┤
│ Main Content Area:                          │
│ - Section Header (colored background)        │
│ - Form Fields                               │
│ - Subsections                               │
│                                             │
│ Bottom of EVERY Page:                       │
│ [+ Add Custom Section] [+ Add Subsection]   │
│ [□ Hide empty fields for export]           │
└─────────────────────────────────────────────┘

Sidebar:
┌──────────────┐
│ Navigation   │
│ □ Section 1  │
│ □ Section 2  │
│ ...          │
│              │
│ Entity Docs  │
│ ▼ Tax Docs   │
│   • Doc 1    │
│   • Doc 2    │
│ ▼ Org Docs   │
│   • Doc 3    │
└──────────────┘
```

## Color Coding
- Section 1 (Tax Identification): bg-green-50
- Section 2 (Organization Identity): bg-blue-50
- Section 3 (Physical Address): bg-purple-50
- Section 4 (Business Hours & Communication): bg-gray-50
- Section 5 (Key Personnel): bg-orange-50

## Detailed Section Specifications

### Section 1: Tax Identification (bg-green-50)

```javascript
// Field Structure
{
  ein: {
    type: 'text',
    validation: /^\d{2}-\d{7}$/,
    required: true,
    placeholder: 'XX-XXXXXXX',
    hideIfChecked: 'no_ein_checkbox'
  },
  no_ein_checkbox: {
    type: 'checkbox',
    label: 'No EIN/Tax ID',
    triggersShow: 'alternate_tax_section'
  },
  additional_tax_info_button: {
    type: 'button',
    label: 'Additional Tax Information',
    action: 'openModal',
    modalId: 'tax_info_modal'
  }
}

// Progressive Disclosure Logic
IF no_ein_checkbox = true THEN
  SHOW alternate_tax_section
  IF no_alternate_tax = true THEN
    SHOW system_generated_section
  END IF
END IF
```

#### Step 1: Primary Tax ID
- **Field: ein** - Text input with format validation (XX-XXXXXXX)
- **Field: no_ein_checkbox** - Checkbox that triggers Step 2
- **Field: additional_tax_info_button** - Opens modal with extended tax fields

#### Step 2: Alternate Tax Identification (Conditional)
Visible only when no_ein_checkbox = true

- **Field: foreign_entity_checkbox** - When checked, shows:
  - foreign_country - Dropdown of countries
  - foreign_tax_id - Text input

- **Field: unincorporated_checkbox** - Simple checkbox
- **Field: pending_irs_checkbox** - When checked, shows:
  - application_date - Date picker
  - tracking_number - Text input

- **Field: none_of_above_checkbox** - Triggers Step 3

#### Step 3: System Generated ID (Conditional)
Visible only when none_of_above_checkbox = true

- Display: "System will assign temporary ID: ORG-[TIMESTAMP]"
- **Field: no_tax_id_reason** - Text area (required)
- **Field: supporting_docs_upload** - File upload

#### Additional Tax Information Modal
```javascript
{
  // State Tax Information
  state_tax_id: { type: 'text' },
  state_of_registration: { type: 'dropdown', options: 'US_STATES' },
  state_charity_number: { type: 'text' },
  
  // Tax Status
  tax_exempt_status: { 
    type: 'dropdown', 
    options: ['Active', 'Pending', 'Revoked', 'Not Applicable'] 
  },
  exemption_date: { type: 'date' },
  classification: { 
    type: 'dropdown', 
    options: ['Public Charity', 'Private Foundation', 'Other'] 
  },
  
  // International
  itin: { type: 'text' },
  vat_gst_numbers: { type: 'dynamic_list' },
  tax_treaty: { type: 'checkbox' },
  
  // Special Circumstances
  disregarded_entity: { type: 'checkbox' },
  church_automatic: { type: 'checkbox' },
  government_entity: { type: 'checkbox' },
  tribal_government: { type: 'checkbox' },
  
  // History
  previous_ein: { type: 'text' },
  revoked_status: { type: 'checkbox' },
  reinstated_date: { type: 'date', showIf: 'revoked_status' }
}
```

### Section 2: Organization Identity (bg-blue-50)

```javascript
// Creates or links to Organizational Contact Card
{
  org_legal_name: {
    type: 'contact_selector',
    contactType: 'organization',
    icons: ['search_existing', 'add_new', 'modify_existing'],
    required: true,
    createsContactCard: true
  }
}
```

#### Organization Legal Name
- Component: Contact Selector with three icon buttons:
  - 🔍 Search Existing (opens contact search modal)
  - 📝 Add New (creates new org contact card)
  - ✏️ Modify Existing (edits selected contact card)
- Action: Selection/creation establishes the organizational contact card that serves as the primary data source

#### Language & Accessibility
```javascript
{
  operating_languages: {
    type: 'checkbox_group',
    options: ['English', 'Spanish', 'Haitian Creole', 'Portuguese', 'Other'],
    other_field: true
  },
  preferred_language: {
    type: 'dropdown',
    options_from: 'operating_languages',
    required: true
  },
  accessibility_services: {
    type: 'checkbox_group',
    options: [
      'American Sign Language (ASL)',
      'Other sign language',
      'Language Line interpretation',
      'Written translation services',
      'Other accommodations'
    ],
    other_fields: ['other_sign_language', 'other_accommodations']
  }
}
```

#### State Information & Formation Documents
```javascript
{
  state_of_incorporation: {
    type: 'dropdown',
    options: 'US_STATES',
    required: true
  },
  incorporation_date: { type: 'date' },
  articles_upload: {
    type: 'file_upload',
    docType: 'articles_of_incorporation',
    allowedFormats: ['pdf', 'doc', 'docx']
  },
  bylaws_upload: {
    type: 'file_upload',
    docType: 'current_bylaws',
    allowedFormats: ['pdf', 'doc', 'docx']
  },
  amendments: {
    type: 'dynamic_list',
    fields: ['document_type', 'amendment_date', 'file_upload']
  }
}
```

#### States of Operation with Foreign Entity Registration
```javascript
{
  states_of_operation: {
    type: 'multi_select',
    options: 'US_STATES'
  },
  foreign_entity_registered: {
    type: 'checkbox',
    help_text: 'A foreign entity is any corporation, LLC, or organization incorporated outside of this state but conducting business within it',
    showsFieldsFor: 'each_selected_state'
  },
  // For each selected state where foreign_entity_registered = true:
  foreign_registrations: {
    type: 'dynamic_group_per_state',
    fields: {
      registration_number: { type: 'text' },
      registration_date: { type: 'date' },
      registered_agent_name: { type: 'text' },
      registered_agent_address: { type: 'address' },
      certificate_upload: { type: 'file_upload' },
      annual_report_upload: { type: 'file_upload' }
    }
  }
}
```

#### Organization Names
```javascript
{
  registered_fictitious_names: {
    type: 'dynamic_list',
    addButtonText: '+ Add Registered Name',
    fields: {
      name: { 
        type: 'contact_selector',
        icons: ['search', 'add', 'edit'] 
      },
      state: { type: 'dropdown', options: 'US_STATES' },
      certificate_number: { type: 'text' },
      filing_date: { type: 'date' },
      expiration_date: { type: 'date' },
      status: { 
        type: 'dropdown', 
        options: ['Active', 'Expired', 'Pending'] 
      },
      certificate_upload: { type: 'file_upload' }
    }
  },
  also_known_as: {
    type: 'dynamic_list',
    addButtonText: '+ Add AKA',
    fields: {
      name: { type: 'text' },
      usage_context: { type: 'text', required: false }
    }
  }
}
```

#### Organizational Relationships
```javascript
{
  has_parent_org: {
    type: 'checkbox',
    triggersSection: 'parent_org_details'
  },
  parent_org_details: {
    showIf: 'has_parent_org',
    fields: {
      parent_name: { 
        type: 'contact_selector',
        contactType: 'organization',
        required: true
      },
      parent_tax_id: { type: 'text', required: true },
      relationship_type: {
        type: 'dropdown',
        options: ['Wholly-owned subsidiary', 'Chapter', 'Affiliate', 'Other']
      },
      relationship_description: { type: 'textarea', required: true },
      documentation_upload: { type: 'file_upload', required: true }
    }
  },
  // Similar structure for subsidiaries and fiscal sponsorship
}
```

### Section 3: Physical Address (bg-purple-50)

```javascript
{
  primary_address: {
    type: 'address_display',
    source: 'org_contact_card',
    editable: false,
    shows: ['street', 'street2', 'city', 'state', 'zip', 'county']
  },
  ada_compliant: { type: 'checkbox' },
  address_actions: {
    type: 'button_group',
    buttons: [
      {
        label: 'Override - Add as Alternate',
        action: 'add_alternate_to_contact'
      },
      {
        label: 'Override - Replace Contact Card',
        action: 'replace_contact_address',
        confirmation: true,
        archive_option: true
      }
    ]
  }
}
```

### Section 4: Business Hours & Communication

#### Hours Table Structure
```javascript
{
  hours_table: {
    type: 'complex_table',
    columns: [
      'Day',
      'Closed AM',
      'Open AM',
      'Close AM',
      'Closed PM',
      'Open PM',
      'Close PM',
      'Chat Platform',
      'Notes'
    ],
    rows: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    quickActions: ['Copy Monday to Weekdays', 'Set Weekend Hours', 'Clear All']
  }
}
```

#### Directory Listings (Auto-syncs with Social Media sidebar)
```javascript
{
  directory_listings: {
    type: 'checkbox_list',
    autoSync: 'social_media_sidebar',
    options: [
      { name: 'Google Business Profile', manageLink: '/manage/google' },
      { name: 'Apple Maps', manageLink: '/manage/apple' },
      { name: 'Yelp', manageLink: '/manage/yelp' },
      // ... etc
    ]
  }
}
```

### Section 5: Key Personnel

```javascript
{
  leadership_contacts: {
    type: 'dynamic_personnel_list',
    predefinedRoles: ['Executive Director/CEO', 'Board Chair', 'Finance Director/CFO'],
    allowCustomRoles: true,
    fields: {
      person: { 
        type: 'contact_selector',
        contactType: 'person',
        icons: ['search', 'add', 'edit']
      },
      designation_upload: { type: 'file_upload' },
      authorization_scope: {
        type: 'checkbox_group',
        options: [
          'Sign contracts',
          'Apply for grants',
          'Financial transactions up to $[amount_field]',
          'Hire/terminate staff',
          'Represent organization publicly',
          'Other: [text_field]'
        ]
      },
      authorization_document: { type: 'file_upload' },
      authorization_period: {
        from_date: { type: 'date' },
        to_date: { type: 'date' }
      }
    }
  }
}
```

## Entity Documents Sidebar

```javascript
// Automatically populated from all upload fields in the form
{
  entity_documents: {
    type: 'auto_aggregated_list',
    source: 'all_form_upload_fields',
    groupBy: 'section',
    structure: {
      'Tax Identification': [
        'supporting_docs_upload',
        'additional_tax_documents',
        // ... all uploads from tax section
      ],
      'Organization Identity': [
        'articles_upload',
        'bylaws_upload',
        // ... all uploads from org section
      ],
      // ... etc for each section
    },
    clickAction: 'open_in_document_manager'
  }
}
```

## Custom Fields System

### Bottom of Every Page Controls
```javascript
{
  custom_field_controls: {
    position: 'page_bottom',
    buttons: [
      {
        label: '+ Add Custom Section',
        action: 'add_user_section',
        allowedFieldTypes: ['text', 'textarea', 'date', 'dropdown', 'checkbox', 'file_upload']
      },
      {
        label: '+ Add Subsection',
        action: 'add_user_subsection',
        requiresParentSection: true
      }
    ],
    restrictions: {
      cannotEdit: 'system_fields',
      cannotDelete: 'system_fields',
      userFieldsOnly: true
    }
  },
  export_options: {
    type: 'checkbox',
    label: 'Hide empty fields for export',
    affects: ['print', 'pdf_export']
  }
}
```

## PDF Export System

### Future Development Note
TODO: Create open-source PDF software with all available free PDF options:
- PDF creation/generation
- Form filling
- Digital signatures
- Compression
- Merging/splitting
- Watermarking
- Encryption
- OCR capabilities
- Annotation tools

### Current Export Settings
```javascript
{
  pdf_export: {
    hideEmptyFields: 'user_option',
    includeOptions: {
      system_fields: 'always',
      user_fields: 'always',
      empty_fields: 'optional',
      document_links: 'as_appendix'
    },
    formatting: {
      maintain_colors: true,
      page_breaks: 'by_section',
      table_of_contents: true
    }
  }
}
```

## Data Flow Specifications

### Contact Card Integration
1. When a contact selector is used:
   - Search returns existing contact cards
   - Add new creates a new card in Contact Manager
   - Form stores only the contact ID reference
   - Display data is pulled from Contact Manager in real-time

### Document Management Flow
1. User uploads a document via any upload field
2. Document is sent to Document Manager with:
   - Unique document ID
   - Field ID reference
   - Section reference
   - Document type tag
3. Form stores only the document ID
4. Entity Documents sidebar queries Document Manager for all documents tagged with form field IDs
5. Multiple fields can reference the same document ID

### Field Linking System
```javascript
// Example: EIN appears in multiple places
{
  field_registry: {
    'ein_field': {
      locations: ['tax_section', 'org_details_card', 'parent_org_section'],
      value: '12-3456789',
      lastUpdated: '2024-01-15T10:30:00Z',
      updatedBy: 'user_123'
    }
  }
}
// When value changes in any location, all locations update
```

## Validation Rules

### Required Field Logic
- Fields marked with * are always required
- Conditional requirements based on parent field selections
- Cross-section validation (e.g., if has fiscal sponsor, sponsor tax ID required)

### Format Validations
```javascript
{
  validations: {
    ein: /^\d{2}-\d{7}$/,
    phone: /^\d{3}-\d{3}-\d{4}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    url: /^https?:\/\/.+/,
    state_registration: /^[A-Z0-9-]+$/ // varies by state
  }
}
```

## Implementation Notes

### State Management
- Use centralized state store (Redux/Vuex)
- Separate stores for:
  - Form data
  - Contact references
  - Document references
  - UI state (collapsibles, modals, etc.)

### API Endpoints Needed
```
POST   /api/form/save-draft
POST   /api/form/submit
GET    /api/form/load/{id}
GET    /api/contacts/search
POST   /api/contacts/create
PUT    /api/contacts/update/{id}
POST   /api/documents/upload
GET    /api/documents/list-by-form/{formId}
GET    /api/states/list
GET    /api/ntee-codes/search
```

### Performance Considerations
- Lazy load sections not immediately visible
- Debounce auto-save (every 30 seconds or on section change)
- Compress images on upload
- Cache contact card data with TTL
- Virtual scrolling for long dynamic lists

### Accessibility Requirements
- All form fields must have proper labels
- ARIA attributes for dynamic content
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG AA)

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile responsive design

### Error Handling
```javascript
{
  error_types: {
    validation: 'Show inline under field',
    save_failure: 'Toast notification with retry',
    load_failure: 'Full page error with reload option',
    upload_failure: 'Modal with retry/cancel',
    api_timeout: 'Auto-retry with exponential backoff'
  }
}
```

### Security Considerations
- All uploads scanned for malware
- File type restrictions enforced server-side
- XSS prevention on all text inputs
- CSRF tokens on all form submissions
- Rate limiting on API endpoints
- Encryption for sensitive fields (SSN, Tax ID)

---

**END OF SPECIFICATION**

This document provides complete instructions for building the Basic Information Form system. All components should be built following these specifications exactly, with special attention to the interconnected nature of contacts, documents, and field data.