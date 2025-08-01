# Governance Module CRUD Features

## Overview
The Governance module has been fully restored with comprehensive CRUD (Create, Read, Update, Delete) functionality and integrated with the standardized ModuleHeader component.

## Key Features

### 1. Module Header Integration
- **Lock/Unlock**: Control edit access to the entire section
- **Draft/Final Status**: Mark governance data as draft or final
- **Export Options**: Export to PDF, TIFF, or share via email
- **Print**: Direct printing functionality
- **Trash**: Remove all governance data
- **Tab Navigation**: Switch between Board Members, Committees, and Meetings

### 2. Board Members Management

#### Features:
- **Add Board Member**: Create new board member profiles
- **Edit Board Member**: In-line editing of all fields
- **Delete Board Member**: Remove board members with confirmation
- **Fields Tracked**:
  - Name (required)
  - Role/Title (required)
  - Email
  - Phone
  - Term Start Date
  - Term End Date

#### Integration:
- Syncs with Contact Manager for board member selection
- Displays count of board members from contacts
- Supports manual addition of board members

### 3. Committees Management

#### Features:
- **Add Committee**: Create new committees
- **Edit Committee**: Update committee details in-place
- **Delete Committee**: Remove committees
- **Fields Tracked**:
  - Committee Name (required)
  - Committee Chair
  - Description

### 4. Board Meetings Management

#### Features:
- **Add Meeting**: Record new board meetings
- **View Meetings**: List all recorded meetings
- **Delete Meeting**: Remove meeting records
- **Meeting Types**:
  - Regular Meeting
  - Special Meeting
  - Annual Meeting
- **Fields Tracked**:
  - Meeting Date (required)
  - Meeting Type (required)
  - Topics/Agenda
  - Quorum Met (checkbox)

### 5. State Management

The module maintains three key states:
1. **isLocked**: Controls whether fields are editable
2. **isDraft**: Indicates if the data is in draft status
3. **isFinal**: Marks the data as finalized

### 6. Responsive Design

- Desktop: Full grid layout with multiple columns
- Mobile: Stacked layout for easy navigation
- Accessible form controls with proper labels

## Usage

### Locking/Unlocking
Click the lock icon in the header to toggle edit access. When locked:
- All input fields become read-only
- Add/Remove buttons are disabled
- Data can still be viewed

### Status Management
- **Draft**: Click the document icon to mark as draft
- **Final**: Click the checkmark icon to mark as final
- Note: Cannot be both draft and final simultaneously

### Data Export
1. Click the download button with dropdown arrow
2. Select export format:
   - PDF: Downloads governance data as PDF
   - TIFF: Downloads as image file
   - Email: Opens email client with data

### Tab Navigation
Click on tabs to switch between:
- **Board Members**: Manage board composition
- **Committees**: Organize committee structure
- **Board Meetings**: Track meeting history

## Technical Implementation

### Component Structure
```typescript
GovernanceSection
├── ModuleHeader (CRUD controls)
├── Board Members Tab
│   ├── Summary from Contacts
│   └── Board Member Cards (editable)
├── Committees Tab
│   └── Committee Cards (editable)
└── Board Meetings Tab
    ├── Add Meeting Form
    └── Meeting List
```

### State Flow
1. User interactions trigger local state updates
2. Changes propagate to parent via callbacks
3. Parent component manages data persistence
4. Lock state controls field accessibility

## Best Practices

1. **Always save before locking** - Locking prevents further edits
2. **Use Draft status** for work in progress
3. **Mark as Final** only when all reviews are complete
4. **Export regularly** for backup and sharing
5. **Sync with Contacts** for consistent board member data

## Future Enhancements

- [ ] Attendance tracking for board members
- [ ] Meeting minutes upload
- [ ] Committee meeting tracking
- [ ] Board evaluation tools
- [ ] Term limit notifications
- [ ] Conflict of interest tracking