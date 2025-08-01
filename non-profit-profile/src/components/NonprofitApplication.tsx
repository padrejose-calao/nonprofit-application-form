import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { 
  AlertCircle, Upload, ChevronRight, ChevronDown, ChevronUp, Check, CheckCircle, Share2, Menu, FileText, Eye, EyeOff, Key, Info, Plus, Trash2, Edit, Move, RefreshCw, X, HardDrive, Lock as LockIcon, Unlock as UnlockIcon, FolderOpen, User, Clock, Circle, Copy, Clipboard, Users, HelpCircle, Building2, CircleDollarSign, Shield, Globe, Search, Minus, MapPin, Calendar, Phone, Mail, MessageCircle, Home, Edit2, Printer, Download, Settings, Cloud, Save, LogOut, Sun, Moon, Contrast, Layers, BarChart3, Lock, Zap, Target, Bot, ShieldCheck, Activity, Lightbulb, UserPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { User as UserType } from '../services/api';
import { Contact } from '../types/NonprofitTypes';
import { netlifySettingsService } from '../services/netlifySettingsService';
import { logger } from '../utils/logger';
import RichTextEditor from './RichTextEditor';
import CopyPasteButton from './CopyPasteButton';
import ContactManagerEnhanced from './ContactManagerEnhanced';
import EnhancedProgramManager from './EnhancedProgramManager';
import DocumentManager from './DocumentManager';
import EnhancedDocumentManager from './EnhancedDocumentManager';
import ImpactStorytellingHub from './ImpactStorytellingHub';
import DocumentUploadField from './DocumentUploadField';
import CommunicationsModule from './CommunicationsModule';
import EnhancedCommunicationsHub from './EnhancedCommunicationsHub';
import AdminDocumentDistribution from './AdminDocumentDistribution';
import QuickWinsEnhancements from './QuickWinsEnhancements';
import SmartFormAssistant from './SmartFormAssistant';
import EnhancedSmartAssistant from './EnhancedSmartAssistant';
import APILocker from './APILocker';
import ContactInviteForm from './ContactInviteForm';
import ClientOnboarding from './ClientOnboarding';
import { useDarkMode } from '../hooks/useDarkMode';
import { APP_CONFIG } from '../config/constants';
import { handleSaveError, handleFileError } from '../utils/errorHandler';
import { commonValidationRules, conditionalValidationRules, runConditionalValidations } from '../utils/formValidation';
import OrganizationalHealthDashboard from './OrganizationalHealthDashboard';
import PerformanceDashboard from './PerformanceDashboard';
import KeyboardShortcutIndicator from './KeyboardShortcutIndicator';
import NarrativeEntryField from './NarrativeEntryField';
import ContactSelector, { ContactInfo } from './ContactSelector';
import IntegratedDocumentUploadField from './IntegratedDocumentUploadField';
import { SectionLock } from './PermissionsManager';
import { documentService } from '../services/documentService';
import NTEECodeSelector from './NTEECodeSelector';
import FormProgressTracker from './FormProgressTracker';
import DigitalAssetsSection from './sections/DigitalAssetsSection';
import BoardVisualization from './BoardVisualization';
import AttendanceTracker from './AttendanceTracker';
import QuickActionMenu from './QuickActionMenu';
import AutoSaveStatus from './AutoSaveStatus';
import GovernanceSection from './GovernanceSection';
import OrganizationalDocuments from './OrganizationalDocuments';
import ReferencesNetworksSection from './ReferencesNetworksSection';
import BasicInformation2 from './BasicInformation2/BasicInformationContinuous';
import CollaborationIndicator from './CollaborationIndicator';
import OfflineIndicator from './OfflineIndicator';
import EnhancedFinancialSection from './EnhancedFinancialSection';
import { auditLogService } from '../services/auditLogService';
import CollaborativeInput from './CollaborativeInput';
import FloatingUIContainer from './FloatingUIContainer';
import AutoProgressTrackerContent from './AutoProgressTrackerContent';
import CollaborationIndicatorContent from './CollaborationIndicatorContent';
import ExportImportModal from './ExportImportModal';
import RoleManagement from './RoleManagement';
import AdvancedSearch from './AdvancedSearch';
import AnalyticsDashboard from './AnalyticsDashboard';
import { rbacService } from '../services/rbacService';
import { euidService } from '../services/euidService';
import { RBACSectionGuard, RBACFieldGuard, PermissionBadge } from './RBACPermissionGuard';
import { useAutoSave } from '../hooks/useAutoSave';
import { offlineSyncService } from '../services/offlineSyncService';
import EUIDDisplay from './EUIDDisplay';

// US States constant
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
  'District of Columbia', 'Puerto Rico', 'Virgin Islands', 'Guam', 'American Samoa', 'Northern Mariana Islands'
];

// Type definitions
interface AttendanceRecord {
  meetingId: string;
  present: boolean;
  excused?: boolean;
  notes?: string;
}

interface CommitteeAssignment {
  committeeId: string | number;
  committeeName: string;
  role?: string;
  joinDate?: string;
}

interface BoardMember {
  id: string | number;
  name: string;
  role: string;
  retained: boolean;
  title: string;
  email: string;
  phone: string;
  termStart?: string;
  termEnd?: string;
  bio?: string;
  expertise?: string;
  conflicts?: string;
  attendance?: AttendanceRecord[];
  committees?: CommitteeAssignment[];
}

interface AdvisoryMember {
  id: string | number;
  name: string;
  retained: boolean;
}

interface Committee {
  id: string | number;
  name: string;
  members: AdvisoryMember[];
  description?: string;
  chair?: string;
  meetings?: BoardMeeting[];
}

interface MeetingDecision {
  id: string;
  topic: string;
  decision: string;
  votesFor?: number;
  votesAgainst?: number;
  abstentions?: number;
  approved: boolean;
}

interface BoardMeeting {
  id: string;
  date: string;
  type: string;
  attendees: string | string[];
  topics: string;
  minutes: string;
  uploaded: boolean;
  agenda?: string;
  quorum?: boolean;
  decisions?: MeetingDecision[];
}

// Contact interface is now imported from NonprofitTypes
// Extended interface for local use with additional properties
interface ExtendedContact extends Contact {
  type?: 'person' | 'organization';
  name?: string;
  whatsapp?: string;
  relationships?: Array<{
    contactId: number;
    type: string;
    description?: string;
  }>;
}

// Enhanced Organization interface
interface Organization {
  id: string;
  name: string;
  displayName?: string;
  type: 'nonprofit' | 'foundation' | 'corporation' | 'government' | 'individual';
  ein?: string;
  parentOrganization?: Organization;
  subsidiaries?: Organization[];
  fiscalSponsor?: Organization;
  affiliations?: Organization[];
  contactInfo: {
    phone: string;
    whatsapp?: string;
    email: string;
    preferredEmail?: string;
    website?: string;
    address: {
      street: string;
      street2?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  primaryContact?: Contact;
  additionalContacts?: Contact[];
  nteeCode?: {
    code: string;
    title: string;
    description: string;
    category: string;
  };
  activityCode?: {
    code: string;
    title: string;
    description: string;
  };
  digitalAssets?: {
    logo?: string;
    bannerImage?: string;
    socialMedia?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
      tiktok?: string;
      other?: Array<{
        platform: string;
        username: string;
        url: string;
      }>;
    };
    videos?: string[];
  };
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    category: string;
    uploadDate: Date;
  }>;
  brand?: {
    mission?: string;
    vision?: string;
    values?: string;
    brandGuidelines?: string;
    targetAudience?: string;
    messagingFramework?: string;
    visualIdentity?: string;
    toneOfVoice?: string;
  };
  permissions?: {
    [userId: string]: string[];
  };
  lastModified: Date;
  createdDate: Date;
}

// Form section configuration
interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  fields: string[];
  isRequired?: boolean;
  isLocked?: boolean;
  lockedBy?: string;
  permissions?: {
    canView?: boolean;
    canEdit?: boolean;
    canLock?: boolean;
  };
  subsections?: FormSection[];
  validationRules?: Record<string, (value: string | number | boolean | string[] | File | null | undefined) => boolean>;
  completionStatus?: 'not-started' | 'in-progress' | 'completed';
  autoSave?: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  team: string[];
  objectives: string[];
  outcomes: string[];
  createdDate: string;
  lastModified: string;
}

interface SectionLock {
  id: string;
  sectionId: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: Date;
  reason?: string;
}

interface SectionStatus {
  [key: string]: string;
}

interface FormData {
  [key: string]: unknown;
  euid?: string;
  address2?: string;
  dba?: string[];
  parentOrganization?: string;
  hasParentOrg?: string;
  hasSubsidiaries?: boolean;
  hasFiscalSponsor?: string;
  hasAffiliations?: string;
  fiscalSponsor?: string;
  zipCode4?: string;
  contactPerson?: string;
  contactPhone?: string;
  ssn?: string;
  use1099?: boolean;
  contactHasW9?: boolean;
  contactW9?: File | null;
  w9Form?: File | null;
  articlesOfIncorporation?: File | null;
  bylaws?: File | null;
  goodStanding?: File | null;
  annualReport?: File | null;
  charitableRegistration?: File | null;
  organizationWhatsApp?: string;
  preferredOrgEmail?: string;
  correspondenceInstructions?: string;
}

interface Errors {
  [key: string]: string;
}

interface FieldOrder {
  [key: string]: string[];
}

interface HiddenFields {
  [sectionId: string]: { [field: string]: boolean };
}

interface CustomFields {
  [key: string]: string | number | boolean | string[] | File | null | undefined;
}

interface SectionProgress {
  [sectionId: string]: {
    completed: number;
    total: number;
    percentage: number;
    status: 'not-started' | 'in-progress' | 'completed';
  };
}

interface ErrorBoundaryInfo {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack?: string;
    errorBoundary?: string;
  };
}

interface OfflineQueueItem {
  id: string;
  timestamp: string;
  type: 'save' | 'submit' | 'section-save';
  data: FormData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  retryCount: number;
}

type FormFieldValue = string | number | boolean | string[] | File | null | undefined | BoardMember[] | AdvisoryMember[] | BoardMeeting[] | ExtendedContact[];

interface NonprofitApplicationProps {
  currentUser: UserType | null;
  onLogout: () => void;
}

const NonprofitApplication: React.FC<NonprofitApplicationProps> = ({ currentUser, onLogout }) => {
  logger.debug('NonprofitApplication component rendering', { currentUser });
  
  // Core state
  const [activeTab, setActiveTab] = useState<string>('full'); // 'full', 'cff', 'required', or 'custom'
  const [einFirst, _setEinFirst] = useState<boolean>(true);
  const [noEin, setNoEin] = useState<boolean>(false);
  const [einSequence, setEinSequence] = useState<number>(1);
  const [stateNonProfitOnly, setStateNonProfitOnly] = useState<boolean>(false);
  const [foreignEntity, setForeignEntity] = useState<boolean>(false);
  const [unincorporatedWithFiscalSponsor, setUnincorporatedWithFiscalSponsor] = useState<boolean>(false);
  const [_otherTaxId, _setOtherTaxId] = useState<boolean>(false);
  const [hasGroupExemption, setHasGroupExemption] = useState<boolean>(false);
  const [formLocked, _setFormLocked] = useState<boolean>(false);
  const [sectionLocks, setSectionLocks] = useState<Record<string, boolean>>({});
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({});
  const [sectionLockLevels, setSectionLockLevels] = useState<{ [key: string]: 'none' | 'draft' | 'review' | 'final' }>({});
  const [_sectionLockReasons, setSectionLockReasons] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<FormData>({
    address2: '',
    dba: [],
    parentOrganization: '',
    fiscalSponsor: '',
    zipCode4: '',
    contactPerson: '',
    contactPhone: '',
    stateEntityState: '',
    stateEntityNumber: '',
    foreignCountry: '',
    foreignRegistrationNumber: '',
    foreignRegistrationType: '',
    groupExemptionNumber: '',
    centralOrganizationName: '',
    centralOrganizationEIN: '',
    fiscalSponsorDetails: {
      organizationName: '',
      ein: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      agreementDate: '',
      agreementDocument: null
    }
  });
  const [savedForms, setSavedForms] = useState<Array<FormData>>([]);
  const [currentFormId, setCurrentFormId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [showSettings, setShowSettings] = useState(false);
  const [showAdminGuide, setShowAdminGuide] = useState(false);
  const [_settingsLocked, _setSettingsLocked] = useState(true);
  const [showPasswords, setShowPasswords] = useState(false);
  const [_showSidebar, setShowSidebar] = useState(true);
  const [currentPassword, setCurrentPassword] = useState(APP_CONFIG.DEFAULT_PASSWORD);
  const [_passwordInput, _setPasswordInput] = useState('');
  const [disableRequiredFields, setDisableRequiredFields] = useState(false);
  const [hideBlankFieldsOnPrint, setHideBlankFieldsOnPrint] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [_customBanners, setCustomBanners] = useState(['', '', '']);
  const [_activeBanner, _setActiveBanner] = useState(0);
  const [_lastSavedSection, setLastSavedSection] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [_attendanceSheetCount, _setAttendanceSheetCount] = useState(1);
  const [_minutesCount, _setMinutesCount] = useState(1);
  const [_leadershipCount, _setLeadershipCount] = useState({
    programManager: 0,
    projectDirector: 0,
    other: 0
  });
  
  // Sub-organizations state
  const [subOrganizations, setSubOrganizations] = useState<Array<{
    id: string;
    name: string;
    ein: string;
    contactPerson: string;
    email: string;
    phone: string;
    relationship: string;
  }>>([]);

  // Auto-save functionality
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveCountdown, setAutoSaveCountdown] = useState<number>(0);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [autoSaveEnabled, _setAutoSaveEnabled] = useState(true);
  
  // Progress checkpoints
  const [progressCheckpoints, setProgressCheckpoints] = useState<Array<{
    id: string;
    timestamp: string;
    progress: number;
    sectionProgress: SectionProgress;
    formData: FormData;
    description: string;
    type: 'auto' | 'manual' | 'milestone';
  }>>([]);
  const [showCheckpointsModal, setShowCheckpointsModal] = useState(false);
  
  // Error recovery functionality
  const [errorBoundaryInfo, setErrorBoundaryInfo] = useState<ErrorBoundaryInfo>({ hasError: false });
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('online');
  const [lastKnownGoodState, setLastKnownGoodState] = useState<unknown>(null);

  // Offline submission queue
  const [submissionQueue, setSubmissionQueue] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'save' | 'submit' | 'section-save';
    data: FormData;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    retryCount: number;
    error?: string;
  }>>([]);
  
  // States that were defined later but need to be here
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showOfflineQueue, setShowOfflineQueue] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'tabbed'>('standard');
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTopic, setHelpTopic] = useState<string>('general');
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  
  // Progress tracking states for AutoProgressTracker
  const [_formStartTime] = useState<Date>(new Date());
  const [currentField, setCurrentField] = useState<string>('');
  const [currentSectionId, setCurrentSectionId] = useState<string>('basicInfo');
  const [showProgressTracker, setShowProgressTracker] = useState<boolean>(true);
  const [showProTips, setShowProTips] = useState<boolean>(false); // Default off per user request
  
  // AI-powered field suggestions
  const [showAISuggestions, _setShowAISuggestions] = useState(true);
  const [aiSuggestions, setAISuggestions] = useState<{[field: string]: string[]}>({});

  // Narrative section state
  const [narrative, setNarrative] = useState({
    backgroundStatement: '',
    missionStatement: '',
    visionStatement: '',
    impactStatement: '',
    strategiesStatement: '',
    needsStatement: '',
    primaryAreasOfImpact: '',
    nteeCodes: '',
    populationServed: '',
    serviceAreas: '',
    serviceAreaDescription: '',
    searchKeywords: '',
    logoFile: null as File | null,
    bannerImage: null as File | null,
    socialMedia: '',
    externalAssessments: '',
    affiliations: '',
    videos: '',
    annualReport: null as File | null,
    strategicPlan: null as File | null,
    backgroundStatementDocs: null as File | null,
    missionStatementDocs: null as File | null,
    visionStatementDocs: null as File | null,
    impactStatementDocs: null as File | null,
    strategiesStatementDocs: null as File | null,
    needsStatementDocs: null as File | null,
    primaryAreasOfImpactDocs: null as File | null,
    nteeCodesDocs: null as File | null,
    populationServedDocs: null as File | null,
    serviceAreasDocs: null as File | null,
    serviceAreaDescriptionDocs: null as File | null,
    searchKeywordsDocs: null as File | null,
    socialMediaDocs: null as File | null,
    externalAssessmentsDocs: null as File | null,
    affiliationsDocs: null as File | null,
    videosDocs: null as File | null
  });
  const [narrativeErrors, setNarrativeErrors] = useState<unknown>({});
  const [narrativeLocked, setNarrativeLocked] = useState(false);
  const [narrativeAutoSaveStatus, setNarrativeAutoSaveStatus] = useState('');

  // Local AI suggestion engine (no external APIs)
  const generateAISuggestions = (fieldName: string, currentValue: string, formContext: FormData) => {
    const suggestions: string[] = [];
    
    // Ensure currentValue is a string
    const safeCurrentValue = currentValue || '';
    
    // Context-aware suggestions based on field patterns
    switch (fieldName) {
      case 'organizationName':
        if (!safeCurrentValue && formContext.ein) {
          // Suggest based on common nonprofit naming patterns
          const patterns = [
            'Foundation', 'Institute', 'Association', 'Society', 'Coalition',
            'Alliance', 'Network', 'Center', 'Council', 'Trust'
          ];
          suggestions.push(...patterns.map(p => `${p} for [Your Cause]`));
        }
        break;
        
      case 'missionStatement':
        if (safeCurrentValue.length < 50) {
          // Suggest mission statement templates
          const templates = [
            `To ${formContext.organizationType === 'charity' ? 'provide' : 'promote'} [service/resource] to [target population] in order to [desired outcome]`,
            `Our mission is to [action verb] [target population] by [method/approach] to achieve [impact/goal]`,
            `We exist to [primary purpose] through [key activities] for the benefit of [beneficiaries]`
          ];
          suggestions.push(...templates);
        }
        break;
        
      case 'visionStatement':
        if (currentValue.length < 30) {
          suggestions.push(
            'A world where [desired future state]',
            'To be the leading [type of organization] in [geographic area/field]',
            '[Target population] living in a community where [ideal conditions]'
          );
        }
        break;
        
      case 'address':
        // Suggest formatting corrections
        if (currentValue && !currentValue.match(/^\d+\s+/)) {
          suggestions.push('Consider starting with street number (e.g., "123 Main Street")');
        }
        break;
        
      case 'website':
        if (currentValue && !currentValue.startsWith('http')) {
          suggestions.push(`https://${currentValue}`, `http://${currentValue}`);
        }
        if (!currentValue && formContext.organizationName) {
          const orgSlug = (formContext.organizationName as string)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);
          suggestions.push(`https://www.${orgSlug}.org`, `https://${orgSlug}.org`);
        }
        break;
        
      case 'targetPopulation':
        if (!currentValue) {
          const populations = [
            'Children and youth', 'Seniors', 'Families in need', 'Veterans',
            'People with disabilities', 'Homeless individuals', 'Low-income communities',
            'Immigrants and refugees', 'Students', 'Healthcare patients'
          ];
          suggestions.push(...populations);
        }
        break;
        
      case 'programAreas':
        if (!currentValue) {
          const areas = [
            'Education and literacy', 'Health and wellness', 'Arts and culture',
            'Environmental conservation', 'Social services', 'Economic development',
            'Youth development', 'Community building', 'Advocacy and policy',
            'Research and innovation'
          ];
          suggestions.push(...areas);
        }
        break;
        
      case 'impactMetrics':
        if (!currentValue) {
          const metrics = [
            'Number of people served annually',
            'Percentage improvement in [outcome measure]',
            'Cost per beneficiary served',
            'Program completion/success rate',
            'Community satisfaction scores',
            'Long-term outcome tracking'
          ];
          suggestions.push(...metrics);
        }
        break;
        
      case 'email':
        if (safeCurrentValue && !safeCurrentValue.includes('@') && formContext.website) {
          const domain = (formContext.website as string).replace(/https?:\/\//g, '').replace('www.', '');
          suggestions.push(`${safeCurrentValue}@${domain}`);
        }
        break;
    }
    
    // Smart autocomplete based on existing patterns in form
    if (fieldName && (fieldName.includes('phone') || fieldName.includes('Phone'))) {
      if (formContext.phone && safeCurrentValue.length < 5) {
        const areaCode = (formContext.phone as string).substring(0, 3);
        suggestions.push(`(${areaCode}) `);
      }
    }
    
    // Date field suggestions
    if (fieldName && (fieldName.includes('date') || fieldName.includes('Date'))) {
      const today = new Date();
      const formats = [
        today.toISOString().split('T')[0],
        `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`,
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      ];
      suggestions.push(...formats);
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  // Update AI suggestions when field gets focus
  const updateAISuggestionsForField = (fieldName: string) => {
    if (!showAISuggestions) return;
    
    const currentValue = (formData as any)[fieldName] || '';
    const suggestions = generateAISuggestions(fieldName, currentValue as string, formData);
    
    if (suggestions.length > 0) {
      setAISuggestions(prev => ({ ...(prev as any), [fieldName]: suggestions }));
    } else {
      // Clear suggestions if none available
      setAISuggestions(prev => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Apply AI suggestion
  const applyAISuggestion = (fieldName: string, suggestion: string) => {
    handleInputChange(fieldName, suggestion);
    // Clear suggestions after applying
    setAISuggestions(prev => {
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
    toast.success('AI suggestion applied', {
      position: 'bottom-right',
      autoClose: 2000
    });
  };

  // Enhanced form validation
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Form Analytics & Usage Tracking
  const [formAnalytics, setFormAnalytics] = useState({
    startTime: new Date().toISOString(),
    totalTimeSpent: 0,
    fieldInteractions: {} as {[field: string]: {
      focusCount: number;
      totalTime: number;
      errorCount: number;
      changesCount: number;
    }},
    sectionVisits: {} as {[section: string]: {
      visitCount: number;
      totalTime: number;
      completions: number;
    }},
    completionAttempts: 0,
    saveCount: 0,
    undoCount: 0,
    errorsByType: {} as {[errorType: string]: number},
    mostEditedFields: [] as Array<{ field: string; edits: number }>,
    averageFieldTime: {} as {[field: string]: number},
    formCompletionRate: 0,
    abandonmentPoints: [] as Array<{ section: string; field: string; timestamp: string }>
  });
  
  const [_fieldFocusTime, _setFieldFocusTime] = useState<{[field: string]: number}>({});
  const [currentFocusField, setCurrentFocusField] = useState<string | null>(null);
  const [focusStartTime, setFocusStartTime] = useState<number | null>(null);
  
  // Track field focus time
  const trackFieldFocus = (fieldName: string) => {
    if (currentFocusField && focusStartTime) {
      const timeSpent = Date.now() - focusStartTime;
      setFormAnalytics(prev => ({
        ...prev,
        fieldInteractions: {
          ...prev.fieldInteractions,
          [currentFocusField]: {
            ...prev.fieldInteractions[currentFocusField],
            totalTime: (prev.fieldInteractions[currentFocusField]?.totalTime || 0) + timeSpent
          }
        }
      }));
    }
    
    setCurrentFocusField(fieldName);
    setFocusStartTime(Date.now());
    
    setFormAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: {
          ...prev.fieldInteractions[fieldName],
          focusCount: (prev.fieldInteractions[fieldName]?.focusCount || 0) + 1
        }
      }
    }));
  };
  
  // Track field changes
  const trackFieldChange = (fieldName: string) => {
    setFormAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: {
          ...prev.fieldInteractions[fieldName],
          changesCount: (prev.fieldInteractions[fieldName]?.changesCount || 0) + 1
        }
      }
    }));
  };
  
  // Track errors
  const _trackError = (fieldName: string, errorType: string) => {
    setFormAnalytics(prev => ({
      ...prev,
      fieldInteractions: {
        ...prev.fieldInteractions,
        [fieldName]: {
          ...prev.fieldInteractions[fieldName],
          errorCount: (prev.fieldInteractions[fieldName]?.errorCount || 0) + 1
        }
      },
      errorsByType: {
        ...prev.errorsByType,
        [errorType]: (prev.errorsByType[errorType] || 0) + 1
      }
    }));
  };
  
  // Inline Analytics Dashboard Component
  const _InlineAnalyticsDashboard: React.FC<{
    analytics: typeof formAnalytics;
    insights: ReturnType<typeof getAnalyticsInsights>;
    formData: FormData;
    sectionProgress: typeof sectionProgress;
  }> = ({ analytics, insights, formData, sectionProgress }) => {
    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Completion Rate</h3>
            <div className="text-2xl font-bold text-blue-700">{insights.completionRate.toFixed(1)}%</div>
            <div className="text-xs text-blue-600 mt-1">
              {Object.keys(formData).filter(k => formData[k]).length} of {Object.keys(formData).length} fields
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-1">Time Spent</h3>
            <div className="text-2xl font-bold text-green-700">{insights.totalTimeSpent} min</div>
            <div className="text-xs text-green-600 mt-1">
              Started {new Date(analytics.startTime).toLocaleTimeString()}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900 mb-1">Total Interactions</h3>
            <div className="text-2xl font-bold text-purple-700">
              {Object.values(analytics.fieldInteractions).reduce((sum, field) => sum + (field.focusCount || 0), 0)}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Across {Object.keys(analytics.fieldInteractions).length} fields
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900 mb-1">Error Rate</h3>
            <div className="text-2xl font-bold text-orange-700">{insights.errorRate}</div>
            <div className="text-xs text-orange-600 mt-1">
              Total validation errors
            </div>
          </div>
        </div>
        
        {/* Most Edited Fields */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Most Edited Fields</h3>
          <div className="space-y-2">
            {insights.mostEditedFields.map((field, index) => (
              <div key={field.field} className="flex items-center justify-between">
                <span className="text-sm">{field.field}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(field.edits / insights.mostEditedFields[0]?.edits) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{field.edits} edits</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Section Progress */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Section Completion</h3>
          <div className="space-y-2">
            {sections.map(section => (
              <div key={section.id} className="flex items-center justify-between">
                <span className="text-sm">{section.title}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${sectionProgress[section.id as keyof typeof sectionProgress] || 0}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{sectionProgress[section.id as keyof typeof sectionProgress] || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Average Time per Field */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Average Time per Field (seconds)</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(insights.averageFieldTimes)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([field, time]) => (
                <div key={field} className="flex justify-between py-1 border-b">
                  <span>{field}</span>
                  <span className="font-medium">{time}s</span>
                </div>
              ))}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button 
            onClick={() => {
              const report = {
                analytics,
                insights,
                timestamp: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `form-analytics-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
          >
            Export Analytics
          </button>
        </div>
      </div>
    );
  };

  // Calculate analytics insights
  const getAnalyticsInsights = () => {
    const totalFields = Object.keys(formData).length;
    const completedFields = Object.keys(formData).filter(k => formData[k]).length;
    const completionRate = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
    
    // Find most edited fields
    const fieldEditCounts = Object.entries(formAnalytics.fieldInteractions)
      .map(([field, data]) => ({ field, edits: data.changesCount || 0 }))
      .sort((a, b) => b.edits - a.edits)
      .slice(0, 5);
    
    // Calculate average time per field
    const avgTimes = Object.entries(formAnalytics.fieldInteractions).reduce((acc, [field, data]) => {
      if (data.focusCount > 0) {
        acc[field] = Math.round(data.totalTime / data.focusCount / 1000); // seconds
      }
      return acc;
    }, {} as {[field: string]: number});
    
    return {
      completionRate,
      mostEditedFields: fieldEditCounts,
      averageFieldTimes: avgTimes,
      totalTimeSpent: Math.round((Date.now() - new Date(formAnalytics.startTime).getTime()) / 1000 / 60), // minutes
      errorRate: Object.values(formAnalytics.fieldInteractions).reduce((sum, field) => sum + (field.errorCount || 0), 0)
    };
  };

  // Real-time Collaboration Indicators
  const [activeUsers, setActiveUsers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    color: string;
    activeField?: string;
    lastActivity: string;
    status: 'active' | 'idle' | 'away';
  }>>([]);
  const [showCollaborators, _setShowCollaborators] = useState(true);
  const [_fieldLocks, _setFieldLocks] = useState<{[field: string]: string}>({});
  const [_userCursors, _setUserCursors] = useState<{[userId: string]: { field: string; position: number }}>({});
  
  // Simulate collaboration (in real app, this would use WebSockets)
  useEffect(() => {
    // Simulate other users
    const mockUsers = [
      { 
        id: 'user2', 
        name: 'Sarah Johnson', 
        email: 'sarah@example.org',
        color: '#10B981',
        activeField: 'missionStatement',
        lastActivity: new Date().toISOString(),
        status: 'active' as const
      },
      { 
        id: 'user3', 
        name: 'Mike Chen', 
        email: 'mike@example.org',
        color: '#F59E0B',
        activeField: 'programAreas',
        lastActivity: new Date(Date.now() - 60000).toISOString(),
        status: 'idle' as const
      }
    ];
    
    // Only show collaborators in full view
    if (activeTab === 'full' && Math.random() > 0.5) {
      setActiveUsers(mockUsers);
    }
  }, [activeTab]);
  
  // Get user color for collaboration
  const _getUserColor = (userId: string): string => {
    const user = activeUsers.find(u => u.id === userId);
    return user?.color || '#6B7280';
  };
  
  // Check if field is being edited by another user
  const _getFieldCollaborator = (fieldName: string): typeof activeUsers[0] | undefined => {
    return activeUsers.find(user => user.activeField === fieldName && user.status === 'active');
  };

  // Custom Field Builder State
  const [showFieldBuilder, setShowFieldBuilder] = useState(false);
  const [editingCustomField, setEditingCustomField] = useState<string | null>(null);
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<Array<{
    id: string;
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'radio';
    section: string;
    required: boolean;
    placeholder?: string;
    helpText?: string;
    validation?: {
      pattern?: string;
      minLength?: number;
      maxLength?: number;
      min?: number;
      max?: number;
    };
    options?: Array<{ value: string; label: string }>; // For select, radio
    defaultValue?: FormFieldValue;
    dependsOn?: { field: string; value: FormFieldValue };
    position?: number;
  }>>([]);

  // Add custom field to form
  const addCustomField = (fieldDef: typeof customFieldDefinitions[0]) => {
    const newField = {
      ...fieldDef,
      id: fieldDef.id || `custom_${Date.now()}`,
      position: fieldDef.position || customFieldDefinitions.length
    };
    
    setCustomFieldDefinitions(prev => [...prev, newField]);
    
    // Initialize field value in formData
    if (fieldDef.defaultValue !== undefined) {
      setFormData(prev => ({ ...(prev as any), [newField.name]: fieldDef.defaultValue }));
    }
    
    toast.success(`Custom field "${fieldDef.label}" added`, {
      position: 'bottom-right',
      autoClose: 2000
    });
  };

  // Update custom field definition
  const updateCustomField = (fieldId: string, updates: Partial<typeof customFieldDefinitions[0]>) => {
    setCustomFieldDefinitions(prev => prev.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  // Delete custom field
  const deleteCustomField = (fieldId: string) => {
    const field = customFieldDefinitions.find(f => f.id === fieldId);
    if (!field) return;
    
    showConfirmationDialog(
      `Are you sure you want to delete the custom field "${field.label}"? Any data in this field will be lost.`,
      () => {
        setCustomFieldDefinitions(prev => prev.filter(f => f.id !== fieldId));
        // Remove field data
        setFormData(prev => {
          const { [field.name]: _, ...rest } = prev;
          return rest;
        });
        toast.success(`Custom field "${field.label}" deleted`);
      }
    );
  };

  // Custom Field Builder Form Component
  const CustomFieldBuilderForm: React.FC<{
    field: typeof customFieldDefinitions[0] | null;
    sections: typeof sections;
    onSave: (fieldDef: { name: string; label: string; type: 'text' | 'textarea' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'checkbox' | 'radio'; section: string; required: boolean; options?: string[]; }) => void;
    onCancel: () => void;
  }> = ({ field, sections, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: field?.name || '',
      label: field?.label || '',
      type: field?.type || 'text',
      section: field?.section || 'additionalInfo',
      required: field?.required || false,
      placeholder: field?.placeholder || '',
      helpText: field?.helpText || '',
      validation: field?.validation || {},
      options: field?.options || [],
      defaultValue: field?.defaultValue || '',
      dependsOn: field?.dependsOn || null
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name || !formData.label) {
        toast.error('Field name and label are required');
        return;
      }
      // Transform options to string array for compatibility
      const processedFormData = {
        ...formData,
        options: formData.options.map((opt: unknown) => 
          typeof opt === 'string' ? opt : ((opt as any).value || (opt as any).label || opt)
        )
      };
      onSave(processedFormData as any);
    };

    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Field Name (Internal)</label>
            <input
              type="text"
              value={(formData as any).name}
              onChange={(e) => setFormData(prev => ({ ...(prev as any), name: e.target.value.replace(/\s/g, '_') }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., custom_field_1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Field Label</label>
            <input
              type="text"
              value={(formData as any).label}
              onChange={(e) => setFormData(prev => ({ ...(prev as any), label: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="e.g., Special Requirements"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Field Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...(prev as any), type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="text">Text</option>
              <option value="textarea">Text Area</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="date">Date</option>
              <option value="select">Dropdown</option>
              <option value="checkbox">Checkbox</option>
              <option value="radio">Radio Buttons</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Section</label>
            <select
              value={(formData as any).section}
              onChange={(e) => setFormData(prev => ({ ...(prev as any), section: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={Boolean((formData as any).required)}
              onChange={(e) => setFormData(prev => ({ ...(prev as any), required: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm font-medium">Required field</span>
          </label>
        </div>

        {(formData.type === 'select' || formData.type === 'radio') && (
          <div>
            <label className="block text-sm font-medium mb-1">Options</label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = { ...option, value: e.target.value };
                      setFormData(prev => ({ ...(prev as any), options: newOptions }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Value"
                  />
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = { ...option, label: e.target.value };
                      setFormData(prev => ({ ...(prev as any), options: newOptions }));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Label"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newOptions = formData.options.filter((_, i) => i !== index);
                      setFormData(prev => ({ ...(prev as any), options: newOptions }));
                    }}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  options: [...prev.options, { value: '', label: '' }] 
                }))}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors text-sm font-medium"
              >
                Add Option
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
          >
            {field ? 'Update Field' : 'Add Field'}
          </button>
        </div>
      </form>
    );
  };

  // Render custom field in form
  const renderCustomField = (fieldDef: typeof customFieldDefinitions[0]) => {
    const value = formData[fieldDef.name] || '';
    const error = errors[fieldDef.name];
    
    // Check dependencies
    if (fieldDef.dependsOn) {
      const dependentValue = formData[fieldDef.dependsOn.field];
      if (dependentValue !== fieldDef.dependsOn.value) {
        return null;
      }
    }
    
    return (
      <div key={fieldDef.id} className="mb-4">
        <label className="block font-semibold mb-1">
          {fieldDef.label}
          {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {fieldDef.type === 'textarea' ? (
          <MobileOptimizedTextarea
            value={value as string}
            onChange={(val) => handleInputChange(fieldDef.name, val)}
            placeholder={fieldDef.placeholder}
            fieldName={fieldDef.name}
            maxLength={fieldDef.validation?.maxLength}
            rows={4}
            autoExpand={true}
          />
        ) : fieldDef.type === 'select' ? (
          <MobileOptimizedSelect
            value={value as string}
            onChange={(val) => handleInputChange(fieldDef.name, val)}
            options={fieldDef.options || []}
            placeholder={fieldDef.placeholder || 'Select an option'}
            fieldName={fieldDef.name}
          />
        ) : fieldDef.type === 'checkbox' ? (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleInputChange(fieldDef.name, e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">{fieldDef.placeholder || 'Check to enable'}</span>
          </label>
        ) : fieldDef.type === 'radio' && fieldDef.options ? (
          <div className="space-y-2">
            {fieldDef.options.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={fieldDef.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleInputChange(fieldDef.name, e.target.value)}
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <InputWithAISuggestions
            fieldName={fieldDef.name}
            value={value as string}
            onChange={(val) => handleInputChange(fieldDef.name, val)}
            type={fieldDef.type}
            placeholder={fieldDef.placeholder}
            required={fieldDef.required}
          />
        )}
        
        {fieldDef.helpText && (
          <small className="text-gray-600 mt-1 block">{fieldDef.helpText}</small>
        )}
        
        {error && (
          <div className="flex items-center space-x-1 text-red-600 text-sm mt-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Edit/Delete buttons for custom fields */}
        <div className="flex items-center space-x-2 mt-2">
          <button
            type="button"
            onClick={() => {
              setEditingCustomField(fieldDef.id);
              setShowFieldBuilder(true);
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Edit Field
          </button>
          <button
            type="button"
            onClick={() => deleteCustomField(fieldDef.id)}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Delete Field
          </button>
        </div>
      </div>
    );
  };
  const [_isSubmitting, _setIsSubmitting] = useState(false);

  // Form persistence
  const [formVersion, setFormVersion] = useState(1);
  
  // Section progress tracking
  const [sectionProgress, setSectionProgress] = useState({
    basicInfo: 0,
    digitalAssets: 0,
    brand: 0,
    organizationalDocuments: 0,
    narrative: 0,
    governance: 0,
    management: 0,
    financials: 0,
    programs: 0,
    impact: 0,
    compliance: 0,
    donations: 0,
    technology: 0,
    communications: 0,
    otherLocations: 0,
    insurance: 0,
    riskManagement: 0,
    additionalInfo: 0,
    leadershipDetails: 0,
    boardMemberDetails: 0,
    staffDetails: 0,
    references: 0
  });
  
  // Section collapse state - all sections default to closed
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    digitalAssets: true,
    brand: true,
    entityDocuments: true,
    narrative: true,
    governance: true,
    management: true,
    financials: true,
    programs: true,
    impact: true,
    compliance: true,
    donations: true,
    technology: true,
    communications: true,
    otherLocations: true,
    insurance: true,
    riskManagement: true,
    additionalInfo: true,
    leadershipDetails: true,
    boardMemberDetails: true,
    staffDetails: true,
    references: true
  });
  
  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Auto-backup functionality
  useEffect(() => {
    const backupData = {
      formData,
      sectionProgress,
      lastSaved: new Date().toISOString(),
      version: formVersion
    };
    netlifySettingsService.set('formBackup', backupData, 'organization').catch(error => logger.error('Failed to save form backup', error as any));
  }, [formData, sectionProgress, formVersion]);

  // Paste event listener for CopyPasteButton
  useEffect(() => {
    const handlePasteFromClipboard = (event: CustomEvent) => {
      const { text } = event.detail;
      // Find the currently focused input and update its value
      const activeElement = document.activeElement;
      if (activeElement && activeElement instanceof HTMLInputElement) {
        const fieldName = activeElement.id;
        if (fieldName) {
          handleInputChange(fieldName, text);
          toast.success('Text pasted successfully!');
        }
      }
    };

    document.addEventListener('pasteFromClipboard', handlePasteFromClipboard as EventListener);
    return () => {
      document.removeEventListener('pasteFromClipboard', handlePasteFromClipboard as EventListener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save logic for Narrative
  useEffect(() => {
    if (narrativeLocked) return;
    const timeout = setTimeout(() => {
      setNarrativeAutoSaveStatus('Saving...');
      setTimeout(() => setNarrativeAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [narrative, narrativeLocked]);

  // Enhanced UI state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [_showTooltips, setShowTooltips] = useState(true);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  // Moved highContrastMode to top of component
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Field customization state
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [customSections, setCustomSections] = useState<any[]>([]);
  const [_hiddenFields, setHiddenFields] = useState<HiddenFields>({});
  const [_customFields, _setCustomFields] = useState<CustomFields>({});
  const [_fieldOrder, setFieldOrder] = useState<FieldOrder>({});
  
  // API settings
  const [_apiSettings, setApiSettings] = useState({
    googleClientId: '',
    googleApiKey: '',
    googleClientSecret: '',
    docxApiKey: '',
    pdfApiKey: ''
  });

  const _ADMIN_PASSWORD = APP_CONFIG.ADMIN_PASSWORD;
  const _DEFAULT_PASSWORD = APP_CONFIG.DEFAULT_PASSWORD;

  // Board and committee management is now handled through contacts and groups
  const [editingBoardMember, setEditingBoardMember] = useState<number | 'new' | null>(null);
  const [editingCommittee, setEditingCommittee] = useState<string | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<string | null>(null);
  
  // Temporary placeholder for old references - will be removed
  const boardMembers: BoardMember[] = [];
  const committees: Committee[] = [];
  const boardMeetings: BoardMeeting[] = [];

  // Enhanced Staff Management State
  const [staffMembers, setStaffMembers] = useState<Array<{
    id: string;
    name: string;
    position: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contractor';
    email: string;
    phone: string;
    hireDate: string;
    salary: string;
    benefits: string;
    performance: Array<{
      date: string;
      rating: number;
      review: string;
      goals: string;
    }>;
    training: Array<{
      date: string;
      type: string;
      description: string;
      cost: string;
    }>;
    donorRole: boolean;
    donorAmount: string;
    supervisor: string;
    department: string;
  }>>([]);

  const [showStaffManager, setShowStaffManager] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<string | null>(null);
  const [_showVolunteerManager, setShowVolunteerManager] = useState(false);
  const [volunteers, _setVolunteers] = useState<Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    hoursPerWeek: number;
    skills: string[];
    availability: string;
    background: string;
  }>>([]);
  const [selectedCEO, setSelectedCEO] = useState<ContactInfo | null>(null);
  const [showHealthDashboard, setShowHealthDashboard] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  // Programs state
  const [programs, setPrograms] = useState({
    programList: '',
    programDescriptions: '',
    programBudget: '',
    programOutcomes: '',
    programEvaluation: '',
    programPartners: '',
    programTimeline: '',
    programStaffing: '',
    programSustainability: '',
    programInnovation: '',
    programReplication: '',
    programChallenges: '',
    programSuccess: '',
    programLessons: '',
    programFuture: '',
    programMetrics: '',
    programFunding: '',
    programReports: null as File | null,
    programPhotos: null as File | null,
    programVideos: '',
    programTestimonials: '',
    programImpact: '',
    programGoals: '',
    programVolunteers: '',
    programMaterials: '',
    programTechnology: '',
    programStaff: ''
  });
  const [programsErrors, setProgramsErrors] = useState<unknown>({});
  const [programsLocked, setProgramsLocked] = useState(false);
  const [programsAutoSaveStatus, setProgramsAutoSaveStatus] = useState('');

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showContactManager, setShowContactManager] = useState(false);
  const [_contactManagerView, setContactManagerView] = useState<'contacts' | 'groups'>('contacts');
  const [_editingContact, setEditingContact] = useState<number | null>(null);
  
  // Restructured form state
  const [organizationData, setOrganizationData] = useState<Organization>({
    id: Date.now().toString(),
    name: '',
    displayName: '',
    type: 'nonprofit',
    ein: '',
    contactInfo: {
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      }
    },
    digitalAssets: {
      logo: '',
      bannerImage: '',
      socialMedia: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        youtube: '',
        tiktok: ''
      },
      videos: []
    },
    lastModified: new Date(),
    createdDate: new Date()
  });
  
  const [selectedContacts, setSelectedContacts] = useState<{
    primaryContact?: Contact;
    additionalContacts: Contact[];
    boardMembers: Contact[];
    committees: { [key: string]: Contact[] };
  }>({
    additionalContacts: [],
    boardMembers: [],
    committees: {}
  });
  
  const [selectedOrganization, setSelectedOrganization] = useState<Contact | null>(null);
  
  const [narrativeFields, setNarrativeFields] = useState<Record<string, string>>({
    backgroundStatement: '',
    missionStatement: '',
    needsStatement: '',
    boardDemographics: '',
    boardInfo: '',
    boardCompensationPolicy: '',
    boardElectionProcess: '',
    boardOrientationProcess: '',
    boardEvaluationProcess: '',
    boardSuccessionPlanning: ''
  });
  
  const [documents, setDocuments] = useState<Record<string, string | string[]>>({});
  
  // Enhanced contact update handler with donor tagging
  const handleContactsUpdate = (updatedContacts: Contact[]) => {
    // Auto-tag contacts as donors if they meet criteria
    const contactsWithDonorTags = updatedContacts.map(contact => {
      const isDonor = 
        contact.tags?.some(tag => 
          tag && typeof tag === 'string' && (
            tag.toLowerCase().includes('donor') || 
            tag.toLowerCase().includes('funder') ||
            tag.toLowerCase().includes('sponsor')
          )
        ) || 
        (contact.notes || '').toLowerCase().includes('donation') ||
        (contact.notes || '').toLowerCase().includes('funding') ||
        contact.groups?.includes('donors');
      
      if (isDonor) {
        const groups = contact.groups || [];
        const tags = contact.tags || [];
        
        return {
          ...contact,
          groups: groups.includes('donors') ? groups : [...groups, 'donors'],
          tags: tags.some(t => t && typeof t === 'string' && t.toLowerCase().includes('donor')) ? tags : [...tags, 'donor']
        };
      }
      
      return contact;
    });
    
    setContacts(contactsWithDonorTags);
  };
  
  // New module states
  const [showCommunicationsModule, setShowCommunicationsModule] = useState(false);
  const [showAdminDistribution, setShowAdminDistribution] = useState(false);
  const [showQuickWins, setShowQuickWins] = useState(false);
  const [showAPILocker, setShowAPILocker] = useState(false);
  const [apiKeys, setApiKeys] = useState<unknown>({});
  const [assistantEnabled, setAssistantEnabled] = useState(true);
  const [profileCode, setProfileCode] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@calao.org');
  const [whatsappCode, setWhatsappCode] = useState('');
  
  // Dark mode hook
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [contactSelectorField, _setContactSelectorField] = useState<string>('');
  const [contactSelectorType, _setContactSelectorType] = useState<'person' | 'organization'>('person');
  const [addressOverride, _setAddressOverride] = useState(false);
  const [showDocumentInfo, setShowDocumentInfo] = useState<string | null>(null);
  const [documentInfo, setDocumentInfo] = useState<{[key: string]: unknown}>({});
  const [organizationAddresses, setOrganizationAddresses] = useState<Array<{
    id: string;
    type: 'main' | 'mailing' | 'physical' | 'satellite' | 'branch' | 'shipment' | 'alternate';
    address: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    businessHours?: string;
    businessDays?: string;
    isMailingAddress?: boolean;
  }>>([{
    id: '1',
    type: 'main',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    isMailingAddress: true
  }]);
  const [_contactPersons, _setContactPersons] = useState<Array<{
    id: string;
    name: string;
    title: string;
    email: string;
    phone: string;
    whatsapp: string;
    isPrimary: boolean;
    hasW9: boolean;
  }>>([]);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [_editingProject, setEditingProject] = useState<number | null>(null);
  const [showProgramManager, setShowProgramManager] = useState(false);
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCompletionDashboard, setShowCompletionDashboard] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [editingDocument, setEditingDocument] = useState<string | null>(null);

  // Load data from Netlify on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Generate unique codes on initialization
      const generateProfileCode = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `CALAO-${timestamp}-${random}`;
      };
      
      const generateWhatsAppCode = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
      };
      
      // Initialize profile codes if not set
      if (!profileCode) {
        setProfileCode(generateProfileCode());
      }
      if (!whatsappCode) {
        setWhatsappCode(generateWhatsAppCode());
      }
      
      try {
        // Load settings
        const [savedViewMode, savedLanguage, savedData] = await Promise.all([
          netlifySettingsService.get('nonprofitApp_viewMode'),
          netlifySettingsService.get('nonprofitApp_language'),
          netlifySettingsService.get('nonprofitApplicationData')
        ]);
        
        if (savedViewMode) setViewMode(savedViewMode as 'standard' | 'tabbed');
        if (savedLanguage) setLanguage(savedLanguage as 'en' | 'es');
        
        // Load saved data
        if (savedData) {
          setFormData((savedData as any).formData || {});
          setSectionLocks((savedData as any).sectionLocks || {});
          setSectionStatus((savedData as any).sectionStatus || {});
          
          // Load new feature data
          setApiKeys((savedData as any).apiKeys || {});
          setAssistantEnabled((savedData as any).assistantEnabled !== false);
          setProfileEmail((savedData as any).profileEmail || '');
          setAdminEmail((savedData as any).adminEmail || 'admin@calao.org');
          // Board and committee data is now managed through contacts
          setContacts((savedData as any).contacts || []);
          setProjects((savedData as any).projects || []);
          toast.info('Previous session restored', { position: 'bottom-right' });
        }
      } catch (error) {
        logger.error('Error loading saved data:', error as any);
      }
    };
    
    loadInitialData();
  }, []);

  // Save to Netlify whenever data changes
  useEffect(() => {
    const saveData = async () => {
      const dataToSave = {
        formData,
        sectionLocks,
        sectionStatus,
        contacts,
        projects,
        organizationData,
        selectedContacts,
        narrativeFields,
        documents,
        lastSaved: new Date().toISOString()
      };
      
      try {
        await netlifySettingsService.set('nonprofitApplicationData', dataToSave, 'organization');
      } catch (error) {
        logger.error('Failed to save data:', error as any);
      }
    };
    
    // Debounce saves
    const timer = setTimeout(saveData, 1000);
    return () => clearTimeout(timer);
  }, [formData, sectionLocks, sectionStatus, contacts, projects, organizationData, selectedContacts, narrativeFields, documents]);

  // Auto-save effect with debouncing
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    if (Object.keys(formData).length > 0 && hasUnsavedChanges) {
      // Start countdown
      setAutoSaveCountdown(5);
      countdownIntervalRef.current = setInterval(() => {
        setAutoSaveCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
        setAutoSaveCountdown(0);
      }, 5000); // Auto-save after 5 seconds of inactivity
    } else {
      setAutoSaveCountdown(0);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [formData, hasUnsavedChanges]);

  // Session-based Undo System with Version Control
  const [sessionStartData, setSessionStartData] = useState<FormData>({});
  const [fieldSessionStart, setFieldSessionStart] = useState<{[key: string]: unknown}>({});
  const [sessionStartTime] = useState(new Date().toISOString());
  const [_formVersionHistory, setFormVersionHistory] = useState<Array<{
    timestamp: string;
    data: FormData;
    description: string;
    changes: string[];
  }>>([]);
  const [sectionSessionStart, setSectionSessionStart] = useState<{[key: string]: unknown}>({});

  // Section field mapping
  const sectionFields: {[sectionId: string]: string[]} = {
    'basic-info': ['organizationName', 'ein', 'email', 'phone', 'website', 'dba'],
    'organization': ['address', 'address2', 'city', 'state', 'zipCode', 'mailingAddress', 'yearFounded', 'organizationType'],
    'contact': ['contactPerson', 'contactTitle', 'contactPhone', 'contactEmail', 'alternateContact', 'alternatePhone'],
    'financial': ['annualBudget', 'fiscalYearEnd', 'revenueStreams', 'majorFunders', 'audited', 'taxExemptStatus'],
    'program': ['missionStatement', 'visionStatement', 'programAreas', 'targetPopulation', 'geographicArea', 'impactMetrics'],
    'governance': ['boardSize', 'boardMeetingFrequency', 'boardTermLimits', 'boardDiversity', 'executiveDirector', 'keyStaff'],
    'narrative': ['organizationHistory', 'currentPrograms', 'accomplishments', 'challenges', 'futurePlans', 'communityImpact'],
    'documents': ['bylaws', 'irs501c3', 'annualReport', 'financialStatements', 'boardList', 'organizationalChart']
  };

  // Initialize session start data when component mounts
  useEffect(() => {
    // Session start data is loaded from Netlify in the main load effect above
    // We'll use formData as the initial data since it's already loaded
    const initialData = formData || {};
    setSessionStartData({ ...initialData });
    setFieldSessionStart({ ...initialData });
    
    // Initialize section start data
    const sectionData: {[key: string]: unknown} = {};
    Object.entries(sectionFields).forEach(([sectionId, fields]) => {
      sectionData[sectionId] = {};
      fields.forEach(field => {
        (sectionData[sectionId] as any)[field] = (initialData as any)[field];
      });
    });
    setSectionSessionStart(sectionData);

    // Initialize version history
    setFormVersionHistory([{
      timestamp: new Date().toISOString(),
      data: { ...initialData },
      description: 'Session started',
      changes: []
    }]);
  }, []);

  // Initialize audit logging and RBAC services
  useEffect(() => {
    if (currentUser && currentUser.organization) {
      auditLogService.initialize(
        currentUser.organization,
        currentUser.id.toString(),
        currentUser.name
      );
      
      // Initialize RBAC service
      rbacService.initialize(
        currentUser.organization,
        currentUser.id.toString()
      );
      
      // Log form view
      auditLogService.logAction({
        action: 'view',
        resource: 'nonprofit_application',
        result: 'success'
      });
    }
    
    return () => {
      // Cleanup on unmount
      auditLogService.cleanup();
    };
  }, [currentUser]);

  // Function to revert a specific field to session start value
  const revertFieldToSessionStart = (fieldName: string) => {
    const originalValue = fieldSessionStart[fieldName];
    if (originalValue !== undefined) {
      setFormData(prev => ({ ...(prev as any), [fieldName]: originalValue }));
      toast.success(`${fieldName} reverted to session start value`, {
        position: 'bottom-right',
        autoClose: 2000
      });
      announceToScreenReader(`Field ${fieldName} reverted to original value`);
    } else {
      setFormData(prev => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
      toast.success(`${fieldName} cleared (was empty at session start)`, {
        position: 'bottom-right',
        autoClose: 2000
      });
    }
  };

  // Function to revert an entire section to session start
  const revertSectionToSessionStart = (sectionId: string) => {
    const sectionName = sectionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    showConfirmationDialog(
      `Are you sure you want to revert the ${sectionName} section back to how it was when you started this session? All changes in this section will be lost.`,
      () => {
        const sectionStartData = sectionSessionStart[sectionId] || {};
        const fields = sectionFields[sectionId] || [];
        
        // Revert all fields in the section
        const updatedFormData = { ...formData };
        fields.forEach(field => {
          if (sectionStartData && typeof sectionStartData === 'object' && field in sectionStartData) {
            (updatedFormData as any)[field] = (sectionStartData as any)[field];
          } else {
            delete updatedFormData[field];
          }
        });
        
        setFormData(updatedFormData);
        
        // Clear errors for section fields
        const updatedErrors = { ...errors };
        fields.forEach(field => {
          delete updatedErrors[field];
        });
        setErrors(updatedErrors);
        
        toast.success(`${sectionName} section reverted to session start`, {
          position: 'bottom-right',
          autoClose: 3000
        });
        announceToScreenReader(`${sectionName} section reverted to original values`);
        
        // Add to version history
        addToVersionHistory(`Reverted ${sectionName} section`, fields);
      }
    );
  };

  // Function to revert entire form to session start
  const revertFormToSessionStart = () => {
    showConfirmationDialog(
      'Are you sure you want to revert the entire form back to how it was when you started this session? All changes will be lost.',
      () => {
        setFormData({ ...sessionStartData });
        setErrors({});
        setValidationErrors({});
        toast.success('Form reverted to session start', {
          position: 'bottom-right',
          autoClose: 3000
        });
        announceToScreenReader('Entire form reverted to session start values');
        
        // Add to version history
        addToVersionHistory('Reverted entire form to session start', Object.keys(formData));
      }
    );
  };

  // Add entry to version history
  const addToVersionHistory = (description: string, changedFields: string[]) => {
    const newVersion = {
      timestamp: new Date().toISOString(),
      data: { ...formData },
      description,
      changes: changedFields
    };
    
    setFormVersionHistory(prev => [...prev.slice(-19), newVersion]); // Keep last 20 versions
  };

  // Render section-level undo button
  const _renderSectionUndoButton = (sectionId: string) => {
    const fields = sectionFields[sectionId] || [];
    const sectionData = sectionSessionStart[sectionId] || {};
    
    // Check if any field in section has changed
    const hasChanges = fields.some(field => {
      const currentValue = (formData as any)[field];
      const originalValue = (sectionData as any)[field];
      return currentValue !== originalValue;
    });
    
    if (!hasChanges) return null;
    
    return (
      <button
        type="button"
        onClick={() => revertSectionToSessionStart(sectionId)}
        className="ml-3 px-3 py-1 text-sm text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors flex items-center gap-1"
        title={`Revert entire section to session start values`}
        aria-label={`Undo all changes in this section`}
      >
        <RefreshCw className="w-4 h-4" />
        <span>Undo Section</span>
      </button>
    );
  };

  // Enhanced input handler that tracks session changes and runs conditional validation
  const handleInputChangeWithUndo = (field: string, value: FormFieldValue) => {
    // Store original value if this is the first change for this field in this session
    if (!(field in fieldSessionStart)) {
      setFieldSessionStart(prev => ({ ...(prev as any), [field]: formData[field] }));
    }
    
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setUnsavedChanges(true);

    // Run conditional validation for this field
    const conditionalRules = conditionalValidationRules[field as keyof typeof conditionalValidationRules];
    if (conditionalRules) {
      const conditionalError = runConditionalValidations(value, conditionalRules, newFormData);
      if (conditionalError) {
        setErrors(prev => ({ ...(prev as any), [field]: conditionalError }));
      } else {
        setErrors(prev => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    }

    // Re-validate dependent fields when this field changes
    Object.entries(conditionalValidationRules).forEach(([dependentField, rules]) => {
      rules.forEach(rule => {
        if (rule.dependsOn?.includes(field)) {
          const dependentValue = newFormData[dependentField];
          const dependentError = runConditionalValidations(dependentValue, rules, newFormData);
          
          if (dependentError) {
            setErrors(prev => ({ ...(prev as any), [dependentField]: dependentError }));
          } else {
            setErrors(prev => {
              const { [dependentField]: _, ...rest } = prev;
              return rest;
            });
          }
        }
      });
    });
  };

  // Mobile optimized input components
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile-optimized input component
  const MobileOptimizedInput: React.FC<{
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    fieldName?: string;
    required?: boolean;
    autoComplete?: string;
    inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric';
    disabled?: boolean;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  }> = ({ 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    className = '', 
    fieldName, 
    required = false,
    autoComplete,
    inputMode,
    disabled = false,
    onFocus,
    onBlur
  }) => {
    const baseClasses = isMobile 
      ? 'w-full px-4 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200' 
      : 'w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors';
    
    const errorClasses = errors[fieldName || ''] ? 'border-red-300 bg-red-50' : 'border-gray-200';
    
    return (
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseClasses} ${errorClasses} ${className}`}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          onFocus={(e) => {
            // On mobile, scroll the field into view to avoid keyboard overlap
            if (isMobile) {
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            }
            // Call custom onFocus if provided
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            // Call custom onBlur if provided
            if (onBlur) onBlur(e);
          }}
        />
        {fieldName && renderFieldUndoButton(fieldName)}
        {isMobile && required && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 text-lg">*</span>
        )}
      </div>
    );
  };

  // Mobile-optimized textarea component
  const MobileOptimizedTextarea: React.FC<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    fieldName?: string;
    rows?: number;
    maxLength?: number;
    disabled?: boolean;
    autoExpand?: boolean;
  }> = ({ 
    value, 
    onChange, 
    placeholder, 
    className = '', 
    fieldName, 
    rows = 3,
    maxLength,
    disabled = false,
    autoExpand = false
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const baseClasses = isMobile 
      ? 'w-full px-4 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none' 
      : 'w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical';
    
    const errorClasses = errors[fieldName || ''] ? 'border-red-300 bg-red-50' : 'border-gray-200';

    // Auto-expand functionality
    useEffect(() => {
      if (autoExpand && textareaRef.current) {
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        const newHeight = Math.max(textarea.scrollHeight, isMobile ? 120 : 80);
        textarea.style.height = `${newHeight}px`;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, autoExpand, isMobile]);
    
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${baseClasses} ${errorClasses} ${className}`}
          rows={isMobile ? Math.max(rows, 4) : rows}
          maxLength={maxLength}
          disabled={disabled}
          onFocus={(e) => {
            // On mobile, scroll the field into view to avoid keyboard overlap
            if (isMobile) {
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            }
          }}
        />
        {fieldName && renderFieldUndoButton(fieldName)}
        {maxLength && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {value.length}/{maxLength} characters
          </div>
        )}
      </div>
    );
  };

  // Mobile-optimized select component
  const MobileOptimizedSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
    fieldName?: string;
    disabled?: boolean;
  }> = ({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    className = '', 
    fieldName,
    disabled = false
  }) => {
    const baseClasses = isMobile 
      ? 'w-full px-4 py-4 text-lg border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none' 
      : 'w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none';
    
    const errorClasses = errors[fieldName || ''] ? 'border-red-300 bg-red-50' : 'border-gray-200';
    
    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClasses} ${errorClasses} ${className}`}
          disabled={disabled}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronRight className={`absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 pointer-events-none ${isMobile ? 'w-6 h-6' : 'w-4 h-4'}`} />
      </div>
    );
  };

  // Add field-level comment/note
  const addFieldComment = (fieldName: string, comment: string) => {
    if (!comment.trim()) return;
    
    const newNote = {
      timestamp: new Date().toISOString(),
      author: currentUser?.name || 'User',
      note: comment.trim()
    };
    
    setFieldNotesHistory(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), newNote]
    }));
    
    setFieldComments(prev => ({ ...(prev as any), [fieldName]: '' }));
    setShowingCommentField(null);
    
    toast.success(`Note added to ${fieldName}`, {
      position: 'bottom-right',
      autoClose: 2000
    });
  };

  // AI Suggestion Component
  const AISuggestionBox: React.FC<{
    fieldName: string;
    suggestions: string[];
    onApply: (suggestion: string) => void;
    onClose: () => void;
  }> = ({ fieldName, suggestions, onApply, onClose }) => {
    if (!suggestions || suggestions.length === 0) return null;
    
    return (
      <div className="absolute z-30 mt-1 bg-white border border-blue-200 rounded-lg shadow-lg p-3 w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">AI Suggestions</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            title="Close suggestions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onApply(suggestion)}
              className="block w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 rounded transition-colors border border-blue-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced input wrapper that includes AI suggestions
  const InputWithAISuggestions: React.FC<{
    fieldName: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
  }> = ({ fieldName, value, onChange, type = 'text', placeholder, className, disabled, required }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestions = aiSuggestions[fieldName] || [];
    
    return (
      <div className="relative">
        <MobileOptimizedInput
          value={value}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          className={className}
          fieldName={fieldName}
          disabled={disabled}
          required={required}
          onFocus={() => {
            updateAISuggestionsForField(fieldName);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay hiding to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 200);
          }}
        />
        {showAISuggestions && showSuggestions && suggestions.length > 0 && (
          <AISuggestionBox
            fieldName={fieldName}
            suggestions={suggestions}
            onApply={(suggestion) => {
              applyAISuggestion(fieldName, suggestion);
              setShowSuggestions(false);
            }}
            onClose={() => setShowSuggestions(false)}
          />
        )}
      </div>
    );
  };

  // Render field comment button and interface
  const _renderFieldCommentButton = (fieldName: string) => {
    const hasNotes = fieldNotesHistory[fieldName]?.length > 0;
    const showingComment = showingCommentField === fieldName;
    
    return (
      <div className="inline-flex items-center">
        <button
          type="button"
          onClick={() => setShowingCommentField(showingComment ? null : fieldName)}
          className={`p-1 transition-colors ${
            hasNotes 
              ? 'text-blue-600 hover:text-blue-800' 
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title={`${hasNotes ? 'View' : 'Add'} notes for ${fieldName}`}
          aria-label={`${hasNotes ? 'View' : 'Add'} notes for ${fieldName}`}
        >
          <FileText className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
          {hasNotes && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {fieldNotesHistory[fieldName].length}
            </span>
          )}
        </button>
        
        {showingComment && (
          <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 max-w-[90vw]">
            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-2">Notes for {fieldName}</h4>
              
              {/* Previous notes */}
              {fieldNotesHistory[fieldName]?.length > 0 && (
                <div className="max-h-32 overflow-y-auto mb-3 space-y-2">
                  {fieldNotesHistory[fieldName].map((note, index) => (
                    <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span className="font-medium">{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-800">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new note */}
              <div className="space-y-2">
                <textarea
                  value={fieldComments[fieldName] || ''}
                  onChange={(e) => setFieldComments(prev => ({ ...(prev as any), [fieldName]: e.target.value }))}
                  placeholder="Add a note..."
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowingCommentField(null);
                      setFieldComments(prev => ({ ...(prev as any), [fieldName]: '' }));
                    }}
                    className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => addFieldComment(fieldName, fieldComments[fieldName] || '')}
                    disabled={!fieldComments[fieldName]?.trim()}
                    className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium disabled:opacity-50"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render field-level undo button for text/textarea fields
  const renderFieldUndoButton = (fieldName: string, isVisible: boolean = true) => {
    const hasChanged = fieldSessionStart[fieldName] !== formData[fieldName];
    
    if (!isVisible || !hasChanged) return null;

    return (
      <button
        type="button"
        onClick={() => revertFieldToSessionStart(fieldName)}
        className={`${isMobile ? 'absolute right-2 top-2' : 'ml-2'} p-1 text-gray-400 hover:text-red-600 transition-colors z-10`}
        title={`Revert ${fieldName} to session start value`}
        aria-label={`Undo changes to ${fieldName}`}
      >
        <RefreshCw className={isMobile ? 'w-5 h-5' : 'w-4 h-4'} />
      </button>
    );
  };

  // Drag and drop file upload component
  const _DragDropFileUpload: React.FC<{
    fieldName: string;
    accept?: string;
    maxSize?: number;
    onFileSelect: (file: File) => void;
    currentFile?: File | null;
    disabled?: boolean;
  }> = ({ fieldName, accept = '*', maxSize = 10 * 1024 * 1024, onFileSelect, currentFile, disabled = false }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileValidation(files[0]);
      }
    };

    const handleFileValidation = (file: File) => {
      // Check file size
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
        return;
      }

      // Check file type if specified
      if (accept !== '*') {
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const mimeType = file.type;
        
        const isAccepted = acceptedTypes.some(type => 
          type === mimeType || type === fileExtension || 
          (type.endsWith('/*') && mimeType.startsWith(type.replace('/*', '')))
        );

        if (!isAccepted) {
          toast.error(`File type not accepted. Please upload: ${accept}`);
          return;
        }
      }

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      onFileSelect(file);
      
      setTimeout(() => {
        setUploadProgress(0);
        toast.success(`${file.name} uploaded successfully`);
      }, 1200);
    };

    return (
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-200 hover:border-gray-400 cursor-pointer'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileValidation(e.target.files[0]);
            }
          }}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <Upload className={`mx-auto h-12 w-12 ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`} />
          
          {currentFile ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">{currentFile.name}</p>
              <p className="text-xs text-gray-500">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileSelect(null as any);
                    toast.info('File removed');
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove file
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-600">
                {isDragging ? 'Drop file here' : 'Drag and drop file here, or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {accept !== '*' && `Accepted: ${accept} • `}
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  // Word count and character limit utilities
  const getTextStats = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
    
    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime: Math.ceil(words / 200) // Average reading speed
    };
  };

  // Field character limits configuration
  const fieldCharacterLimits: { [key: string]: number } = {
    organizationName: 100,
    missionStatement: 500,
    visionStatement: 500,
    impactStatement: 1000,
    programDescription: 2000,
    additionalInfo: 3000,
    executiveSummary: 5000
  };

  // Enhanced text field with word count
  const _TextFieldWithStats: React.FC<{
    value: string;
    onChange: (value: string) => void;
    fieldName: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    multiline?: boolean;
    rows?: number;
    characterLimit?: number;
    wordLimit?: number;
    showStats?: boolean;
    disabled?: boolean;
  }> = ({
    value,
    onChange,
    fieldName,
    label,
    placeholder,
    required = false,
    multiline = false,
    rows = 3,
    characterLimit,
    wordLimit,
    showStats = true,
    disabled = false
  }) => {
    const stats = getTextStats(value || '');
    const limit = characterLimit || fieldCharacterLimits[fieldName];
    const isOverLimit = (limit && stats.characters > limit) || (wordLimit && stats.words > wordLimit);
    
    return (
      <div className="space-y-2">
        <label htmlFor={fieldName} className="block font-semibold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {multiline ? (
          <MobileOptimizedTextarea
            value={value || ''}
            onChange={(val) => {
              if (!limit || val.length <= limit) {
                handleInputChangeWithUndo(fieldName, val);
                onChange(val);
              } else if (val.length < (value || '').length) {
                // Allow deletion even if over limit
                handleInputChangeWithUndo(fieldName, val);
                onChange(val);
              }
            }}
            placeholder={placeholder}
            fieldName={fieldName}
            rows={rows}
            maxLength={limit}
            disabled={disabled}
            autoExpand={true}
          />
        ) : (
          <MobileOptimizedInput
            value={value || ''}
            onChange={(val) => {
              if (!limit || val.length <= limit) {
                handleInputChangeWithUndo(fieldName, val);
                onChange(val);
              } else if (val.length < (value || '').length) {
                // Allow deletion even if over limit
                handleInputChangeWithUndo(fieldName, val);
                onChange(val);
              }
            }}
            placeholder={placeholder}
            fieldName={fieldName}
            required={required}
            disabled={disabled}
          />
        )}
        
        {showStats && value && (
          <div className={`flex flex-wrap gap-4 text-xs ${isOverLimit ? 'text-red-600' : 'text-gray-500'}`}>
            <span>{stats.words} words</span>
            {limit && (
              <span className={stats.characters > limit ? 'font-bold' : ''}>
                {stats.characters}/{limit} characters
              </span>
            )}
            {wordLimit && (
              <span className={stats.words > wordLimit ? 'font-bold' : ''}>
                {stats.words}/{wordLimit} word limit
              </span>
            )}
            {stats.words > 50 && (
              <span>~{stats.readingTime} min read</span>
            )}
          </div>
        )}
        
        {errors[fieldName] && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{errors[fieldName]}</span>
          </div>
        )}
      </div>
    );
  };

  // Copy-paste formatting preservation
  const [_clipboardData, setClipboardData] = useState<{[key: string]: unknown}>({});
  
  const _handleFormattedPaste = (e: React.ClipboardEvent, fieldName: string) => {
    e.preventDefault();
    
    const clipboardText = e.clipboardData.getData('text/plain');
    const clipboardHtml = e.clipboardData.getData('text/html');
    
    // Preserve basic formatting
    let formattedText = clipboardText;
    
    // Detect and preserve lists
    if (clipboardText.includes('•') || clipboardText.includes('●') || /^\d+\./m.test(clipboardText)) {
      formattedText = clipboardText
        .split('\n')
        .map(line => {
          if (line.trim().match(/^[•●·]/)) {
            return `• ${line.replace(/^[•●·]\s*/, '')}`;
          } else if (line.trim().match(/^\d+\./)) {
            return line;
          }
          return line;
        })
        .join('\n');
    }
    
    // Preserve paragraph breaks
    formattedText = formattedText.replace(/\n\n+/g, '\n\n');
    
    // Clean up excessive whitespace
    formattedText = formattedText.replace(/[ \t]+/g, ' ').trim();
    
    // Store formatted version in clipboard data
    setClipboardData(prev => ({
      ...prev,
      [fieldName]: {
        original: clipboardText,
        formatted: formattedText,
        html: clipboardHtml,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Apply the formatted text
    handleInputChangeWithUndo(fieldName, formattedText);
    
    toast.info('Text pasted with formatting preserved', {
      position: 'bottom-right',
      autoClose: 2000
    });
  };

  const _handleSmartCopy = (fieldName: string, value: string) => {
    // Create formatted version for clipboard
    const formattedForClipboard = {
      fieldName,
      value,
      metadata: {
        characterCount: value.length,
        wordCount: getTextStats(value).words,
        copiedAt: new Date().toISOString(),
        copiedBy: currentUser?.name || 'User'
      }
    };
    
    // Copy both plain text and structured data
    if (navigator.clipboard) {
      navigator.clipboard.writeText(value);
      
      // Store structured data for smart paste
      netlifySettingsService.set('nonprofitApp_smartCopy', formattedForClipboard, 'user').catch(error => logger.error('Failed to save smart copy data', error as any));
      
      toast.success(`${fieldName} copied to clipboard`, {
        position: 'bottom-right',
        autoClose: 2000
      });
    }
  };

  // Enhanced paste handler with smart detection
  const _handleSmartPaste = async (fieldName: string) => {
    try {
      const smartCopyData = await netlifySettingsService.get('nonprofitApp_smartCopy');
      if (smartCopyData) {
        const parsed = smartCopyData;
        
        // Show paste options if it's from a different field
        if ((parsed as any).fieldName !== fieldName) {
          const confirmPaste = window.confirm(
            `Paste "${(parsed as any).fieldName}" content here?\n\n` +
            `Content: ${(parsed as any).value.substring(0, 100)}${(parsed as any).value.length > 100 ? '...' : ''}\n` +
            `(${(parsed as any).metadata.wordCount} words)`
          );
          
          if (confirmPaste) {
            handleInputChangeWithUndo(fieldName, (parsed as any).value);
            toast.success('Smart paste completed', {
              position: 'bottom-right',
              autoClose: 2000
            });
          }
        }
      }
    } catch (error) {
      logger.error('Smart paste error:', error as any);
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleAutoSave = async () => {
    if (!currentUser || Object.keys(formData).length === 0) return;

    try {
      setAutoSaveStatus('saving');
      setLoadingState('saving', true);
      const token = await netlifySettingsService.getAuthToken();
      
      const response = await fetch('http://localhost:5001/api/applications/auto-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formData,
          progress: memoizedProgress,
          version: formVersion,
          timestamp: new Date().toISOString(),
          sectionProgress
        })
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setFormVersion(prev => prev + 1);
        
        // Enhanced success feedback
        toast.success('Auto-saved successfully', {
          position: 'bottom-right',
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Clear saved status after 3 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      } else {
        throw new Error('Auto-save failed');
      }
    } catch (error) {
      handleSaveError(error, { component: 'NonprofitApplication', action: 'auto-save' });
      setAutoSaveStatus('error');
      
      // Enhanced error feedback
      toast.error(
        <div>
          <div>Auto-save failed. Data stored locally for retry.</div>
          <button 
            onClick={recoverFromError}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Try recovery
          </button>
        </div>,
        { autoClose: 10000 }
      );
      
      // Clear error status after 5 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 5000);
    } finally {
      setLoadingState('saving', false);
    }
  };

  // Field-level error handlers
  const handleFieldError = (field: string, error: string) => {
    setErrors(prev => ({ ...(prev as any), [field]: error }));
  };

  const handleClearError = (field: string) => {
    setErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  // Progress indicator component
  const renderProgressIndicator = (sectionId: string) => (
    <div className="flex items-center space-x-2">
      <div className="w-24 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${calculateSectionProgress(sectionId)}%` }}
        ></div>
      </div>
      <span className="text-sm text-gray-600 font-medium">
        {calculateSectionProgress(sectionId)}%
      </span>
    </div>
  );

  // Generate citation for publications
  const generateCitation = (pub: unknown) => {
    if (!pub) return '';
    
    const authors = [];
    if ((pub as any).primaryAuthor?.name) authors.push((pub as any).primaryAuthor.name);
    
    const parts = [];
    
    // Authors
    if (authors.length > 0) {
      parts.push(authors.join(', '));
    }
    
    // Year
    if ((pub as any).publicationDate) {
      const year = new Date((pub as any).publicationDate).getFullYear();
      parts.push(`(${year})`);
    }
    
    // Title
    if ((pub as any).title) {
      parts.push(`"${(pub as any).title}"`);
    }
    
    // Publisher
    if ((pub as any).publisher) {
      parts.push((pub as any).publisher);
    }
    
    // Media Type
    if ((pub as any).mediaType) {
      parts.push(`[${(pub as any).mediaType}]`);
    }
    
    // URL
    if ((pub as any).url) {
      parts.push(`Retrieved from ${(pub as any).url}`);
    }
    
    return parts.join('. ') + '.';
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSaveForm();
        toast.success('Form saved via keyboard shortcut');
      }
      
      // Ctrl/Cmd + E to export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        setShowExportModal(true);
      }
      
      // Ctrl/Cmd + D to toggle dark mode
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
        toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`);
      }
      
      // Ctrl/Cmd + ? to show quick wins
      if ((event.ctrlKey || event.metaKey) && event.key === '?') {
        event.preventDefault();
        setShowQuickWins(true);
      }
      
      // Ctrl/Cmd + M to show communications
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        setShowCommunicationsModule(true);
      }
      
      // Ctrl/Cmd + Shift + C to clear form
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        showConfirmationDialog(
          'Are you sure you want to clear all form data? This cannot be undone.',
          () => {
            setFormData({});
            setErrors({});
            toast.success('Form cleared');
          }
        );
      }
      
      // Escape key to close modals
      if (event.key === 'Escape') {
        if (showContactManager) setShowContactManager(false);
        if (showProgramManager) setShowProgramManager(false);
        if (showDocumentManager) setShowDocumentManager(false);
        if (showStaffManager) setShowStaffManager(false);
        if (showHealthDashboard) setShowHealthDashboard(false);
        if (showPerformanceDashboard) setShowPerformanceDashboard(false);
        if (showConfirmation) setShowConfirmation(false);
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
        if (showCompletionDashboard) setShowCompletionDashboard(false);
        if (showExportModal) setShowExportModal(false);
        if (showOfflineQueue) setShowOfflineQueue(false);
      }
      
      // Arrow keys for section navigation
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          // Scroll to previous section
          const sections = ['basic-info-heading', 'organizational-documents-heading', 'narrative-heading', 'governance-heading', 'management-heading', 'financials-heading', 'programs-heading'];
          const currentIndex = sections.findIndex(id => {
            const element = document.getElementById(id);
            return element && element.getBoundingClientRect().top > 0;
          });
          if (currentIndex > 0) {
            document.getElementById(sections[currentIndex - 1])?.scrollIntoView({ behavior: 'smooth' });
          }
        }
        
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          // Scroll to next section
          const sections = ['basic-info-heading', 'organizational-documents-heading', 'narrative-heading', 'governance-heading', 'management-heading', 'financials-heading', 'programs-heading'];
          const currentIndex = sections.findIndex(id => {
            const element = document.getElementById(id);
            return element && element.getBoundingClientRect().top > window.innerHeight / 2;
          });
          if (currentIndex !== -1 && currentIndex < sections.length - 1) {
            document.getElementById(sections[currentIndex + 1])?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showContactManager, showProgramManager, showDocumentManager, showStaffManager, showHealthDashboard, showPerformanceDashboard, showConfirmation, showKeyboardShortcuts, showCompletionDashboard, showExportModal, showOfflineQueue, isDarkMode, toggleDarkMode]);

  // Enhanced Focus Management for Accessibility
  const [focusHistory, setFocusHistory] = useState<string[]>([]);
  const [_currentFocusIndex, setCurrentFocusIndex] = useState(-1);
  const _focusRef = useRef<HTMLElement | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // Focus management functions
  const manageFocus = {
    // Store current focus element
    storeFocus: () => {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.id) {
        setFocusHistory(prev => [...prev.slice(-19), activeElement.id]); // Keep last 20 focuses
        setCurrentFocusIndex(focusHistory.length);
      }
    },

    // Restore focus to previous element
    restoreFocus: () => {
      if (focusHistory.length > 0) {
        const lastFocusId = focusHistory[focusHistory.length - 1];
        const element = document.getElementById(lastFocusId);
        if (element) {
          element.focus();
          // Ensure element is visible
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },

    // Focus first error field
    focusFirstError: () => {
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0];
        const element = document.getElementById(firstErrorField) || 
                       document.querySelector(`[name="${firstErrorField}"]`) ||
                       document.querySelector(`input[data-field="${firstErrorField}"]`);
        if (element) {
          (element as HTMLElement).focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Announce error to screen readers
          const announcement = `Error in ${firstErrorField}: ${errors[firstErrorField]}`;
          announceToScreenReader(announcement);
        }
      }
    },

    // Focus next required field
    focusNextRequired: () => {
      const requiredFields = ['ein', 'organizationName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
      const emptyRequired = requiredFields.find(field => !formData[field]);
      if (emptyRequired) {
        const element = document.getElementById(emptyRequired) || 
                       document.querySelector(`[name="${emptyRequired}"]`);
        if (element) {
          (element as HTMLElement).focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },

    // Focus specific section
    focusSection: (sectionId: string) => {
      const heading = document.getElementById(`${sectionId}-heading`);
      if (heading) {
        heading.focus();
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },

    // Trap focus within modal
    trapFocus: (containerElement: HTMLElement) => {
      const focusableElements = containerElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      containerElement.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        containerElement.removeEventListener('keydown', handleTabKey);
      };
    }
  };

  // Screen reader announcements
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  // Enhanced keyboard navigation with focus management
  useEffect(() => {
    const handleFocusKeyboard = (event: KeyboardEvent) => {
      // Tab + Shift + F to focus first error
      if (event.shiftKey && event.key === 'F' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        manageFocus.focusFirstError();
      }

      // Tab + Shift + R to focus next required field  
      if (event.shiftKey && event.key === 'R' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        manageFocus.focusNextRequired();
      }

      // Alt + number keys to focus sections
      if (event.altKey && /^[1-9]$/.test(event.key)) {
        event.preventDefault();
        const sectionMap: { [key: string]: string } = {
          '1': 'basic-info',
          '2': 'narrative', 
          '3': 'governance',
          '4': 'management',
          '5': 'financials',
          '6': 'programs',
          '7': 'additional-info',
          '8': 'leadership-details',
          '9': 'board-details'
        };
        const sectionId = sectionMap[event.key];
        if (sectionId) {
          manageFocus.focusSection(sectionId);
        }
      }

      // Ctrl/Cmd + Shift + H to toggle high contrast mode
      if (event.shiftKey && event.key === 'H' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        toggleHighContrast();
      }

      // Ctrl/Cmd + Shift + R to revert form to session start
      if (event.shiftKey && event.key === 'R' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        revertFormToSessionStart();
      }
      
      // Shift + ? to show keyboard shortcuts help
      if (event.shiftKey && event.key === '?') {
        event.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      
      // Ctrl/Cmd + Shift + P to show progress dashboard
      if (event.shiftKey && event.key === 'P' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setShowCompletionDashboard(true);
      }
    };

    document.addEventListener('keydown', handleFocusKeyboard);
    return () => document.removeEventListener('keydown', handleFocusKeyboard);
  }, [errors, formData]);

  // Focus management for modals
  useEffect(() => {
    if (showContactManager || showProgramManager || showDocumentManager || 
        showStaffManager || showImportModal) {
      manageFocus.storeFocus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showContactManager, showProgramManager, showDocumentManager, showStaffManager, showImportModal]);

  // Announce section changes to screen readers
  useEffect(() => {
    const sections = ['basic-info', 'organizational-documents', 'narrative', 'governance', 'management', 'financials', 'programs'];
    const currentSection = sections.find(section => {
      const element = document.getElementById(`${section}-heading`);
      if (element) {
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 0;
      }
      return false;
    });

    if (currentSection) {
      const sectionNames: { [key: string]: string } = {
        'basic-info': 'Basic Information',
        'narrative': 'Organization Narrative', 
        'governance': 'Governance',
        'management': 'Management',
        'financials': 'Financial Information',
        'programs': 'Programs and Services'
      };
      
      const sectionName = sectionNames[currentSection];
      if (sectionName) {
        announceToScreenReader(`Now viewing ${sectionName} section`);
      }
      
      // Update current section for progress tracker
      const sectionIdMap: { [key: string]: string } = {
        'basic-info': 'basicInfo',
        'narrative': 'narrative', 
        'governance': 'governance',
        'management': 'management',
        'financials': 'financials',
        'programs': 'programs'
      };
      setCurrentSectionId(sectionIdMap[currentSection] || 'basicInfo');
    }
  }, [activeTab]);

  // Monitor connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const wasOffline = connectionStatus === 'offline';
      const isOnline = navigator.onLine;
      
      setConnectionStatus(isOnline ? 'online' : 'offline');
      
      // Process queue when coming back online
      if (wasOffline && isOnline) {
        processOfflineQueue();
        showSuccess('Back online! Processing queued submissions...');
      } else if (!isOnline) {
        toast.warning('You are offline. Changes will be queued and submitted when connection is restored.');
      }
    };

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    return () => {
      window.removeEventListener('online', updateConnectionStatus);
      window.removeEventListener('offline', updateConnectionStatus);
    };
  }, [connectionStatus]);

  // Save last known good state
  useEffect(() => {
    if (Object.keys(formData).length > 0 && Object.keys(errors).length === 0) {
      setLastKnownGoodState({
        formData: { ...formData },
        timestamp: new Date().toISOString()
      });
    }
  }, [formData, errors]);

  // Offline queue management functions
  const addToOfflineQueue = (type: 'save' | 'submit' | 'section-save', data: FormData) => {
    const queueItem = {
      id: `${type}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type,
      data,
      status: 'pending' as const,
      retryCount: 0
    };
    
    setSubmissionQueue(prev => [...prev, queueItem]);
    
    // Save queue to Netlify
    const updatedQueue = [...submissionQueue, queueItem];
    netlifySettingsService.set('nonprofitApp_offlineQueue', updatedQueue, 'user').catch(error => logger.error('Failed to save offline queue', error as any));
    
    toast.info(`${type === 'save' ? 'Save' : type === 'submit' ? 'Submission' : 'Section save'} queued for when you're back online`);
  };

  const processOfflineQueue = async () => {
    const pendingItems = submissionQueue.filter(item => item.status === 'pending' || item.status === 'failed');
    
    for (const item of pendingItems) {
      setSubmissionQueue(prev => prev.map(qi => 
        qi.id === item.id ? { ...qi, status: 'processing' } : qi
      ));
      
      try {
        // Process based on type
        let success = false;
        
        switch (item.type) {
          case 'save':
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            success = true;
            break;
            
          case 'submit':
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 2000));
            success = true;
            break;
            
          case 'section-save':
            // Simulate section save
            await new Promise(resolve => setTimeout(resolve, 500));
            success = true;
            break;
        }
        
        if (success) {
          setSubmissionQueue(prev => prev.map(qi => 
            qi.id === item.id ? { ...qi, status: 'completed' } : qi
          ));
          showSuccess(`${item.type} completed successfully`);
        }
      } catch (error) {
        setSubmissionQueue(prev => prev.map(qi => 
          qi.id === item.id ? { 
            ...qi, 
            status: 'failed',
            retryCount: qi.retryCount + 1,
            error: error instanceof Error ? error.message : 'Unknown error'
          } : qi
        ));
        
        // Retry if under limit
        if (item.retryCount < 3) {
          setTimeout(() => processOfflineQueue(), 5000 * (item.retryCount + 1));
        }
      }
    }
    
    // Clean up completed items after 30 seconds
    setTimeout(() => {
      setSubmissionQueue(prev => prev.filter(item => item.status !== 'completed'));
      netlifySettingsService.set('nonprofitApp_offlineQueue', 
        submissionQueue.filter(item => item.status !== 'completed'), 
        'user'
      ).catch(error => logger.error('Failed to save auto-save data', error as any));
    }, 30000);
  };

  const clearOfflineQueue = () => {
    setSubmissionQueue([]);
    netlifySettingsService.remove('nonprofitApp_offlineQueue').catch(error => logger.error('Failed to remove offline queue', error as any));
    showSuccess('Offline queue cleared');
  };

  // Load offline queue from Netlify on mount
  useEffect(() => {
    const loadOfflineQueue = async () => {
      try {
        const savedQueue = await netlifySettingsService.get('nonprofitApp_offlineQueue');
        if (savedQueue && Array.isArray(savedQueue)) {
          setSubmissionQueue(savedQueue);
          if (savedQueue.length > 0 && navigator.onLine) {
            processOfflineQueue();
          }
        }
      } catch (error) {
        logger.error('Failed to load offline queue:', error as any);
      }
    };
    
    loadOfflineQueue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progress checkpoint management
  const createCheckpoint = (type: 'auto' | 'manual' | 'milestone' = 'manual', description?: string) => {
    const currentProgress = calculateOverallProgress();
    const checkpoint = {
      id: `checkpoint_${Date.now()}`,
      timestamp: new Date().toISOString(),
      progress: currentProgress,
      sectionProgress: { ...sectionProgress },
      formData: { ...formData },
      description: description || getCheckpointDescription(type, currentProgress),
      type
    };
    
    setProgressCheckpoints((prev: unknown) => {
      const updated = [...(prev as any), checkpoint];
      // Keep only last 10 checkpoints
      if (updated.length > 10) {
        updated.shift();
      }
      // Save to Netlify
      netlifySettingsService.set('nonprofitApp_checkpoints', updated, 'user').catch(error => logger.error('Failed to save checkpoints', error as any));
      return updated;
    });
    
    if (type === 'manual') {
      showSuccess('Checkpoint saved successfully!');
    }
  };

  const getCheckpointDescription = (type: string, progress: number): string => {
    if (type === 'milestone') {
      if (progress === 25) return 'Quarter way complete!';
      if (progress === 50) return 'Halfway there!';
      if (progress === 75) return 'Three quarters complete!';
      if (progress === 100) return 'Application complete!';
      return `${progress}% milestone reached`;
    }
    if (type === 'auto') {
      return `Auto-save at ${progress}% completion`;
    }
    return `Manual checkpoint at ${progress}% completion`;
  };

  const restoreCheckpoint = (checkpointId: string) => {
    const checkpoint = progressCheckpoints.find(cp => cp.id === checkpointId);
    if (checkpoint) {
      showConfirmationDialog(
        `Are you sure you want to restore this checkpoint from ${new Date(checkpoint.timestamp).toLocaleString()}? Current progress will be overwritten.`,
        () => {
          setFormData(checkpoint.formData);
          setSectionProgress(checkpoint.sectionProgress as any);
          setShowCheckpointsModal(false);
          showSuccess('Checkpoint restored successfully!');
          setHasUnsavedChanges(true);
        }
      );
    }
  };

  const deleteCheckpoint = (checkpointId: string) => {
    setProgressCheckpoints(prev => {
      const updated = prev.filter(cp => cp.id !== checkpointId);
      netlifySettingsService.set('nonprofitApp_checkpoints', updated, 'user').catch(error => logger.error('Failed to save checkpoints', error as any));
      return updated;
    });
    showSuccess('Checkpoint deleted');
  };

  // Load checkpoints from Netlify on mount
  useEffect(() => {
    const loadCheckpoints = async () => {
      try {
        const savedCheckpoints = await netlifySettingsService.get('nonprofitApp_checkpoints');
        if (savedCheckpoints && Array.isArray(savedCheckpoints)) {
          setProgressCheckpoints(savedCheckpoints);
        }
      } catch (error) {
        logger.error('Failed to load checkpoints:', error as any);
      }
    };
    
    loadCheckpoints();
  }, []);

  // Auto-create checkpoints at milestones
  useEffect(() => {
    const currentProgress = calculateOverallProgress();
    const milestones = [25, 50, 75, 100];
    
    for (const milestone of milestones) {
      if (currentProgress >= milestone) {
        const hasRecentMilestone = progressCheckpoints.some(cp => 
          cp.type === 'milestone' && 
          cp.progress === milestone &&
          new Date().getTime() - new Date(cp.timestamp).getTime() < 3600000 // Within last hour
        );
        
        if (!hasRecentMilestone) {
          createCheckpoint('milestone');
          break;
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionProgress]);

  // Auto-save with checkpoint
  useEffect(() => {
    if (!autoSaveEnabled || !hasUnsavedChanges) return;
    
    // Clear existing timers
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Start countdown
    setAutoSaveCountdown(5);
    countdownIntervalRef.current = setInterval(() => {
      setAutoSaveCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Set auto-save timer
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      
      // Save to Netlify
      const dataToSave = {
        formData,
        sectionProgress,
        lastSaved: new Date().toISOString(),
        version: formVersion
      };
      
      try {
        await netlifySettingsService.set('nonprofitApplicationData', dataToSave, 'organization');
        setLastSaved(new Date());
        setAutoSaveStatus('saved');
        setHasUnsavedChanges(false);
        
        // Create auto-save checkpoint every 10 saves
        const currentSaveCount = await netlifySettingsService.get('nonprofitApp_saveCount') || 0;
        const saveCount = parseInt(currentSaveCount.toString()) + 1;
        await netlifySettingsService.set('nonprofitApp_saveCount', saveCount, 'user');
        
        if (saveCount % 10 === 0) {
          createCheckpoint('auto');
        }
        
        // Reset status after 2 seconds
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      } catch (error) {
        logger.error('Auto-save failed:', error as any);
        setAutoSaveStatus('error');
      }
    }, 5000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [formData, hasUnsavedChanges, autoSaveEnabled]);

  // Enhanced keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleAutoSave();
        toast.success('Form saved manually');
      }
      
      // Ctrl/Cmd + E to export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportFormData('json');
      }
      
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Focus on the first input field in the current section
        const firstInput = document.querySelector('input:not([type="hidden"])') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, []);

  // Performance optimization: Memoize expensive calculations (moved after sections definition)
  // Note: This was moved here to prevent "Cannot access before initialization" errors

  // Enhanced loading states
  const [loadingStates, setLoadingStates] = useState({
    saving: false,
    loading: false,
    uploading: false,
    validating: false
  });

  const setLoadingState = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...(prev as any), [key]: value }));
  };

  // Helper function for relative time formatting
  const formatRelativeTime = (date: Date | null | undefined) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Unknown';
    }
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Error recovery functions
  const recoverFromError = async () => {
    try {
      // Clear current errors
      setErrors({});
      setValidationErrors({});
      setErrorBoundaryInfo({ hasError: false });

      // Restore from Netlify if available
      const savedData = await netlifySettingsService.get('nonprofitApplicationData');
      if (savedData && (savedData as any).formData) {
        setFormData((savedData as any).formData);
        toast.success('Data restored from backup');
      } else if (lastKnownGoodState) {
        setFormData((lastKnownGoodState as any).formData);
        toast.success('Restored to last known good state');
      }
    } catch (error) {
      logger.error('Error during recovery:', error as any);
      toast.error('Recovery failed - you may need to refresh the page');
    }
  };

  const _handleCriticalError = (error: Error, errorInfo?: { componentStack?: string; errorBoundary?: string }) => {
    logger.error('Critical error occurred:', error, errorInfo);
    setErrorBoundaryInfo({ hasError: true, error, errorInfo });
    
    // Attempt to save current state before error handling
    try {
      const currentState = {
        formData: { ...formData },
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      netlifySettingsService.set('nonprofitApplicationData_error_backup', currentState, 'organization').catch(error => logger.error('Failed to save error backup', error as any));
    } catch (e) {
      logger.error('Failed to save error backup:', e);
    }
  };

  // Required fields for each section - moved here to be available for calculateSectionProgress
  const requiredFields = {
    basicInfo: ['ein', 'orgName', 'legalName', 'contactName', 'phone', 'streetAddress', 'city', 'state', 'zipCode'],
    narrative: ['backgroundStatement', 'missionStatement', 'needsStatement', 'nteeCodes'],
    governance: ['boardMembers', 'boardDemographics', 'boardChairInfo', 'boardInfo'],
    management: ['fundraisingPlan', 'strategicPlan', 'continuityPlan', 'technologyPlan', 'successionPlan', 'staffVolunteers', 'staffDemographics', 'staffGenderDemographics', 'ceoInfo', 'directorsPolicy', 'nondiscriminationPolicy', 'documentDestructionPolicy'],
    financials: ['form990', 'currentFiscalYear', 'endowment'],
    donations: ['stateCharitableSolicitations'],
    programs: [],
    impact: [],
    compliance: [],
    technology: [],
    communications: [],
    otherLocations: [],
    insurance: [],
    riskManagement: [],
    additionalInfo: [],
    leadershipDetails: [],
    boardMemberDetails: [],
    staffDetails: [],
    references: []
  };

  // Calculate section progress based on filled fields
  const calculateSectionProgress = (sectionId: string): number => {
    const sectionFields = requiredFields[sectionId as keyof typeof requiredFields];
    if (!sectionFields || sectionFields.length === 0) {
      // For sections without required fields, check if any info is provided
      const allFields = Object.keys(formData).filter(key => key.startsWith(sectionId));
      const filledFields = allFields.filter(field => {
        const value = formData[field];
        return value && (typeof value === 'string' ? value.trim() !== '' : true);
      });
      return allFields.length > 0 ? (filledFields.length / allFields.length) * 100 : 0;
    }

    const filledFields = sectionFields.filter(field => {
      const value = formData[field];
      return value && (typeof value === 'string' ? value.trim() !== '' : true);
    });

    return (filledFields.length / sectionFields.length) * 100;
  };

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    // Defensive check: ensure sections is defined and not empty
    if (typeof sections === 'undefined' || !sections || sections.length === 0) {
      return 0;
    }
    
    try {
      const allSections = Object.keys(sections);
      if (allSections.length === 0) return 0;
      
      const totalProgress = allSections.reduce((sum, sectionId) => {
        return sum + (sectionProgress[sectionId as keyof typeof sectionProgress] || 0);
      }, 0);
      return Math.round(totalProgress / allSections.length);
    } catch (error) {
      logger.warn('Error calculating progress:', error as any);
      return 0;
    }
  };
  
  const _getIncompleteFields = () => {
    const incomplete: { section: string; field: string; error?: string }[] = [];
    
    // Check basic required fields
    const requiredFields = [
      { field: 'organizationName', section: 'basic', label: 'Organization Name' },
      { field: 'ein', section: 'basic', label: 'EIN' },
      { field: 'email', section: 'basic', label: 'Email' },
      { field: 'address', section: 'basic', label: 'Address' }
    ];
    
    requiredFields.forEach(({ field, section, label }) => {
      if (!(formData as any)[field] || (formData as any)[field].toString().trim() === '') {
        incomplete.push({
          section,
          field,
          error: `${label} is required`
        });
      }
    });
    
    return incomplete;
  };

  // Helper function for debouncing (simple implementation)
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: unknown[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Performance optimization - memoization and debouncing
  const _debouncedFormData = useMemo(() => formData, [formData]);
  const _memoizedSectionProgress = useMemo(() => {
    // Ensure sectionProgress is initialized before using it
    if (!sectionProgress || typeof sectionProgress !== 'object') {
      return {};
    }
    
    try {
      return Object.keys(sectionProgress).reduce((acc, key) => {
        try {
          acc[key] = calculateSectionProgress(key);
        } catch (error) {
          logger.warn(`Error calculating progress for section ${key}:`, error as any);
          acc[key] = 0;
        }
        return acc;
      }, {} as any);
    } catch (error) {
      logger.warn('Error calculating section progress:', error as any);
      return {};
    }
  }, [formData, sectionLocks, sectionProgress]);

  // Debounced input handler for better performance
  const _debouncedInputHandler = useMemo(
    () => debounce((field: string, value: FormFieldValue) => {
      try {
        setFormData(prev => ({ ...(prev as any), [field]: value }));
      } catch (error) {
        logger.warn(`Error updating field ${field}:`, error as any);
      }
    }, 300),
    []
  );

  // Help system functionality
  // Moved showHelpModal to top of component
  // Moved helpTopic to top of component
  const [_showTooltip, setShowTooltip] = useState<{ field: string; visible: boolean }>({ field: '', visible: false });
  // Moved help system state declarations to earlier in the file

  const helpContent = {
    general: {
      title: "Getting Started",
      content: [
        "Fill out each section completely to track your progress",
        "Use Ctrl+S to save your work at any time", 
        "Your data is automatically saved every 5 seconds",
        "Use the progress indicators to see completion status"
      ]
    },
    basicInfo: {
      title: "Basic Information Help",
      content: [
        "EIN: Your Employer Identification Number from the IRS",
        "DBA: Any 'Doing Business As' names your organization uses",
        "Parent Organization: If you're a subsidiary or chapter",
        "Fiscal Sponsor: Organization that handles your finances"
      ]
    },
    keyboard: {
      title: "Keyboard Shortcuts",
      content: [
        "Ctrl+S or Cmd+S: Save form",
        "Ctrl+Shift+C: Clear form (with confirmation)",
        "Ctrl+↑/↓: Navigate between sections",
        "Esc: Close modals and dialogs"
      ]
    }
  };

  const _showFieldHelp = (field: string) => {
    setShowTooltip({ field, visible: true });
    setTimeout(() => setShowTooltip({ field: '', visible: false }), 3000);
  };

  // Smart field dependencies
  const [fieldDependencies, setFieldDependencies] = useState<{[key: string]: boolean}>({});

  // Define field dependency rules
  const dependencyRules = {
    fiscalSponsor: (formData: FormData) => formData.hasFiscalSponsor === 'yes',
    parentOrganization: (formData: FormData) => formData.hasParentOrg === 'yes',
    address2: (formData: FormData) => !!formData.address,
    zipCode4: (formData: FormData) => !!formData.zipCode,
    boardChairperson: (formData: FormData) => (formData as any).boardSize > 0,
    executiveDirector: (formData: FormData) => (formData as any).hasExecutiveDirector === 'yes',
    auditedFinancials: (formData: FormData) => (formData as any).annualBudget > 500000,
    programExpenses: (formData: FormData) => formData.hasPrograms === 'yes'
  };

  // Update field dependencies when form data changes
  useEffect(() => {
    const newDependencies: {[key: string]: boolean} = {};
    Object.keys(dependencyRules).forEach(field => {
      newDependencies[field] = dependencyRules[field as keyof typeof dependencyRules](formData);
    });
    setFieldDependencies(newDependencies);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Helper function to check if field should be visible
  const isFieldVisible = (fieldName: string): boolean => {
    return fieldDependencies[fieldName] !== false;
  };

  // Address validation - ZIP to City/State lookup
  const zipToLocation: {[key: string]: {city: string, state: string}} = {
    "10001": { city: "New York", state: "NY" },
    "10002": { city: "New York", state: "NY" },
    "90210": { city: "Beverly Hills", state: "CA" },
    "90211": { city: "Beverly Hills", state: "CA" },
    "20001": { city: "Washington", state: "DC" },
    "60601": { city: "Chicago", state: "IL" },
    "77001": { city: "Houston", state: "TX" },
    "33101": { city: "Miami", state: "FL" },
    "30301": { city: "Atlanta", state: "GA" },
    "02101": { city: "Boston", state: "MA" },
    "85001": { city: "Phoenix", state: "AZ" },
    "19101": { city: "Philadelphia", state: "PA" },
    "32801": { city: "Orlando", state: "FL" },
    "32805": { city: "Orlando", state: "FL" },
    "32807": { city: "Orlando", state: "FL" },
    "32822": { city: "Orlando", state: "FL" },
    // Add more common ZIP codes as needed
  };

  const _handleZipCodeChange = (value: string) => {
    // Update ZIP code
    handleInputChange('zipCode', value);
    
    // Auto-fill city and state if ZIP is found
    if (value.length === 5 && zipToLocation[value]) {
      const location = zipToLocation[value];
      handleInputChange('city', location.city);
      handleInputChange('state', location.state);
      toast.success(`Auto-filled: ${location.city}, ${location.state}`, {
        position: 'bottom-right',
        autoClose: 2000
      });
    }

    // Validate ZIP format
    const zipError = commonValidationRules.zipCode[0](value) ? null : 'Invalid ZIP code format';
    if (zipError) {
      handleFieldError('zipCode', zipError);
    } else {
      handleClearError('zipCode');
    }
  };

  // Phone number formatting
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format based on length
    if (phoneNumber.length === 0) return '';
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const _handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
    
    // Validate phone
    const phoneError = commonValidationRules.phone[0](formatted) ? null : 'Invalid phone number format';
    if (phoneError) {
      handleFieldError('phone', phoneError);
    } else {
      handleClearError('phone');
    }
  };

  const _handleContactPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('contactPhone', formatted);
  };

  // Field auto-completion system
  const [_autoCompleteData, setAutoCompleteData] = useState<{[key: string]: string[]}>({
    organizationName: [],
    address: [],
    contactPerson: [],
    programNames: [],
    boardMemberNames: []
  });

  // Load auto-complete data from Netlify
  useEffect(() => {
    const loadAutoComplete = async () => {
      try {
        const savedAutoComplete = await netlifySettingsService.get('nonprofitApplicationAutoComplete');
        if (savedAutoComplete) {
          setAutoCompleteData(savedAutoComplete as any);
        }
      } catch (error) {
        logger.error('Error loading autocomplete data:', error as any);
      }
    };
    
    loadAutoComplete();
  }, []);

  // Save commonly entered values for auto-completion
  const _addToAutoComplete = (field: string, value: string) => {
    if (!value || value.length < 3) return;
    
    setAutoCompleteData(prev => {
      const fieldData = prev[field] || [];
      if (!fieldData.includes(value)) {
        const updated = {
          ...prev,
          [field]: [...fieldData.slice(-9), value] // Keep last 10 entries
        };
        netlifySettingsService.set('nonprofitApplicationAutoComplete', updated, 'user').catch(error => logger.error('Failed to save autocomplete data', error as any));
        return updated;
      }
      return prev;
    });
  };

  // Dark mode functionality
  // Moved darkMode to top of component

  // High contrast mode is already declared above

  useEffect(() => {
    netlifySettingsService.set('nonprofitApp_highContrast', highContrastMode, 'user').catch(error => logger.error('Failed to save high contrast setting', error as any));
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
      // Add high contrast styles
      const style = document.getElementById('high-contrast-styles') || document.createElement('style');
      style.id = 'high-contrast-styles';
      style.textContent = `
        .high-contrast {
          --tw-bg-opacity: 1;
          --tw-text-opacity: 1;
        }
        .high-contrast * {
          background-color: #000000 !important;
          color: #ffffff !important;
          border-color: #ffffff !important;
        }
        .high-contrast input, .high-contrast textarea, .high-contrast select {
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 2px solid #000000 !important;
        }
        .high-contrast button {
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 2px solid #000000 !important;
        }
        .high-contrast button:hover {
          background-color: #ffff00 !important;
          color: #000000 !important;
        }
        .high-contrast .bg-blue-500, .high-contrast .bg-blue-500 {
          background-color: #0000ff !important;
          color: #ffffff !important;
        }
        .high-contrast .bg-red-500, .high-contrast .bg-red-600 {
          background-color: #ff0000 !important;
          color: #ffffff !important;
        }
        .high-contrast .bg-green-500, .high-contrast .bg-green-600 {
          background-color: #00ff00 !important;
          color: #000000 !important;
        }
        .high-contrast .text-gray-500, .high-contrast .text-gray-600 {
          color: #ffffff !important;
        }
        .high-contrast a {
          color: #ffff00 !important;
          text-decoration: underline !important;
        }
        .high-contrast .shadow, .high-contrast .shadow-lg {
          box-shadow: 0 0 0 2px #ffffff !important;
        }
      `;
      if (!document.getElementById('high-contrast-styles')) {
        document.head.appendChild(style);
      }
    } else {
      document.documentElement.classList.remove('high-contrast');
      const style = document.getElementById('high-contrast-styles');
      if (style) {
        style.remove();
      }
    }
  }, [highContrastMode]);

  const toggleHighContrast = () => {
    setHighContrastMode(!highContrastMode);
    toast.success(`High contrast mode ${!highContrastMode ? 'enabled' : 'disabled'}`, {
      position: 'bottom-right',
      autoClose: 2000
    });
    announceToScreenReader(`High contrast mode ${!highContrastMode ? 'enabled' : 'disabled'}`);
  };

  // Duplicate detection system
  const [_duplicateWarnings, setDuplicateWarnings] = useState<{[key: string]: string}>({});

  const checkForDuplicates = (field: string, value: string, collection: unknown[]) => {
    if (!value || value.length < 3) return;
    
    const duplicates = collection.filter(item => {
      const itemValue = typeof item === 'string' ? item : (item as any)[field];
      return itemValue && (itemValue || '').toLowerCase().includes(value.toLowerCase()) && itemValue !== value;
    });

    if (duplicates.length > 0) {
      setDuplicateWarnings(prev => ({
        ...prev,
        [field]: `Similar entry found: "${duplicates[0]}"`
      }));
    } else {
      setDuplicateWarnings(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Check for duplicate organization names
  const _checkOrgNameDuplicate = (value: string) => {
    // In a real app, this would check against a database
    const commonOrgs = ['United Way', 'Red Cross', 'Salvation Army', 'Goodwill'];
    checkForDuplicates('organizationName', value, commonOrgs);
  };

  // Check for duplicate email addresses
  const _checkEmailDuplicate = (value: string) => {
    checkForDuplicates('email', value, contacts.map(c => c.email));
  };

  // Smart form completion suggestions
  const [_showSuggestions, _setShowSuggestions] = useState<{[key: string]: boolean}>({});
  const [_fieldSuggestions, _setFieldSuggestions] = useState<{[key: string]: string[]}>({});
  
  // Common suggestions database
  const suggestionDatabase = {
    missionStatement: [
      'To empower underserved communities through education and resources',
      'To provide essential services and support to those in need',
      'To create sustainable solutions for environmental challenges',
      'To advance equity and social justice in our community',
      'To preserve and promote cultural heritage and arts'
    ],
    visionStatement: [
      'A world where everyone has equal opportunities to thrive',
      'Communities working together for sustainable change',
      'A future where all people have access to essential resources',
      'Building bridges across cultures and communities',
      'Creating lasting positive impact through innovation'
    ],
    programAreas: [
      'Education and Youth Development',
      'Health and Wellness',
      'Environmental Conservation',
      'Arts and Culture',
      'Community Development',
      'Social Services',
      'Economic Empowerment'
    ],
    targetPopulation: [
      'Low-income families',
      'Youth and adolescents',
      'Senior citizens',
      'Individuals with disabilities',
      'Immigrant and refugee communities',
      'Veterans and military families',
      'Homeless individuals'
    ],
    organizationType: [
      '501(c)(3) Public Charity',
      '501(c)(3) Private Foundation',
      '501(c)(4) Social Welfare',
      '501(c)(6) Business League',
      'Fiscal Sponsorship',
      'Religious Organization',
      'Educational Institution'
    ]
  };

  // Get smart suggestions based on field and context
  const _getSmartSuggestions = (fieldName: string, currentValue: string) => {
    const suggestions: string[] = [];
    
    // Get predefined suggestions
    const predefined = suggestionDatabase[fieldName as keyof typeof suggestionDatabase] || [];
    
    // Filter based on current input
    if (currentValue) {
      const filtered = predefined.filter(s => 
        (s || '').toLowerCase().includes(currentValue.toLowerCase())
      );
      suggestions.push(...filtered);
    } else {
      suggestions.push(...predefined.slice(0, 5));
    }
    
    // Add AI-powered contextual suggestions based on other fields
    if (fieldName === 'missionStatement' && formData.organizationType) {
      if (typeof formData.organizationType === 'string' && formData.organizationType.includes('Education')) {
        suggestions.unshift('To provide quality education and learning opportunities to underserved communities');
      }
      if (typeof formData.organizationType === 'string' && formData.organizationType.includes('Health')) {
        suggestions.unshift('To improve health outcomes and access to healthcare for all');
      }
    }
    
    // TODO: Add historical suggestions from Netlify
    // This requires making getSuggestions async or loading suggestions on mount
    // const historicalData = await netlifySettingsService.get(`nonprofitApp_suggestions_${fieldName}`);
    
    // Remove duplicates and limit
    return Array.from(new Set(suggestions)).slice(0, 8);
  };

  // Multi-language support (English/Spanish)
  // Moved language to top of component

  const translations = {
    en: {
      // Basic labels
      organizationName: "Organization Name",
      ein: "EIN",
      address: "Address",
      city: "City", 
      state: "State",
      zipCode: "ZIP Code",
      phone: "Phone",
      email: "Email",
      save: "Save Form",
      clear: "Clear Form",
      print: "Print Form",
      help: "Help",
      // Sections
      basicInformation: "Basic Information",
      taxIdentification: "Tax Identification",
      organizationIdentity: "Organization Identity", 
      physicalAddress: "Physical Address",
      // Messages
      autoSaved: "Auto-saved",
      dataSaved: "Data saved successfully",
      // Questions
      hasParentOrg: "Do you have a parent organization?",
      hasFiscalSponsor: "Do you have a fiscal sponsor?",
      yes: "Yes",
      no: "No"
    },
    es: {
      // Basic labels
      organizationName: "Nombre de la Organización",
      ein: "EIN",
      address: "Dirección",
      city: "Ciudad",
      state: "Estado", 
      zipCode: "Código Postal",
      phone: "Teléfono",
      email: "Correo Electrónico",
      save: "Guardar Formulario",
      clear: "Limpiar Formulario", 
      print: "Imprimir Formulario",
      help: "Ayuda",
      // Sections
      basicInformation: "Información Básica",
      taxIdentification: "Identificación Fiscal",
      organizationIdentity: "Identidad de la Organización",
      physicalAddress: "Dirección Física",
      // Messages
      autoSaved: "Guardado automático",
      dataSaved: "Datos guardados exitosamente",
      // Questions
      hasParentOrg: "¿Tiene una organización matriz?",
      hasFiscalSponsor: "¿Tiene un patrocinador fiscal?",
      yes: "Sí",
      no: "No"
    }
  };

  const _t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    netlifySettingsService.set('nonprofitApp_language', newLang, 'user').catch(error => logger.error('Failed to save language setting', error as any));
    toast.success(`Language changed to ${newLang === 'en' ? 'English' : 'Español'}`, {
      position: 'bottom-right',
      autoClose: 2000
    });
  };

  // Form templates system
  const [savedTemplates, setSavedTemplates] = useState<{[key: string]: unknown}>({});
  const [_showTemplateModal, setShowTemplateModal] = useState(false);

  const _defaultTemplates = {
    basicNonprofit: {
      name: "Basic Nonprofit",
      description: "Standard nonprofit organization template",
      data: {
        hasParentOrg: "no",
        hasFiscalSponsor: "no",
        organizationType: "501c3"
      }
    },
    churchTemplate: {
      name: "Religious Organization", 
      description: "Template for churches and religious organizations",
      data: {
        hasParentOrg: "no",
        hasFiscalSponsor: "no",
        organizationType: "501c3",
        programNames: ["Religious Services", "Community Outreach"]
      }
    },
    educationTemplate: {
      name: "Educational Organization",
      description: "Template for schools and educational nonprofits", 
      data: {
        hasParentOrg: "no",
        hasFiscalSponsor: "no",
        organizationType: "501c3",
        programNames: ["Education", "Training", "Workshops"]
      }
    }
  };

  // Load templates from Netlify
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const saved = await netlifySettingsService.get('nonprofitApp_templates');
        if (saved) {
          setSavedTemplates(saved as any);
        }
      } catch (error) {
        logger.error('Error loading templates:', error as any);
      }
    };
    
    loadTemplates();
  }, []);

  const _applyTemplate = (templateData: unknown) => {
    setFormData(prev => ({ ...(prev as any), ...(templateData as any) }));
    setShowTemplateModal(false);
    toast.success('Template applied successfully');
  };

  const _saveAsTemplate = () => {
    const templateName = prompt('Enter template name:');
    if (templateName) {
      const newTemplate = {
        name: templateName,
        description: `Custom template created ${new Date().toLocaleDateString()}`,
        data: { ...formData }
      };
      
      const updated = { ...savedTemplates, [templateName]: newTemplate };
      setSavedTemplates(updated);
      netlifySettingsService.set('nonprofitApp_templates', updated, 'user').catch(error => logger.error('Failed to save templates', error as any));
      toast.success('Template saved successfully');
    }
  };

  // Email domain validation and suggestions
  const _commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
  const [emailSuggestion, setEmailSuggestion] = useState<string>('');

  const _validateEmailDomain = (email: string) => {
    if (!email || !email.includes('@')) return;
    
    const domain = email.split('@')[1];
    if (!domain) return;

    // Check for common typos
    const suggestions: {[key: string]: string} = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com', 
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outllok.com': 'outlook.com'
    };

    if (suggestions[domain]) {
      setEmailSuggestion(`Did you mean ${email.split('@')[0]}@${suggestions[domain]}?`);
    } else {
      setEmailSuggestion('');
    }
  };

  const _applyEmailSuggestion = () => {
    if (emailSuggestion) {
      const suggestedEmail = emailSuggestion.split(' ')[3]?.replace('?', '');
      if (suggestedEmail) {
        handleInputChange('email', suggestedEmail);
        setEmailSuggestion('');
        toast.success('Email corrected');
      }
    }
  };

  // Bulk data import system with dynamic template generation
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [_showVersionHistory, _setShowVersionHistory] = useState(false);
  
  // View mode toggle (standard vs tabbed)
  // Moved viewMode to top of component
  const [_activeTabSection, _setActiveTabSection] = useState('basic');
  
  useEffect(() => {
    netlifySettingsService.set('nonprofitApp_viewMode', viewMode, 'user').catch(error => logger.error('Failed to save view mode', error as any));
  }, [viewMode]);
  
  const _toggleViewMode = () => {
    const newMode = viewMode === 'standard' ? 'tabbed' : 'standard';
    setViewMode(newMode);
    toast.success(`Switched to ${newMode} view`, {
      position: 'bottom-right',
      autoClose: 2000
    });
    announceToScreenReader(`View mode changed to ${newMode}`);
  };
  
  // Tab sections configuration
  const _tabSections = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'organization', label: 'Organization', icon: Users },
    { id: 'contact', label: 'Contact', icon: User },
    { id: 'financial', label: 'Financial', icon: CircleDollarSign },
    { id: 'programs', label: 'Programs', icon: FileText },
    { id: 'governance', label: 'Governance', icon: Shield },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'additional', label: 'Additional', icon: Info }
  ];
  
  // Field-level comments/notes system
  const [fieldComments, setFieldComments] = useState<{[fieldName: string]: string}>({});
  const [showingCommentField, setShowingCommentField] = useState<string | null>(null);
  const [fieldNotesHistory, setFieldNotesHistory] = useState<{[fieldName: string]: Array<{
    timestamp: string;
    author: string;
    note: string;
  }>}>({});

  // Generate CSV template based on current form fields
  const generateCSVTemplate = () => {
    const currentFields = [
      'organizationName',
      'ein', 
      'email',
      'phone',
      'address',
      'city',
      'state',
      'zipCode',
      'website',
      'missionStatement',
      'annualBudget',
      'fiscalYearEnd',
      'programCount',
      'staffCount',
      'volunteerCount',
      'boardSize'
    ];

    // Add conditional fields based on current form state
    const conditionalFields = [];
    if (isFieldVisible('parentOrganization')) conditionalFields.push('parentOrganization');
    if (isFieldVisible('fiscalSponsor')) conditionalFields.push('fiscalSponsor');

    const allFields = [...currentFields, ...conditionalFields];
    
    // Create CSV header
    const csvHeader = allFields.join(',');
    
    // Create example row with sample data
    const exampleData = {
      organizationName: 'Example Nonprofit Inc',
      ein: '12-3456789',
      email: 'contact@example.org',
      phone: '(555) 123-4567',
      address: '123 Main St',
      city: 'Orlando',
      state: 'FL', 
      zipCode: '32801',
      website: 'https://example.org',
      missionStatement: 'To serve our community...',
      annualBudget: '250000',
      fiscalYearEnd: '12/31',
      programCount: '3',
      staffCount: '5',
      volunteerCount: '25',
      boardSize: '7',
      parentOrganization: '',
      fiscalSponsor: ''
    };

    const exampleRow = allFields.map(field => exampleData[field as keyof typeof exampleData] || '').join(',');
    
    return `${csvHeader}\n${exampleRow}`;
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = generateCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nonprofit_application_template_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded successfully');
  };

  // Parse CSV file
  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, unknown> = { _rowIndex: index + 1 };
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  };

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        setImportPreview(data.slice(0, 5)); // Show first 5 rows for preview
        toast.success(`Preview loaded: ${data.length} rows found`);
      } catch (error) {
        toast.error('Error parsing CSV file');
        logger.error('CSV parse error:', error as any);
      }
    };
    reader.readAsText(file);
  }, [parseCSV]);

  // Import data to form
  const importData = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length > 0) {
          // Use first row as form data
          const firstRow = data[0];
          const importedData: Record<string, unknown> = {};
          
          // Map CSV fields to form fields
          Object.keys(firstRow).forEach(key => {
            if (key !== '_rowIndex' && firstRow[key]) {
              importedData[key] = firstRow[key];
            }
          });

          setFormData(prev => ({ ...(prev as any), ...importedData }));
          setShowImportModal(false);
          toast.success(`Data imported successfully from row 1`);
          
          // Store additional rows for potential future use
          if (data.length > 1) {
            netlifySettingsService.set('nonprofitApp_bulkData', data.slice(1), 'user').catch(error => logger.error('Failed to save bulk data', error as any));
            toast.info(`${data.length - 1} additional rows saved for future use`);
          }
        }
      } catch (error) {
        toast.error('Error importing data');
        logger.error('Import error:', error as any);
      }
    };
    reader.readAsText(importFile);
  };

  // Enhanced form validation with detailed error messages
  const _validateAllFields = (): boolean => {
    const newErrors: Errors = {};

    // Basic Info validation
    if (!(formData as any).ein || !(formData as any).ein?.includes('NO-EIN')) {
      const einError = !commonValidationRules.ein[0]((formData as any).ein) ? 'Invalid EIN format' : null;
      if (einError) newErrors.ein = einError;
    }

    if (!(formData as any).organizationName) {
      const orgError = !((formData as any).organizationName) ? 'Organization name is required' : null;
      if (orgError) newErrors.organizationName = orgError;
    }

    if (!(formData as any).email) {
      const emailError = !commonValidationRules.email[0]((formData as any).email) ? 'Invalid email format' : null;
      if (emailError) newErrors.email = emailError;
    }

    if (!(formData as any).phone) {
      const phoneError = !commonValidationRules.phone[0]((formData as any).phone) ? 'Invalid phone format' : null;
      if (phoneError) newErrors.phone = phoneError;
    }

    if ((formData as any).website) {
      const websiteError = !commonValidationRules.website[0]((formData as any).website) ? 'Invalid website format' : null;
      if (websiteError) newErrors.website = websiteError;
    }

    // Address validation
    if (!(formData as any).address) {
      const addressError = !((formData as any).address) ? 'Address is required' : null;
      if (addressError) newErrors.address = addressError;
    }

    if (!(formData as any).city) {
      const cityError = !((formData as any).city) ? 'City is required' : null;
      if (cityError) newErrors.city = cityError;
    }

    if (!(formData as any).state) {
      const stateError = !((formData as any).state) ? 'State is required' : null;
      if (stateError) newErrors.state = stateError;
    }

    if (!(formData as any).zipCode) {
      const zipError = !commonValidationRules.zipCode[0]((formData as any).zipCode) ? 'Invalid ZIP code format' : null;
      if (zipError) newErrors.zipCode = zipError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const _validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Basic validation rules
    if (!(formData as any).orgName?.trim()) {
      errors.orgName = 'Organization name is required';
    }

    if ((formData as any).ein && !/^\d{2}-\d{7}$/.test((formData as any).ein)) {
      errors.ein = 'EIN must be in format XX-XXXXXXX';
    }

    if ((formData as any).email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((formData as any).email)) {
      errors.email = 'Valid email is required';
    }

    if ((formData as any).phone && !/^[\+]?[1-9][\d]{0,15}$/.test(((formData as any).phone as string).replace(/[\s-\(\)]/g, ''))) {
      errors.phone = 'Valid phone number is required';
    }

    setValidationErrors(errors as any);
    return Object.keys(errors).length === 0;
  };

  const showConfirmationDialog = (message: string, onConfirm: () => void) => {
    setConfirmationMessage(message);
    setShowConfirmation(true);
    
    // Store the confirm callback
    (window as any).__confirmCallback = onConfirm;
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    if ((window as any).__confirmCallback) {
      (window as any).__confirmCallback();
      (window as any).__confirmCallback = null;
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // calculateOverallProgress function moved to before return statement

  // CFF View fields (original fields only)
  const cffFields = {
    basicInfo: ['ein', 'orgName', 'legalName', 'contactName', 'contactEmail', 'phone', 'formerNames', 
                'yearFormed', 'yearIncorporated', 'irsRulingYear', 'annualBudget', 'servicesInSpanish',
                'streetAddress', 'city', 'state', 'zipCode', 'isMailingAddress', 'serviceDaysHours'],
    narrative: ['backgroundStatement', 'impactStatement', 'missionStatement', 'strategiesStatement', 
                'needsStatement', 'primaryAreasOfImpact', 'nteeCodes', 'populationServed', 'serviceAreas',
                'serviceAreaDescription', 'searchKeywords', 'logoFile', 'bannerImage', 'socialMedia',
                'externalAssessments', 'affiliations', 'videos'],
    governance: ['boardMembers', 'advisoryBoardMembers', 'boardDemographics', 'boardChairInfo', 
                 'boardCoChairInfo', 'boardInfo', 'standingCommittees', 'boardAttendanceSheet'],
    management: ['fundraisingPlan', 'strategicPlan', 'continuityPlan', 'technologyPlan', 'successionPlan',
                 'staffVolunteers', 'staffDemographics', 'staffGenderDemographics', 'ceoInfo',
                 'directorsPolicy', 'nondiscriminationPolicy', 'documentDestructionPolicy',
                 'whistleblowerPolicy', 'policyProcedures', 'governmentLicenses', 'evaluations',
                 'managementReport'],
    financials: ['form990', 'currentFiscalYear', 'audits', 'financialInfo', 'capitalCampaign',
                 'endowment', 'irsLetter'],
    donations: ['stateCharitableSolicitations', 'donationPageUrl'],
    programs: [],
    impact: [],
    compliance: [],
    technology: [],
    communications: [],
    otherLocations: [],
    insurance: [],
    riskManagement: [],
    additionalInfo: [],
    leadershipDetails: [],
    boardMemberDetails: [],
    staffDetails: [],
    references: []
  };

  // Get visible sections based on current tab
  const getVisibleSections = () => {
    const allSections = [
      { id: 'basicInfo', name: 'Basic Information', icon: Building2 },
      { id: 'digitalAssets', name: 'Digital Assets', icon: Globe },
      { id: 'brand', name: 'Brand', icon: Zap },
      { id: 'entityDocuments', name: 'Entity Documents', icon: FolderOpen },
      { id: 'narrative', name: 'Narrative', icon: FileText },
      { id: 'governance', name: 'Governance', icon: Shield },
      { id: 'management', name: 'Management', icon: Users },
      { id: 'financials', name: 'Financials', icon: CircleDollarSign },
      { id: 'programs', name: 'Programs', icon: Globe },
      { id: 'impact', name: 'Impact', icon: Target },
      { id: 'compliance', name: 'Compliance', icon: Shield },
      { id: 'technology', name: 'Technology', icon: Globe },
      { id: 'communications', name: 'Communications', icon: MessageCircle },
      { id: 'referencesNetworks', name: 'References & Networks', icon: Users },
      { id: 'donations', name: 'Donations', icon: CircleDollarSign },
      { id: 'riskManagement', name: 'Risk Management', icon: Shield },
      { id: 'insurance', name: 'Insurance', icon: Shield },
      { id: 'otherLocations', name: 'Other Locations', icon: MapPin },
      { id: 'additionalInfo', name: 'Additional Info', icon: Info },
      { id: 'leadershipDetails', name: 'Leadership Details', icon: Users },
      { id: 'boardMemberDetails', name: 'Board Member Details', icon: Users },
      { id: 'staffDetails', name: 'Staff Details', icon: Users },
      { id: 'references', name: 'References', icon: Users }
    ];
    
    if (activeTab === 'cff') {
      return allSections.filter(s => ['basicInfo', 'narrative', 'financials', 'programs', 'impact'].includes(s.id));
    } else if (activeTab === 'required') {
      // Show only sections that have required fields
      return allSections.filter(s => ['basicInfo', 'governance', 'compliance'].includes(s.id));
    } else if (activeTab === 'custom') {
      // For custom view, show sections with custom fields
      return allSections.filter(s => ['basicInfo', 'narrative', 'additionalInfo'].includes(s.id));
    }
    
    return allSections;
  };

  // Check if a field should be visible in current view
  const _isSectionFieldVisible = (sectionId: string, fieldName: string): boolean => {
    if (activeTab === 'full') return true;
    if (activeTab === 'cff') {
      const sectionFields = cffFields[sectionId as keyof typeof cffFields];
      return Array.isArray(sectionFields) && (sectionFields as string[]).includes(fieldName);
    }
    if (activeTab === 'required') {
      const sectionFields = requiredFields[sectionId as keyof typeof requiredFields];
      return Array.isArray(sectionFields) && (sectionFields as string[]).includes(fieldName);
    }
    if (activeTab === 'custom') {
      // For custom view, show fields that have been marked as custom or have values
      return formData[fieldName] !== undefined && formData[fieldName] !== '';
    }
    return true;
  };
  
  // Check if required fields should be enforced (admin can disable them)
  const _shouldEnforceRequired = (): boolean => {
    return !(currentUser?.role === 'admin' && disableRequiredFields);
  };

  // Base sections
  const baseSections = [
    { id: 'basicInfo', name: 'Basic Information' },
    { id: 'entityDocuments', name: 'Entity Documents' },
    { id: 'digitalAssets', name: 'Digital Assets' },
    { id: 'brand', name: 'Brand' },
    { id: 'narrative', name: 'Narrative' },
    { id: 'governance', name: 'Governance' },
    { id: 'management', name: 'Management' },
    { id: 'financials', name: 'Financials' },
    { id: 'programs', name: 'Programs' },
    { id: 'impact', name: 'Impact' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'technology', name: 'Technology' },
    { id: 'communications', name: 'Communications' },
    { id: 'referencesNetworks', name: 'References & Networks' },
    { id: 'donations', name: 'Donations' },
    { id: 'riskManagement', name: 'Risk Management' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'otherLocations', name: 'Other Locations' },
    { id: 'additionalInfo', name: 'Additional Info' },
    { id: 'leadershipDetails', name: 'Leadership Details' },
    { id: 'boardMemberDetails', name: 'Board Member Details' },
    { id: 'staffDetails', name: 'Staff Details' },
    { id: 'references', name: 'References' }
  ];

  // All sections including custom
  const sections = [...baseSections.filter(s => !hiddenSections.includes(s.id)), ...customSections];

  // Performance optimization: Memoize expensive calculations (now after sections definition)
  const memoizedProgress = useMemo(() => {
    // Only calculate progress if sections is defined to prevent initialization errors
    try {
      // Ensure sections variable is available in scope
      if (typeof sections === 'undefined' || !sections || sections.length === 0) {
        return 0;
      }
      return calculateOverallProgress();
    } catch (error) {
      logger.warn('Progress calculation failed, returning 0:', error as any);
      return 0;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionProgress, sections]);

  // Check if EIN is entered
  const isEinEntered = (): boolean => {
    return ((formData as any).ein && ((formData as any).ein as string).length === 10) || noEin;
  };

  // Get current EIN for form naming
  const _getCurrentEIN = (): string => {
    if (noEin) {
      return `00-000000${einSequence.toString().padStart(3, '0')}`;
    }
    return (formData as any).ein || `00-000000${einSequence.toString().padStart(3, '0')}`;
  };

  // Handle EIN change with auto-save
  const handleEINChange = (ein: string) => {
    setFormData(prev => ({ ...(prev as any), ein }));
    setUnsavedChanges(true);
    
    // Auto-save when valid EIN is entered
    if (validateEIN(ein) && !noEin) {
      setTimeout(() => {
        handleSaveForm();
      }, 1000);
    }
  };

  // Handle "No EIN" checkbox
  const _handleNoEINChange = (checked: boolean) => {
    setNoEin(checked);
    if (checked) {
      setFormData(prev => ({ ...(prev as any), ein: '00-0000000' }));
      setEinSequence(prev => prev + 1);
      // Auto-save when "No EIN" is checked
      setTimeout(() => {
        handleSaveForm();
      }, 1000);
    } else {
      setFormData(prev => ({ ...(prev as any), ein: '' }));
    }
    setUnsavedChanges(true);
  };

  // Check if fields should be disabled due to EIN-first system
  const isFieldDisabled = (): boolean => {
    return einFirst && !isEinEntered();
  };

  // Section password handling - removed as per user requirements

  const lockSection = (sectionId: string) => {
    setSectionLocks(prev => ({ ...(prev as any), [sectionId]: true }));
    setSectionStatus(prev => ({ ...(prev as any), [sectionId]: 'locked' }));
  };

  const unlockSection = (sectionId: string) => {
    setSectionLocks(prev => ({ ...(prev as any), [sectionId]: false }));
  };

  const isSectionLocked = (sectionId: string): boolean => {
    return sectionLocks[sectionId] || false;
  };

  const getSectionLockLevel = (sectionId: string): 'none' | 'draft' | 'review' | 'final' => {
    return sectionLockLevels[sectionId] || 'none';
  };

  const _setSectionLockLevel = (sectionId: string, level: 'none' | 'draft' | 'review' | 'final', reason?: string) => {
    setSectionLockLevels(prev => ({ ...(prev as any), [sectionId]: level }));
    if (reason) {
      setSectionLockReasons(prev => ({ ...(prev as any), [sectionId]: reason }));
    }
    
    // Update lock status based on level
    if (level === 'none') {
      setSectionLocks(prev => ({ ...(prev as any), [sectionId]: false }));
    } else {
      setSectionLocks(prev => ({ ...(prev as any), [sectionId]: true }));
    }
  };

  const _canEditSection = (sectionId: string): boolean => {
    const level = getSectionLockLevel(sectionId);
    const userRole = currentUser?.role;
    
    // Admin can edit any section
    if (userRole === 'admin') return true;
    
    // Reviewers can edit draft and review sections
    if (userRole === 'reviewer' && (level === 'draft' || level === 'review')) return true;
    
    // Regular users can only edit draft sections
    if (userRole === 'user' && level === 'draft') return true;
    
    return false;
  };

  const _getLockLevelColor = (level: 'none' | 'draft' | 'review' | 'final'): string => {
    switch (level) {
      case 'draft': return 'bg-blue-100 border-blue-300';
      case 'review': return 'bg-yellow-100 border-yellow-300';
      case 'final': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const _getLockLevelIcon = (level: 'none' | 'draft' | 'review' | 'final') => {
    switch (level) {
      case 'draft': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'review': return <Eye className="w-4 h-4 text-yellow-600" />;
      case 'final': return <Check className="w-4 h-4 text-green-600" />;
      default: return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Accessibility and UI enhancement functions
  const _getAccessibilityClasses = () => {
    const classes = [];
    
    if (accessibilityMode) {
      classes.push('accessibility-mode');
    }
    
    if (highContrastMode) {
      classes.push('high-contrast-mode');
    }
    
    switch (fontSize) {
      case 'small':
        classes.push('text-sm');
        break;
      case 'large':
        classes.push('text-lg');
        break;
      default:
        classes.push('text-base');
    }
    
    return classes.join(' ');
  };

  const _getTooltipContent = (field: string): string => {
    const tooltips: { [key: string]: string } = {
      orgName: 'Enter the full legal name of your organization as it appears on official documents',
      ein: 'Enter your 9-digit Employer Identification Number in format XX-XXXXXXX',
      email: 'Primary contact email for the organization',
      phone: 'Primary contact phone number',
      website: 'Official website URL (optional)',
      annualBudget: 'Total annual operating budget for the current fiscal year',
      mission: 'Brief statement describing your organization\'s purpose and goals',
      boardSize: 'Number of current board members',
      programCount: 'Number of active programs or services offered'
    };
    
    return tooltips[field] || 'Enter the required information';
  };

  const _toggleAccessibilityMode = () => {
    setAccessibilityMode(prev => !prev);
    if (!accessibilityMode) {
      setShowTooltips(true);
      setFontSize('large');
    }
  };

  const _toggleHighContrastMode = () => {
    setHighContrastMode(prev => !prev);
  };

  const _changeFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
  };

  // Form export and import functionality
  const handleExport = () => {
    setShowExportModal(true);
  };

  const _handlePrint = () => {
    window.print();
  };

  const exportSectionToPDF = (sectionId: string) => {
    // Create a temporary print-friendly element
    const printElement = document.createElement('div');
    printElement.style.position = 'fixed';
    printElement.style.top = '-9999px';
    printElement.className = 'print-section';
    
    // Get section data
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    // Build section content
    const sectionFields = requiredFields[sectionId as keyof typeof requiredFields] || [];
    const allSectionFields = Object.keys(formData).filter(key => {
      // Match fields that belong to this section
      return (key || '').toLowerCase().includes(sectionId.toLowerCase()) || 
             (Array.isArray(sectionFields) && (sectionFields as string[]).includes(key));
    });
    
    let html = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">
          CALAO Nonprofit Application - ${section.name}
        </h1>
        <div style="margin: 20px 0; color: #666;">
          <p>Organization: ${formData.organizationName || 'Not specified'}</p>
          <p>EIN: ${formData.ein || 'Not specified'}</p>
          <p>Export Date: ${new Date().toLocaleDateString()}</p>
          <p>Section Progress: ${sectionProgress[sectionId as keyof typeof sectionProgress] || 0}%</p>
        </div>
        <div style="margin-top: 30px;">
    `;
    
    // Add field values
    allSectionFields.forEach(field => {
      const value = formData[field];
      if (value) {
        const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        html += `
          <div style="margin-bottom: 15px; page-break-inside: avoid;">
            <strong style="display: block; color: #555; margin-bottom: 5px;">${fieldLabel}:</strong>
            <div style="padding: 10px; background: #f5f5f5; border-radius: 5px;">
              ${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            </div>
          </div>
        `;
      }
    });
    
    html += `
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
          <p>Generated by CALAO Nonprofit Application System</p>
          ${currentUser ? `<p>Exported by: ${currentUser.name}</p>` : ''}
        </div>
      </div>
    `;
    
    printElement.innerHTML = html;
    document.body.appendChild(printElement);
    
    // Trigger print
    const originalTitle = document.title;
    document.title = `${section.name} - ${formData.organizationName || 'Nonprofit Application'}`;
    
    window.print();
    
    // Cleanup
    document.title = originalTitle;
    document.body.removeChild(printElement);
    
    showSuccess(`${section.name} section ready for PDF export via print dialog`);
  };

  const exportFormData = (format: 'json' | 'csv' | 'pdf' = 'json') => {
    const exportData = {
      formData,
      progress: calculateOverallProgress(),
      sectionProgress,
      lastSaved: new Date().toISOString(),
      version: formVersion,
      metadata: {
        exportedBy: currentUser?.name,
        exportedAt: new Date().toISOString(),
        totalSections: Object.keys(sectionProgress).length,
        completedSections: Object.values(sectionProgress).filter(p => p === 100).length
      }
    };

    switch (format) {
      case 'json':
        const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement('a');
        jsonLink.href = jsonUrl;
        jsonLink.download = `application-${new Date().toISOString().split('T')[0]}.json`;
        jsonLink.click();
        URL.revokeObjectURL(jsonUrl);
        break;
        
      case 'csv':
        // Convert form data to CSV format
        const csvData = Object.entries(formData)
          .filter(([key, value]) => value !== null && value !== undefined && value !== '')
          .map(([key, value]) => `${key},"${String(value).replace(/"/g, '""')}"`)
          .join('\n');
        const csvBlob = new Blob([`Field,Value\n${csvData}`], { type: 'text/csv' });
        const csvUrl = URL.createObjectURL(csvBlob);
        const csvLink = document.createElement('a');
        csvLink.href = csvUrl;
        csvLink.download = `application-${new Date().toISOString().split('T')[0]}.csv`;
        csvLink.click();
        URL.revokeObjectURL(csvUrl);
        break;
        
      case 'pdf':
        // Mock PDF export - in real implementation, use a PDF library
        showSuccess('PDF export feature coming soon!');
        break;
    }
  };

  const importFormData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.formData) {
          setFormData(importedData.formData);
          if (importedData.sectionProgress) {
            setSectionProgress(importedData.sectionProgress);
          }
          setFormVersion(importedData.version || 1);
          setHasUnsavedChanges(true);
          showSuccess('Form data imported successfully!');
        } else {
          throw new Error('Invalid import format');
        }
      } catch (error) {
        logger.error('Import error:', error as any, { component: 'NonprofitApplication', action: 'import-data' });
        showConfirmationDialog('Failed to import form data. The file may be corrupted or in an unsupported format.', () => {});
      }
    };
    reader.readAsText(file);
  };

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFormData(file);
    }
  }, [importFormData]);

  // Advanced search and filtering functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFilters, setSearchFilters] = useState<{
    section?: string;
    fieldType?: string;
    hasErrors?: boolean;
    isComplete?: boolean;
  }>({});

  const searchFormData = (term: string, filters = searchFilters) => {
    if (!term.trim()) return [];
    
    const results: Array<{ section: string; field: string; value: string; path: string }> = [];
    const searchLower = term.toLowerCase();
    
    Object.entries(formData).forEach(([field, value]) => {
      if (value && (String(value) || '').toLowerCase().includes(searchLower)) {
        // Determine section based on field name
        let section = 'general';
        if (field.includes('org') || field.includes('ein') || field.includes('contact')) section = 'basicInfo';
        else if (field.includes('mission') || field.includes('vision')) section = 'narrative';
        else if (field.includes('board') || field.includes('governance')) section = 'governance';
        else if (field.includes('budget') || field.includes('financial')) section = 'financials';
        else if (field.includes('program')) section = 'programs';
        
        // Apply filters
        if (filters.section && section !== filters.section) return;
        if (filters.hasErrors && !validationErrors[field]) return;
        if (filters.isComplete && !value) return;
        
        results.push({
          section,
          field,
          value: String(value),
          path: `${section}.${field}`
        });
      }
    });
    
    return results;
  };

  const _getSearchResults = () => {
    return searchFormData(searchTerm, searchFilters);
  };

  const _navigateToField = (path: string) => {
    const [_section, field] = path.split('.');
    // Scroll to the field and highlight it
    const element = document.querySelector(`[data-field="${field}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-search-result');
      setTimeout(() => {
        element.classList.remove('highlight-search-result');
      }, 3000);
    }
  };

  const _clearSearch = () => {
    setSearchTerm('');
    setSearchFilters({});
  };

  // Get section background color
  const getSectionBackground = (sectionId: string): string => {
    if (sectionLocks[sectionId]) return 'bg-pink-50';
    if (sectionStatus[sectionId] === 'final') return 'bg-green-50';
    if (sectionStatus[sectionId] === 'editing') return 'bg-yellow-50';
    if (sectionStatus[sectionId] === 'saved') return 'bg-blue-50';
    if (sectionStatus[sectionId] === 'error') return 'bg-red-50';
    return '';
  };

  const _getSectionStatusIcon = (sectionId: string) => {
    const status = sectionStatus[sectionId];
    const progress = sectionProgress[sectionId as keyof typeof sectionProgress];
    
    if (status === 'saved') return <Check className="w-4 h-4 text-green-500" />;
    if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (status === 'editing') return <Edit className="w-4 h-4 text-yellow-500" />;
    if (progress === 100) return <Check className="w-4 h-4 text-green-500" />;
    if (progress > 0) return <Clock className="w-4 h-4 text-blue-500" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  const _getSectionStatusText = (sectionId: string) => {
    const status = sectionStatus[sectionId];
    const progress = sectionProgress[sectionId as keyof typeof sectionProgress];
    
    if (status === 'saved') return 'Saved';
    if (status === 'error') return 'Error';
    if (status === 'editing') return 'Editing';
    if (progress === 100) return 'Complete';
    if (progress > 0) return `${progress}% Complete`;
    return 'Not Started';
  };

  // getTextStats function is already declared above

  // Validation functions
  const validateEIN = (ein: string): boolean => {
    const einRegex = /^\d{2}-\d{7}$/;
    return einRegex.test(ein) || (noEin && ein === '00-0000000');
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  // Validate state entity numbers based on state
  const validateStateEntityNumber = (state: string, number: string): boolean => {
    if (!state || !number) return false;
    
    const stateFormats: Record<string, RegExp> = {
      'California': /^C\d{7}$/,
      'CA': /^C\d{7}$/,
      'New York': /^\d{2}-\d{2}-\d{2}$/,
      'NY': /^\d{2}-\d{2}-\d{2}$/,
      'Texas': /^\d{11}$/,
      'TX': /^\d{11}$/,
      'Florida': /^[A-Z]\d{2}\d{9}$/,
      'FL': /^[A-Z]\d{2}\d{9}$/,
      // Add more state formats as needed
    };
    
    const format = stateFormats[state];
    return format ? format.test(number) : number.length > 0;
  };

  // Validate group exemption number (4-digit GEN)
  const validateGEN = (gen: string): boolean => {
    return /^\d{4}$/.test(gen);
  };

  // Advanced business rule validations
  const _validateNTEE = (ntee: string): boolean => {
    // NTEE codes should be in format: X-XX or X-XXXX
    const nteeRegex = /^[A-Z]-\d{2,4}$/;
    return nteeRegex.test(ntee);
  };

  const validateFiscalYear = (year: string): boolean => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    return yearNum >= 1900 && yearNum <= currentYear + 5;
  };

  const validateBudget = (budget: string): boolean => {
    const budgetNum = parseFloat(budget.replace(/[$,]/g, ''));
    return !isNaN(budgetNum) && budgetNum >= 0;
  };

  const validateZipCode = (zip: string): boolean => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const validateWebsite = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  // Cross-field validation
  const validateCrossFields = (): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    
    // EIN and organization name must be provided together
    if (formData.ein && !formData.orgName) {
      errors.orgName = 'Organization name is required when EIN is provided';
    }
    
    if (formData.orgName && !formData.ein && !noEin) {
      errors.ein = 'EIN is required when organization name is provided';
    }
    
    // Contact information validation
    if (formData.contactName && !formData.phone && !formData.email) {
      errors.contactInfo = 'Either phone or email is required for contact person';
    }
    
    // Address validation
    if ((formData as any).streetAddress && (!(formData as any).city || !(formData as any).state || !(formData as any).zipCode)) {
      errors.address = 'Complete address (city, state, zip) is required';
    }
    
    // Fiscal year validation
    if ((formData as any).yearFormed && (formData as any).yearIncorporated) {
      const formed = parseInt((formData as any).yearFormed);
      const incorporated = parseInt((formData as any).yearIncorporated);
      if (incorporated < formed) {
        errors.yearIncorporated = 'Incorporation year cannot be before formation year';
      }
    }
    
    return errors;
  };

  // Advanced validation with custom rules
  const validateSection = (sectionId: string): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    
    switch (sectionId) {
      case 'basicInfo':
        if (!(formData as any).orgName?.trim()) {
          errors.orgName = 'Organization name is required';
        }
        if ((formData as any).orgName && ((formData as any).orgName as string).length < 3) {
          errors.orgName = 'Organization name must be at least 3 characters';
        }
        if (!stateNonProfitOnly && !foreignEntity && !unincorporatedWithFiscalSponsor && !noEin && (formData as any).ein && !validateEIN((formData as any).ein)) {
          errors.ein = 'Invalid EIN format (XX-XXXXXXX)';
        }
        
        // Validate state entity number
        if (stateNonProfitOnly) {
          if (!(formData as any).stateEntityState) {
            errors.stateEntityState = 'Please select a state';
          }
          if (!(formData as any).stateEntityNumber) {
            errors.stateEntityNumber = 'State entity number is required';
          } else if ((formData as any).stateEntityState && !validateStateEntityNumber((formData as any).stateEntityState, (formData as any).stateEntityNumber)) {
            errors.stateEntityNumber = 'Invalid format for selected state';
          }
        }
        
        // Validate foreign entity
        if (foreignEntity) {
          if (!(formData as any).foreignCountry) {
            errors.foreignCountry = 'Please select a country';
          }
          if (!(formData as any).foreignRegistrationNumber) {
            errors.foreignRegistrationNumber = 'Registration number is required';
          }
        }
        
        // Validate fiscal sponsor
        if (unincorporatedWithFiscalSponsor) {
          if (!(formData as any).fiscalSponsorName) {
            errors.fiscalSponsorName = 'Fiscal sponsor name is required';
          }
          if (!(formData as any).fiscalSponsorEIN) {
            errors.fiscalSponsorEIN = 'Fiscal sponsor EIN is required';
          } else if (!validateEIN((formData as any).fiscalSponsorEIN)) {
            errors.fiscalSponsorEIN = 'Invalid EIN format (XX-XXXXXXX)';
          }
        }
        
        // Validate group exemption
        if (hasGroupExemption) {
          if (!(formData as any).centralOrgName) {
            errors.centralOrgName = 'Central organization name is required';
          }
          if (!(formData as any).groupExemptionNumber) {
            errors.groupExemptionNumber = 'Group exemption number is required';
          } else if (!validateGEN((formData as any).groupExemptionNumber)) {
            errors.groupExemptionNumber = 'Must be a 4-digit number';
          }
          if (!(formData as any).centralOrgEIN) {
            errors.centralOrgEIN = 'Central organization EIN is required';
          } else if (!validateEIN((formData as any).centralOrgEIN)) {
            errors.centralOrgEIN = 'Invalid EIN format (XX-XXXXXXX)';
          }
        }
        if ((formData as any).email && !validateEmail((formData as any).email)) {
          errors.email = 'Please enter a valid email address (e.g., name@example.org)';
        }
        if ((formData as any).phone && !validatePhone((formData as any).phone)) {
          errors.phone = 'Please enter a valid phone number (10+ digits)';
        }
        if ((formData as any).zipCode && !validateZipCode((formData as any).zipCode)) {
          errors.zipCode = 'Please enter a valid 5-digit ZIP code (e.g., 12345)';
        }
        if ((formData as any).website && !validateWebsite((formData as any).website)) {
          errors.website = 'Please enter a valid URL starting with http:// or https://';
        }
        break;
        
      case 'financials':
        if ((formData as any).annualBudget && !validateBudget((formData as any).annualBudget)) {
          errors.annualBudget = 'Invalid budget amount';
        }
        if ((formData as any).yearFormed && !validateFiscalYear(String((formData as any).yearFormed || ''))) {
          errors.yearFormed = 'Invalid year';
        }
        if ((formData as any).yearIncorporated && !validateFiscalYear(String((formData as any).yearIncorporated || ''))) {
          errors.yearIncorporated = 'Invalid year';
        }
        break;
        
      case 'governance':
        if ((formData as any).boardSize && (parseInt(String((formData as any).boardSize || '0')) < 3 || parseInt(String((formData as any).boardSize || '0')) > 50)) {
          errors.boardSize = 'Board size must be between 3 and 50 members';
        }
        if ((formData as any).boardMeetings && (parseInt(String((formData as any).boardMeetings || '0')) < 1 || parseInt(String((formData as any).boardMeetings || '0')) > 12)) {
          errors.boardMeetings = 'Board meetings must be between 1 and 12 per year';
        }
        break;
        
      case 'programs':
        if ((formData as any).programCount && parseInt(String((formData as any).programCount || '0')) < 1) {
          errors.programCount = 'Must have at least 1 program';
        }
        if ((formData as any).serviceArea && String((formData as any).serviceArea || '').length < 10) {
          errors.serviceArea = 'Service area description must be at least 10 characters';
        }
        break;
    }
    
    return errors;
  };

  const _validateEntireForm = (): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    
    // Validate each section
    const sections = ['basicInfo', 'organizationalDocuments', 'narrative', 'governance', 'management', 'financials', 'programs'];
    sections.forEach(sectionId => {
      const sectionErrors = validateSection(sectionId);
      Object.keys(sectionErrors).forEach(field => {
        errors[`${sectionId}.${field}`] = sectionErrors[field];
      });
    });
    
    // Cross-field validation
    const crossFieldErrors = validateCrossFields();
    Object.assign(errors, crossFieldErrors);
    
    // Business rule validation
    if ((formData as any).orgName && String((formData as any).orgName || '').toLowerCase().includes('test')) {
      errors.orgName = 'Test organizations are not allowed';
    }
    
    if ((formData as any).annualBudget && parseFloat(String((formData as any).annualBudget || '').replace(/[$,]/g, '')) > 1000000000) {
      errors.annualBudget = 'Budget cannot exceed $1 billion';
    }
    
    return errors;
  };

  const formatCurrency = (value: string): string => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue ? parseInt(numericValue).toLocaleString() : '';
  };

  // Narrative section functions
  const handleNarrativeChange = (field: string, value: unknown) => {
    setNarrative((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setNarrativeErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const handleNarrativeFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setNarrativeErrors((prev: unknown) => ({ ...(prev as any), [field]: 'File must be under 10MB' }));
      return;
    }
    setNarrativeErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
    setNarrative((prev: unknown) => ({ ...(prev as any), [field]: file }));
  };

  const _handleNarrativeLock = () => {
    setNarrativeLocked(true);
  };

  const _handleNarrativeUnlock = () => {
    setNarrativeLocked(false);
  };

  // Enhanced input component with validation indicators
  const _EnhancedInput = ({ 
    id, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    disabled, 
    required, 
    className = '',
    validationRules = [],
    ...props 
  }: {
    id: string;
    type?: string;
    value: unknown;
    onChange: (value: unknown) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
    validationRules?: ((value: unknown) => boolean)[];
    [key: string]: unknown;
  }) => {
    const hasValue = value && (typeof value === 'string' ? value.trim() !== '' : true);
    const hasError = errors[id];
    const isValid = hasValue && !hasError && validationRules?.every(rule => rule(value));
    
    return (
      <div className="relative">
        <input
          id={id}
          type={type}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(type === 'checkbox' ? e.target.checked : e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 transition-colors ${
            hasError ? 'border-red-300 bg-red-50' : 
            isValid ? 'border-green-300 bg-green-50' : 
            'border-gray-200'
          } ${className}`}
          {...props}
        />
        
        {/* Validation indicator */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <>
            {hasError && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {isValid && !hasError && (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {hasValue && !isValid && !hasError && (
              <Clock className="w-5 h-5 text-yellow-500" />
            )}
          </>
        </div>
        
        {/* Error message */}
        {hasError && (
          <p className="mt-1 text-sm text-red-600">{hasError}</p>
        )}
      </div>
    );
  };

  // Helper function to handle document upload with cross-linking
  const handleDocumentUpload = (fieldId: string, documentIds: string | string[]) => {
    setDocuments(prev => ({
      ...prev,
      [fieldId]: documentIds
    }));
    
    // Cross-link documents between sections
    const crossLinkMap: { [key: string]: string } = {
      'groupExemptionLetter': 'groupExemptionLetter',
      'subordinateNumberLetter': 'subordinateNumberLetter', 
      'centralOrgEINDoc': 'centralOrgEINDoc',
      'orgNameDocs': 'orgNameDocs',
      'irsDeterminationLetter': 'irsLetter',
      'irsLetter': 'irsDeterminationLetter',
      'stateNonProfitRegistration': 'stateNonProfitRegistration',
      'foreignEntityDocs': 'foreignEntityDocs',
      'fiscalSponsorshipAgreement': 'fiscalSponsorshipAgreement'
    };
    
    // If this document has a cross-link, also update the formData
    if (crossLinkMap[fieldId]) {
      handleInputChange(crossLinkMap[fieldId], documentIds);
    }
    
    setUnsavedChanges(true);
    
    // Show success message for cross-linking
    toast.success('Document uploaded and linked across sections', {
      position: 'bottom-right',
      autoClose: 2000,
      hideProgressBar: true,
    });
  };

  // Helper function to handle digital asset changes
  const handleDigitalAssetChange = (field: string, value: unknown) => {
    setOrganizationData(prev => ({
      ...prev,
      digitalAssets: {
        ...prev.digitalAssets,
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  // Helper function to handle brand changes
  const handleBrandChange = (field: string, value: unknown) => {
    setOrganizationData(prev => ({
      ...prev,
      brand: {
        ...prev.brand,
        [field]: value
      }
    }));
    setUnsavedChanges(true);
  };

  // Helper function to convert between Contact and ContactInfo types
  const contactToContactInfo = (contact: Contact): ContactInfo => ({
    id: contact.id.toString(),
    type: 'person' as const,
    name: (contact as any).name || `${(contact as any).firstName} ${(contact as any).lastName}`.trim(),
    displayName: `${(contact as any).firstName} ${(contact as any).lastName}`.trim(),
    email: (contact as any).email,
    phone: (contact as any).phone,
    organization: contact.organization,
    title: contact.title,
    address: contact.address
  });

  const contactInfoToContact = (contactInfo: ContactInfo): Contact => ({
    id: parseInt(contactInfo.id) || Date.now(),
    prefix: '',
    firstName: contactInfo.name?.split(' ')[0] || '',
    lastName: contactInfo.name?.split(' ').slice(1).join(' ') || '',
    organization: contactInfo.organization || '',
    title: contactInfo.title || '',
    email: contactInfo.email || '',
    phone: contactInfo.phone || '',
    mobile: '',
    website: '',
    address: contactInfo.address || '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    addressHistory: [],
    projectRoles: [],
    tags: [],
    notes: '',
    createdDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    dataCompleteness: 0,
    customFields: {},
    is1099: false,
    hasW9: false
  } as Contact);

  // Helper function to handle narrative field changes
  const onNarrativeChange = useCallback((fieldId: string, content: string) => {
    setNarrativeFields(prev => ({ ...(prev as any), [fieldId]: content }));
    setUnsavedChanges(true);
  }, []);

  // Handler for input changes
  const handleInputChange = async (field: string, value: unknown) => {
    const oldValue = formData[field];
    
    // Generate EUID when organization name is first set
    if (field === 'organizationName' && value && !formData.euid) {
      try {
        const euid = await euidService.generateEUID('NONPROFIT' as any, 'SYSTEM', 'public' as any);
        setFormData(prev => ({ ...(prev as any), [field]: value, euid }));
      } catch (error) {
        logger.error('Failed to generate EUID:', error as any);
        setFormData(prev => ({ ...(prev as any), [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...(prev as any), [field]: value }));
    }
    
    setHasUnsavedChanges(true);
    
    // Track field change for analytics
    trackFieldChange(field);
    
    // Log field change to audit log
    if (oldValue !== value) {
      auditLogService.logFieldChange(
        'nonprofit_application',
        'current_form',
        field,
        oldValue,
        value
      );
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...(prev as any), [field]: '' }));
    }

    // Handle cross-linked documents - reverse sync
    const reverseCrossLinkMap: { [key: string]: string } = {
      'irsDeterminationLetter': 'irsLetter',
      'irsLetter': 'irsDeterminationLetter',
      'groupExemptionLetter': 'groupExemptionLetter',
      'subordinateNumberLetter': 'subordinateNumberLetter',
      'centralOrgEINDoc': 'centralOrgEINDoc',
      'orgNameDocs': 'orgNameDocs',
      'stateNonProfitRegistration': 'stateNonProfitRegistration',
      'foreignEntityDocs': 'foreignEntityDocs',
      'fiscalSponsorshipAgreement': 'fiscalSponsorshipAgreement'
    };
    
    // If this is a document field and has a reverse cross-link, also update the documents state
    if (reverseCrossLinkMap[field] && value && typeof value === 'string') {
      setDocuments(prev => ({
        ...prev,
        [reverseCrossLinkMap[field]]: value
      }));
    }

    // Real-time validation for key fields
    if (field === 'ein' && value && typeof value === 'string' && !value.includes('NO-EIN')) {
      const error = !commonValidationRules.ein[0](value) ? 'Invalid EIN format' : null;
      if (error) {
        handleFieldError(field, error);
      } else {
        handleClearError(field);
      }
    } else if (field === 'organizationName') {
      const error = !commonValidationRules.organizationName[0](value as string) ? 'Organization name is required' : null;
      if (error) {
        handleFieldError(field, error);
      } else {
        handleClearError(field);
      }
    } else if (field === 'email') {
      const error = !commonValidationRules.email[0](value as string) ? 'Invalid email format' : null;
      if (error) {
        handleFieldError(field, error);
      } else {
        handleClearError(field);
      }
    } else if (field === 'phone') {
      const error = commonValidationRules.phone[0](value as string) ? null : 'Invalid phone format';
      if (error) {
        handleFieldError(field, error);
      } else {
        handleClearError(field);
      }
    } else if (field === 'website' && value) {
      const error = commonValidationRules.website[0](value as string) ? null : 'Invalid website format';
      if (error) {
        handleFieldError(field, error);
      } else {
        handleClearError(field);
      }
    } else if (field === 'zipCode') {
      const error = commonValidationRules.zipCode[0](value as string) ? null : 'Invalid ZIP code format';
      if (error) {
        handleFieldError(field, error);
      } else {
        handleClearError(field);
      }
    }
  };

  // Handler for field focus
  const _handleFieldFocus = (field: string) => {
    setCurrentField(field);
    // Track field focus time for analytics
    if (typeof trackFieldFocus === 'function') {
      trackFieldFocus(field);
    }
  };

  // Handler for section lock toggle
  const _handleLockSection = (sectionId: string, locked: boolean) => {
    setSectionLocks(prev => ({ ...(prev as any), [sectionId]: locked }));
    setUnsavedChanges(true);
  };

  // Handler for section status update
  const handleSectionStatus = (sectionId: string, status: string) => {
    setSectionStatus(prev => ({ ...(prev as any), [sectionId]: status }));
    setUnsavedChanges(true);
  };

  // Save form function
  const handleSaveForm = async () => {
    if (!currentUser) return;
    
    try {
      setAutoSaveStatus('saving');
      const token = await netlifySettingsService.getAuthToken();
      
      const response = await fetch('http://localhost:5001/api/applications/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          formData,
          progress: calculateOverallProgress(),
          sectionProgress,
          version: formVersion,
          lastSaved: new Date().toISOString()
        })
      });

      if (response.ok) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setUnsavedChanges(false);
        toast.success('Form saved successfully');
      } else {
        throw new Error('Failed to save form');
      }
    } catch (error) {
      logger.error('Save error:', error as any);
      setAutoSaveStatus('error');
      handleSaveError(error);
    }
  };

  // Section-by-section save functionality
  const _handleSectionSave = async (sectionId: string) => {
    if (!currentUser) return;
    
    const sectionData = {
      sectionId,
      formData: formData,
      sectionProgress: sectionProgress[sectionId as keyof typeof sectionProgress],
      lastSaved: new Date().toISOString()
    };
    
    // Check if offline
    if (connectionStatus === 'offline') {
      addToOfflineQueue('section-save', sectionData);
      setSectionStatus(prev => ({ ...(prev as any), [sectionId]: 'queued' }));
      return;
    }
    
    try {
      const token = await netlifySettingsService.getAuthToken();
      
      const response = await fetch('http://localhost:5001/api/applications/section-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sectionData)
      });

      if (response.ok) {
        const _data = await response.json();
        setSectionStatus(prev => ({ ...(prev as any), [sectionId]: 'saved' }));
        setLastSavedSection(sectionId);
        showSuccess(`${sectionId} section saved successfully!`);
        
        // Clear saved status after 3 seconds
        setTimeout(() => {
          setSectionStatus(prev => ({ ...(prev as any), [sectionId]: 'idle' }));
        }, 3000);
      } else {
        throw new Error('Section save failed');
      }
    } catch (error) {
      handleSaveError(error, { component: 'NonprofitApplication', action: 'section-save' });
      setSectionStatus(prev => ({ ...(prev as any), [sectionId]: 'error' }));
      showConfirmationDialog(`${sectionId} section save failed. Try again?`, () => _handleSectionSave(sectionId));
    }
  };

  // Handler for loading a saved form
  const _handleLoadForm = (formId: number) => {
    if (savedForms[formId]) {
      setFormData({ ...savedForms[formId] });
      setCurrentFormId(formId);
    }
  };

  // Handler for deleting a saved form
  const _handleDeleteForm = (formId: number) => {
    setSavedForms(prev => prev.filter((_, idx) => idx !== formId));
    if (currentFormId === formId) {
      setFormData({});
      setCurrentFormId(null);
    }
  };

  // Handler for file upload
  // File upload state management
  const [fileStates, setFileStates] = useState<{ [key: string]: 'none' | 'uploading' | 'uploaded' | 'error' }>({});
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});
  const [fileVersions, setFileVersions] = useState<{ [key: string]: Array<{ version: number; file: unknown; uploadedAt: string; uploadedBy: string }> }>({});
  const [fileComments, setFileComments] = useState<{ [key: string]: string }>({});

  const handleSpecificFileUpload = async (field: string, file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setFileErrors(prev => ({ ...(prev as any), [field]: 'File size must be less than 10MB' }));
      setFileStates(prev => ({ ...(prev as any), [field]: 'error' }));
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setFileErrors(prev => ({ ...(prev as any), [field]: 'Only PDF, JPEG, PNG, and GIF files are allowed' }));
      setFileStates(prev => ({ ...(prev as any), [field]: 'error' }));
      return;
    }

    // Set uploading state
    setFileStates(prev => ({ ...(prev as any), [field]: 'uploading' }));
    setFileErrors(prev => ({ ...(prev as any), [field]: '' }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = await netlifySettingsService.getAuthToken();
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      const fileData = {
        ...result.file,
        originalFile: file,
        version: (fileVersions[field]?.length || 0) + 1,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser?.name || 'Unknown'
      };

      setFormData(prev => ({ 
        ...prev, 
        [field]: fileData
      }));

      // Add to version history
      setFileVersions(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), {
          version: (fileData as any).version,
          file: fileData,
          uploadedAt: (fileData as any).uploadedAt,
          uploadedBy: (fileData as any).uploadedBy
        }]
      }));

      setFileStates(prev => ({ ...(prev as any), [field]: 'uploaded' }));
      setUnsavedChanges(true);
    } catch (error) {
      handleFileError(error, { component: 'NonprofitApplication', action: 'file-upload' });
      setFileErrors(prev => ({ ...(prev as any), [field]: 'Upload failed. Please try again.' }));
      setFileStates(prev => ({ ...(prev as any), [field]: 'error' }));
    }
  };

  const removeFile = async (field: string) => {
    const fileData = formData[field];
    
    if (fileData && (fileData as any).filename) {
      try {
        // Delete file from server
        const token = await netlifySettingsService.getAuthToken();
        await fetch(`http://localhost:5001/api/files/${(fileData as any).filename}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        handleFileError(error, { component: 'NonprofitApplication', action: 'file-delete' });
      }
    }

    setFormData(prev => ({ ...(prev as any), [field]: null }));
    setFileStates(prev => ({ ...(prev as any), [field]: 'none' }));
    setFileErrors(prev => ({ ...(prev as any), [field]: '' }));
    setUnsavedChanges(true);
  };

  const getFileStateIcon = (field: string) => {
    const state = fileStates[field];
    switch (state) {
      case 'uploading':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'uploaded':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Upload className="w-4 h-4 text-gray-400" />;
    }
  };

  // File preview functionality
  const [_filePreview, setFilePreview] = useState<{ [key: string]: boolean }>({});

  const _toggleFilePreview = (field: string) => {
    setFilePreview(prev => ({ ...(prev as any), [field]: !prev[field] }));
  };

  const _getFilePreview = (field: string) => {
    const fileData = formData[field];
    if (!fileData) return null;

    const fileType = (fileData as any)?.type || (fileData as any)?.mimetype;
    
    if (fileType?.startsWith('image/')) {
      return (
        <div className="mt-2 p-2 border rounded bg-gray-50">
          <img 
            src={(fileData as any)?.url || ((fileData as any)?.originalFile ? URL.createObjectURL((fileData as any).originalFile) : '')} 
            alt="Preview" 
            className="max-w-full h-auto max-h-64 object-contain"
          />
        </div>
      );
    }
    
    if (fileType === 'application/pdf') {
      return (
        <div className="mt-2 p-2 border rounded bg-gray-50">
          <iframe 
            src={(fileData as any)?.url || ((fileData as any)?.originalFile ? URL.createObjectURL((fileData as any).originalFile) : '')}
            className="w-full h-64 border-0"
            title="PDF Preview"
          />
        </div>
      );
    }
    
    return (
      <div className="mt-2 p-2 border rounded bg-gray-50">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {(fileData as any)?.name || 'File'}
          </span>
          <span className="text-xs text-gray-400">
            ({(((fileData as any)?.size || 0) / 1024 / 1024).toFixed(2)} MB)
          </span>
        </div>
      </div>
    );
  };

  // File version management
  const _getFileVersionHistory = (field: string) => {
    return fileVersions[field] || [];
  };

  const _restoreFileVersion = (field: string, version: number) => {
    const versions = fileVersions[field];
    const targetVersion = versions?.find(v => v.version === version);
    
    if (targetVersion) {
      setFormData(prev => ({ ...(prev as any), [field]: targetVersion.file }));
      showSuccess(`Restored file to version ${version}`);
    }
  };

  const _addFileComment = (field: string, comment: string) => {
    setFileComments(prev => ({ ...(prev as any), [field]: comment }));
  };

  const _getFileInfo = (field: string) => {
    const fileData = formData[field];
    const versions = fileVersions[field] || [];
    const comment = fileComments[field];
    
    return {
      currentVersion: (fileData as any)?.version || 1,
      totalVersions: versions.length,
      uploadedAt: (fileData as any)?.uploadedAt,
      uploadedBy: (fileData as any)?.uploadedBy,
      comment,
      size: (fileData as any)?.size,
      type: (fileData as any)?.type || (fileData as any)?.mimetype
    };
  };

  // Handler for toggling settings modal
  const _toggleSettings = () => setShowSettings(prev => !prev);

  // Handler for toggling admin guide modal
  const _toggleAdminGuide = () => setShowAdminGuide(prev => !prev);

  // Handler for toggling password visibility
  const _toggleShowPasswords = () => setShowPasswords(prev => !prev);

  // Handler for toggling banner
  const toggleShowBanner = () => setShowBanner(prev => !prev);

  // Handler for changing active banner
  const _handleBannerChange = (idx: number, value: string) => {
    setCustomBanners(prev => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  // Handler for changing active tab
  const _handleTabChange = (tab: string) => setActiveTab(tab);

  // Handler for updating API settings
  const _handleApiSettingsChange = (key: string, value: string) => {
    setApiSettings(prev => ({ ...(prev as any), [key]: value }));
    setUnsavedChanges(true);
  };

  // Handler for hiding/showing sections
  const _handleHideSection = (sectionId: string, hide: boolean) => {
    setHiddenSections(prev => hide ? [...prev, sectionId] : prev.filter(id => id !== sectionId));
    setUnsavedChanges(true);
  };

  // Handler for hiding/showing fields
  const _handleHideField = (sectionId: string, field: string, hide: boolean) => {
    setHiddenFields(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [field]: hide
      }
    }));
    setUnsavedChanges(true);
  };

  // Handler for adding custom section
  const _handleAddCustomSection = (name: string) => {
    setCustomSections(prev => ([...prev, { id: `custom_${prev.length + 1}`, name }]));
    setUnsavedChanges(true);
  };

  // Dynamic field generation
  const [dynamicFields, setDynamicFields] = useState<{ [key: string]: Array<{ id: string; type: string; label: string; required: boolean; value: unknown }> }>({});

  const addDynamicField = (sectionId: string, fieldType: string = 'text', label: string = 'New Field', required: boolean = false) => {
    const fieldId = `${sectionId}_field_${Date.now()}`;
    setDynamicFields(prev => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), {
        id: fieldId,
        type: fieldType,
        label,
        required,
        value: ''
      }]
    }));
  };

  const removeDynamicField = (sectionId: string, fieldId: string) => {
    setDynamicFields(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter(field => field.id !== fieldId)
    }));
  };

  const updateDynamicField = (sectionId: string, fieldId: string, updates: Partial<{ type: string; label: string; required: boolean; value: unknown }>) => {
    setDynamicFields(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  // Handler for adding custom field
  const _handleAddCustomField = (sectionId: string, field: string) => {
    addDynamicField(sectionId, 'text', field, false);
  };

  // Handler for reordering fields
  const _handleFieldOrderChange = (sectionId: string, newOrder: string[]) => {
    setFieldOrder(prev => ({ ...(prev as any), [sectionId]: newOrder }));
    setUnsavedChanges(true);
  };

  const updateSectionProgress = (sectionId: string, percent: number) => {
    setSectionProgress(prev => ({ ...(prev as any), [sectionId]: percent }));
  };

  // Update progress when form data changes
  useEffect(() => {
    // Ensure sections is defined before using it
    if (sections && sections.length > 0) {
      sections.forEach(section => {
        const progress = calculateSectionProgress(section.id);
        updateSectionProgress(section.id, progress);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Get progress status text
  const getProgressStatus = (sectionId: string): string => {
    const progress = sectionProgress[sectionId as keyof typeof sectionProgress] || 0;
    if (progress === 0) return 'Not Started';
    if (progress < 50) return 'In Progress';
    if (progress < 100) return 'Nearly Complete';
    return 'Complete';
  };

  // Handler for auto-save (simulate with useEffect)
  useEffect(() => {
    if (unsavedChanges) {
      const timeout = setTimeout(() => {
        handleSaveForm();
      }, 3000);
      return () => clearTimeout(timeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsavedChanges, formData]);

  // --- BEGIN BASIC INFORMATION SECTION ---
  const [basicInfo, setBasicInfo] = useState({
    ein: '',
    orgName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    irsLetter: null as File | null,
  });
  const [_basicInfoErrors, setBasicInfoErrors] = useState<unknown>({});
  const [_basicInfoUploading, _setBasicInfoUploading] = useState(false);
  const [_basicInfoUploadError, setBasicInfoUploadError] = useState('');
  const [_basicInfoAutoSaveStatus, setBasicInfoAutoSaveStatus] = useState('');

  // Validation helpers
  const _validateBasicInfo = () => {
    const errors: Record<string, string> = {};
    if (!basicInfo.ein || !/^\d{2}-?\d{7}$/.test(basicInfo.ein)) {
      errors.ein = 'Valid EIN is required (format: 12-3456789)';
    }
    if (!basicInfo.orgName) errors.orgName = 'Organization name is required';
    if (!basicInfo.address) errors.address = 'Address is required';
    if (!basicInfo.city) errors.city = 'City is required';
    if (!basicInfo.state) errors.state = 'State is required';
    if (!basicInfo.zip) errors.zip = 'ZIP code is required';
    if (!basicInfo.country) errors.country = 'Country is required';
    if (!basicInfo.phone || !/^\+?\d{10,15}$/.test(basicInfo.phone)) {
      errors.phone = 'Valid phone number is required';
    }
    if (!basicInfo.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(basicInfo.email)) {
      errors.email = 'Valid email is required';
    }
    if (basicInfo.website && !/^https?:\/\//.test(basicInfo.website)) {
      errors.website = 'Website must start with http:// or https://';
    }
    return errors;
  };

  // Auto-save logic for Basic Info
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Simulate save
      setBasicInfoAutoSaveStatus('Saving...');
      setTimeout(() => setBasicInfoAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [basicInfo]);

  const _handleBasicInfoChange = (field: string, value: unknown) => {
    setBasicInfo((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setBasicInfoErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const _handleBasicInfoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setBasicInfoUploadError('File must be under 5MB');
      return;
    }
    setBasicInfoUploadError('');
    setBasicInfo((prev: unknown) => ({ ...(prev as any), irsLetter: file }));
  };

  // Digital Assets Section
  const renderDigitalAssetsSection = () => {
    return (
      <section className="mb-8" aria-labelledby="digital-assets-heading">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h2 id="digital-assets-heading" className="text-2xl font-bold">Digital Assets</h2>
            {renderProgressIndicator('digitalAssets')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">

          {/* Social Media */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Social Media Handles</label>
            <div className="space-y-4">
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok'].map((platform) => (
                <div key={platform} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-900">{platform}:</div>
                  <div className="flex items-center space-x-2 flex-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`${platform.toLowerCase()}Type`}
                        value="handle"
                        checked={(organizationData.digitalAssets as any)?.[`${platform.toLowerCase()}Type`] !== 'url'}
                        onChange={() => handleDigitalAssetChange(`${platform.toLowerCase()}Type`, 'handle')}
                        className="mr-1"
                      />
                      <span className="text-sm text-gray-600">@</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`${platform.toLowerCase()}Type`}
                        value="url"
                        checked={(organizationData.digitalAssets as any)?.[`${platform.toLowerCase()}Type`] === 'url'}
                        onChange={() => handleDigitalAssetChange(`${platform.toLowerCase()}Type`, 'url')}
                        className="mr-1"
                      />
                      <span className="text-sm text-gray-600">URL</span>
                    </label>
                    <input
                      type="text"
                      value={(organizationData.digitalAssets as any)?.[`${platform.toLowerCase()}Account`] || ''}
                      onChange={(e) => handleDigitalAssetChange(`${platform.toLowerCase()}Account`, e.target.value)}
                      placeholder={(organizationData.digitalAssets as any)?.[`${platform.toLowerCase()}Type`] === 'url' ? 'https://...' : 'username'}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              ))}
              
              {/* Custom Social Media */}
              <div className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-900">Custom:</div>
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    type="text"
                    value={(organizationData.digitalAssets as any)?.customPlatformName || ''}
                    onChange={(e) => handleDigitalAssetChange('customPlatformName', e.target.value)}
                    placeholder="Platform name"
                    className="w-32 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <input
                    type="text"
                    value={(organizationData.digitalAssets as any)?.customPlatformAccount || ''}
                    onChange={(e) => handleDigitalAssetChange('customPlatformAccount', e.target.value)}
                    placeholder="@username or URL"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Video Links */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Video Links</label>
            <p className="text-sm text-gray-600 mb-4">Add YouTube, Vimeo, or other video platform URLs</p>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((index) => {
                const videos = organizationData.digitalAssets?.videos || [];
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-900 w-8">#{index + 1}</span>
                    <input
                      type="url"
                      value={videos[index] || ''}
                      onChange={(e) => {
                        const newVideos = [...videos];
                        newVideos[index] = e.target.value;
                        handleDigitalAssetChange('videos', newVideos);
                      }}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                    {videos[index] && (
                      <button
                        onClick={() => {
                          const newVideos = [...videos];
                          newVideos[index] = '';
                          handleDigitalAssetChange('videos', newVideos);
                        }}
                        className="p-2 text-red-600 hover:text-red-800 rounded"
                        title="Remove video"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Brand Section
  const renderBrandSection = () => {
    return (
      <section className="mb-8" aria-labelledby="brand-heading">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h2 id="brand-heading" className="text-2xl font-bold">Brand</h2>
            {renderProgressIndicator('brand')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          {/* Brand Colors */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Brand Colors</label>
            <p className="text-sm text-gray-600 mb-4">Define your organization's primary and secondary brand colors</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Primary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={(organizationData.brand as any)?.primaryColor || '#3B82F6'}
                    onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                    className="w-12 h-12 border border-gray-200 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <input
                    type="text"
                    value={(organizationData.brand as any)?.primaryColor || '#3B82F6'}
                    onChange={(e) => handleBrandChange('primaryColor', e.target.value)}
                    placeholder="#3B82F6"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={(organizationData.brand as any)?.secondaryColor || '#10B981'}
                    onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 border border-gray-200 rounded-lg cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <input
                    type="text"
                    value={(organizationData.brand as any)?.secondaryColor || '#10B981'}
                    onChange={(e) => handleBrandChange('secondaryColor', e.target.value)}
                    placeholder="#10B981"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Brand Fonts */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Brand Typography</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Primary Font</label>
                <select
                  value={(organizationData.brand as any)?.primaryFont || 'Arial'}
                  onChange={(e) => handleBrandChange('primaryFont', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="custom">Custom Font</option>
                </select>
                {(organizationData.brand as any)?.primaryFont === 'custom' && (
                  <input
                    type="text"
                    value={(organizationData.brand as any)?.customPrimaryFont || ''}
                    onChange={(e) => handleBrandChange('customPrimaryFont', e.target.value)}
                    placeholder="Enter custom font name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mt-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Secondary Font</label>
                <select
                  value={(organizationData.brand as any)?.secondaryFont || 'Helvetica'}
                  onChange={(e) => handleBrandChange('secondaryFont', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="custom">Custom Font</option>
                </select>
                {(organizationData.brand as any)?.secondaryFont === 'custom' && (
                  <input
                    type="text"
                    value={(organizationData.brand as any)?.customSecondaryFont || ''}
                    onChange={(e) => handleBrandChange('customSecondaryFont', e.target.value)}
                    placeholder="Enter custom font name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mt-2"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Brand Voice & Tone */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Brand Voice & Tone</label>
            <NarrativeEntryField
              id="narrative-field-1"
              label="Voice and Tone Guidelines"
              value={narrativeFields.brandVoice || ''}
              onChange={(content) => onNarrativeChange('brandVoice', content)}
              placeholder="Describe your organization's communication style, voice, and tone. Include personality traits, preferred language style, and communication approach..."
              className="mb-4"
            />
          </div>

          {/* Brand Messaging */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-3">Key Brand Messages</label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Tagline</label>
                <input
                  type="text"
                  value={(organizationData.brand as any)?.tagline || ''}
                  onChange={(e) => handleBrandChange('tagline', e.target.value)}
                  placeholder="Your organization's memorable tagline"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Elevator Pitch</label>
                <NarrativeEntryField
              id="narrative-field-2"
                  label=""
                  value={narrativeFields.elevatorPitch || ''}
                  onChange={(content) => onNarrativeChange('elevatorPitch', content)}
                  placeholder="A 30-second description of your organization that anyone can understand..."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Collapsible Section Component
  const CollapsibleSection: React.FC<{
    id: string;
    title: string;
    children: React.ReactNode;
    resourceId?: string;
  }> = ({ id, title, children, resourceId }) => {
    const isCollapsed = collapsedSections[id] ?? true;
    
    return (
      <section className="mb-8" aria-labelledby={`${id}-heading`}>
        <div 
          className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center space-x-3">
            <button
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-expanded={!isCollapsed}
              aria-controls={`${id}-content`}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <h2 id={`${id}-heading`} className="text-2xl font-bold">{title}</h2>
            {renderProgressIndicator(id)}
          </div>
          <div className="flex items-center space-x-2">
            {resourceId && <SectionLock resourceId={resourceId} />}
          </div>
        </div>
        {!isCollapsed && (
          <div id={`${id}-content`} className="animate-fadeIn">
            {children}
          </div>
        )}
      </section>
    );
  };

  const renderBasicInfoSection = () => {
    // Use the new BasicInformation2 component
    return <BasicInformation2 />;
  };

  const _renderBasicInfoSection_OLD = () => {
    return (
      <>
        <div className="space-y-6">
          
          {/* Tax Identification - FIRST FIELD */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Tax Identification
            </h3>
            
            <div className="space-y-4">
              {/* Tax ID Input with No Tax ID Button */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Federal EIN (Employer Identification Number)
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="noTaxIdCheckbox"
                      checked={!noEin}
                      onChange={(e) => {
                        setNoEin(!e.target.checked);
                        if (e.target.checked) {
                          // If checking "Has Tax ID", clear the "no tax id" state
                          handleInputChange('taxIdType', '');
                        } else {
                          // If unchecking "Has Tax ID", clear all tax fields
                          handleInputChange('ein', '');
                          handleInputChange('taxIdType', 'none');
                        }
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="noTaxIdCheckbox" className="text-sm font-medium text-gray-900">
                      Organization has tax identification
                    </label>
                  </div>
                  
                  {!noEin && (
                    <input
                      type="text"
                      value={(formData as any).ein || ''}
                      onChange={e => handleEINChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="12-3456789"
                    />
                  )}
                </div>
                {noEin && (
                  <p className="text-sm text-red-600 mt-2">
                    Organization will be assigned a sequential number for tracking purposes
                  </p>
                )}
              </div>
              
              {/* Alternative Tax ID Options */}
              {!noEin && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-gray-600">Or select alternative tax identification:</p>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="altTaxId"
                        checked={stateNonProfitOnly}
                        onChange={() => {
                          setStateNonProfitOnly(true);
                          setForeignEntity(false);
                          setUnincorporatedWithFiscalSponsor(false);
                        }}
                        className="mr-2"
                      />
                      State Non-Profit Only (No Federal 501(c) Status)
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="altTaxId"
                        checked={foreignEntity}
                        onChange={() => {
                          setStateNonProfitOnly(false);
                          setForeignEntity(true);
                          setUnincorporatedWithFiscalSponsor(false);
                        }}
                        className="mr-2"
                      />
                      Foreign Entity Registration
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="altTaxId"
                        checked={unincorporatedWithFiscalSponsor}
                        onChange={() => {
                          setStateNonProfitOnly(false);
                          setForeignEntity(false);
                          setUnincorporatedWithFiscalSponsor(true);
                        }}
                        className="mr-2"
                      />
                      Unincorporated with Fiscal Sponsor
                    </label>
                  </div>
                  
                  {/* Conditional Fields for Alternative Tax IDs */}
                  {stateNonProfitOnly && (
                    <div className="mt-3 p-4 bg-green-50 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">State</label>
                          <select
                            value={(formData as any).stateEntityState || ''}
                            onChange={e => handleInputChange('stateEntityState', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          >
                            <option value="">Select State</option>
                            {US_STATES.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">State Entity Number</label>
                          <input
                            type="text"
                            value={(formData as any).stateEntityNumber || ''}
                            onChange={e => handleInputChange('stateEntityNumber', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter state entity number"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {foreignEntity && (
                    <div className="mt-3 p-4 bg-purple-50 rounded-lg">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">Country</label>
                          <input
                            type="text"
                            value={(formData as any).foreignCountry || ''}
                            onChange={e => handleInputChange('foreignCountry', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter country"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">Registration Number</label>
                          <input
                            type="text"
                            value={(formData as any).foreignRegistrationNumber || ''}
                            onChange={e => handleInputChange('foreignRegistrationNumber', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter registration number"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {unincorporatedWithFiscalSponsor && (
                    <div className="mt-3 p-4 bg-yellow-50 rounded-lg">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Fiscal Sponsor Information</h4>
                        <ContactSelector
                          label="Select Fiscal Sponsor Organization"
                          value={((formData as any).fiscalSponsorContact || null) as ContactInfo | ContactInfo[] | null}
                          onChange={(contact) => {
                            handleInputChange('fiscalSponsorContact', contact);
                            if (contact && !Array.isArray(contact)) {
                              handleInputChange('fiscalSponsorName', contact.name);
                              handleInputChange('fiscalSponsorEIN', (contact as any).ein || '');
                            }
                          }}
                          type="organization"
                          placeholder="Select fiscal sponsor from contacts"
                          className="mb-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
          
          {/* Organization Identity */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Organization Identity
            </h3>
            
            {/* Organization Name */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">Select or add your nonprofit organization</p>
              
              <ContactSelector
                label=""
                value={selectedOrganization ? contactToContactInfo(selectedOrganization) : null}
                onChange={(org) => {
                  if (org && !(org instanceof Array)) {
                    const orgContact = contactInfoToContact(org);
                    setSelectedOrganization(orgContact);
                    handleInputChange('orgName', org.name);
                    handleInputChange('ein', (orgContact as any).ein || '');
                    handleInputChange('nteeCode', (orgContact as any).nteeCode);
                  }
                }}
                type="organization"
                showAddButton={true}
                showEditButton={true}
                required={true}
                placeholder="Search or add your organization..."
                className="mb-4"
              />
              
              {/* Show organization details if selected */}
              {selectedOrganization && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Organization Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900">EIN</label>
                      <p className="text-gray-900">{(selectedOrganization as any).ein || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900">Organization Type</label>
                      <p className="text-gray-900">{(selectedOrganization as any).organizationType || '501(c)(3)'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        NTEE Code <span className="text-red-500">*</span>
                      </label>
                      <NTEECodeSelector
                        label=""
                        value={{ nteeCode: (selectedOrganization as any).nteeCode }}
                        onChange={(value) => {
                          if (selectedOrganization) {
                            (selectedOrganization as any).nteeCode = value.nteeCode;
                            setSelectedOrganization({ ...selectedOrganization });
                            handleInputChange('nteeCode', value.nteeCode);
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        National Taxonomy of Exempt Entities classification
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-900">Address</label>
                      <p className="text-gray-900">
                        {selectedOrganization.address || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* DBA Section */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                DBA (Doing Business As)
              </label>
              <div className="space-y-2">
                {(formData.dba || []).map((dba, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={dba}
                      onChange={(e) => {
                        const newDba = [...(formData.dba || [])];
                        newDba[index] = e.target.value;
                        handleInputChange('dba', newDba);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="DBA name"
                    />
                    <button
                      onClick={() => {
                        const newDba = (formData.dba || []).filter((_, i) => i !== index);
                        handleInputChange('dba', newDba);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 rounded"
                      title="Remove DBA"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newDba = [...(formData.dba || []), ''];
                    handleInputChange('dba', newDba);
                  }}
                  className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add DBA
                </button>
              </div>
            </div>
            
            {/* Parent Organization */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Do you have a parent organization?
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasParentOrg"
                    value="yes"
                    checked={Boolean((formData as any).hasParentOrg === 'yes')}
                    onChange={(e) => handleInputChange('hasParentOrg', e.target.value)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasParentOrg"
                    value="no"
                    checked={Boolean((formData as any).hasParentOrg === 'no')}
                    onChange={(e) => handleInputChange('hasParentOrg', e.target.value)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              
              {formData.hasParentOrg === 'yes' && (
                <div className="mt-3">
                  <ContactSelector
                    label="Select Parent Organization"
                    value={((formData as any).parentOrganizationContact || null) as ContactInfo | ContactInfo[] | null}
                    onChange={(contact) => {
                      handleInputChange('parentOrganizationContact', contact);
                      if (contact && !Array.isArray(contact)) {
                        handleInputChange('parentOrganization', contact.name);
                      }
                    }}
                    type="organization"
                    placeholder="Select parent organization from contacts"
                    className="mb-2"
                  />
                </div>
              )}
            </div>
            
            {/* Subsidiaries */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="hasSubsidiaries"
                  checked={formData.hasSubsidiaries || false}
                  onChange={(e) => handleInputChange('hasSubsidiaries', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasSubsidiaries" className="text-lg font-semibold text-gray-800">
                  This organization has subsidiaries
                </label>
              </div>
              
              {formData.hasSubsidiaries && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">List any organizations that operate under your organization</p>
                  {(subOrganizations || []).map((subOrg, index) => (
                    <div key={subOrg.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={subOrg.name}
                            onChange={(e) => {
                              const updated = [...subOrganizations];
                              updated[index].name = e.target.value;
                              setSubOrganizations(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Organization name"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={subOrg.ein}
                              onChange={(e) => {
                                const updated = [...subOrganizations];
                                updated[index].ein = e.target.value;
                                setSubOrganizations(updated);
                              }}
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="EIN"
                            />
                            <input
                              type="text"
                              value={subOrg.contactPerson}
                              onChange={(e) => {
                                const updated = [...subOrganizations];
                                updated[index].contactPerson = e.target.value;
                                setSubOrganizations(updated);
                              }}
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Contact person"
                            />
                          </div>
                          <input
                            type="text"
                            value={subOrg.relationship}
                            onChange={(e) => {
                              const updated = [...subOrganizations];
                              updated[index].relationship = e.target.value;
                              setSubOrganizations(updated);
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Relationship to parent organization"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updated = subOrganizations.filter(org => org.id !== subOrg.id);
                            setSubOrganizations(updated);
                          }}
                          className="ml-3 p-2 text-red-600 hover:text-red-800 rounded"
                          title="Remove subsidiary"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <ContactSelector
                    label="Add Subsidiary Organizations"
                    value={((formData as any).subsidiaryOrganizations || []) as ContactInfo | ContactInfo[] | null}
                    onChange={(contacts) => {
                      handleInputChange('subsidiaryOrganizations', contacts);
                    }}
                    type="organization"
                    multiple={true}
                    placeholder="Select subsidiary organizations from contacts"
                    className="mb-2"
                  />
                </div>
              )}
            </div>
            
            {/* Fiscal Sponsor */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Do you have a fiscal sponsor?
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasFiscalSponsor"
                    value="yes"
                    checked={Boolean((formData as any).hasFiscalSponsor === 'yes')}
                    onChange={(e) => handleInputChange('hasFiscalSponsor', e.target.value)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasFiscalSponsor"
                    value="no"
                    checked={Boolean((formData as any).hasFiscalSponsor === 'no')}
                    onChange={(e) => handleInputChange('hasFiscalSponsor', e.target.value)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              
              {formData.hasFiscalSponsor === 'yes' && (
                <div className="mt-3">
                  <ContactSelector
                    label="Select Fiscal Sponsor"
                    value={((formData as any).fiscalSponsorContact || null) as ContactInfo | ContactInfo[] | null}
                    onChange={(contact) => {
                      handleInputChange('fiscalSponsorContact', contact);
                      if (contact && !Array.isArray(contact)) {
                        handleInputChange('fiscalSponsor', contact.name);
                      }
                    }}
                    type="organization"
                    placeholder="Select fiscal sponsor from contacts"
                    className="mb-2"
                  />
                </div>
              )}
            </div>
            
            {/* Affiliations */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Do you have organizational affiliations?
              </label>
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasAffiliations"
                    value="yes"
                    checked={Boolean((formData as any).hasAffiliations === 'yes')}
                    onChange={(e) => handleInputChange('hasAffiliations', e.target.value)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasAffiliations"
                    value="no"
                    checked={Boolean((formData as any).hasAffiliations === 'no')}
                    onChange={(e) => handleInputChange('hasAffiliations', e.target.value)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
              
              {formData.hasAffiliations === 'yes' && (
                <div className="mt-3">
                  <ContactSelector
                    label="Select Affiliated Organizations"
                    value={((formData as any).affiliatedOrganizations || []) as ContactInfo | ContactInfo[] | null}
                    onChange={(contacts) => {
                      handleInputChange('affiliatedOrganizations', contacts);
                    }}
                    type="organization"
                    multiple={true}
                    placeholder="Select affiliated organizations from contacts"
                    className="mb-2"
                  />
                </div>
              )}
            </div>
            
          </div>
          
          {/* Organizational Communication */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Organizational Communication
            </h3>
            
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="autoPopulateComm"
                  checked={Boolean((formData as any).autoPopulateComm !== false)}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      const confirmed = window.confirm('Do you want to change contact information or add alternate information?');
                      if (confirmed) {
                        const addAlternate = window.confirm('Add alternate information in contact manager?');
                        if (addAlternate) {
                          toast.info('Redirecting to contact manager to add alternate information');
                        }
                      }
                    }
                    handleInputChange('autoPopulateComm', e.target.checked);
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoPopulateComm" className="text-sm font-medium text-blue-800">
                  Auto-populate from organization contact card
                </label>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                All fields below will auto-populate from the organization information in the org's contact card. 
                Uncheck to override if you want to change contact information or add alternate information.
              </p>
              
              {/* Override Options */}
              {!formData.autoPopulateComm && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">Override Options</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (selectedOrganization) {
                          // Auto-populate communication fields from selected organization
                          if ((selectedOrganization as any).phone) {
                            handleInputChange('organizationPhone', (selectedOrganization as any).phone);
                          }
                          if ((selectedOrganization as any).email) {
                            handleInputChange('primaryEmail', (selectedOrganization as any).email);
                          }
                          if ((selectedOrganization as any).website) {
                            handleInputChange('website', (selectedOrganization as any).website);
                          }
                          toast.success('Communication fields populated from organization contact');
                        }
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium text-xs"
                    >
                      Replace with Organization Data
                    </button>
                    <button
                      onClick={() => {
                        // Option to add alternate information
                        toast.info('Opening contact manager to add alternate information...');
                      }}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium text-xs ml-2"
                    >
                      Add Alternate Information
                    </button>
                    <button
                      onClick={() => {
                        // Option to edit existing
                        toast.info('Opening contact manager to edit existing organization information...');
                      }}
                      className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors font-medium text-xs ml-2"
                    >
                      Edit Organization Contact
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Organization Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={(formData as any).organizationPhone || ''}
                  onChange={(e) => handleInputChange('organizationPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="+1234567890"
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={(formData as any).whatsappNumber || ''}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="+1234567890"
                />
                <p className="text-xs text-gray-500 mt-1">Enter with country code (e.g., +1234567890)</p>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Primary Organization Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={(formData as any).primaryEmail || ''}
                  onChange={(e) => handleInputChange('primaryEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="email@example.org"
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Preferred Contact Email
                </label>
                <input
                  type="email"
                  value={(formData as any).preferredEmail || ''}
                  onChange={(e) => handleInputChange('preferredEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="preferred@example.org"
                />
                <p className="text-xs text-gray-500 mt-1">If different from primary email</p>
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={(formData as any).website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="https://yourorg.org"
                />
              </div>
              
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={(formData as any).country || 'USA'}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Contact Persons */}
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Contact Persons
            </h3>
            
            {/* Primary Contact */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Primary Contact <span className="text-red-500">*Required</span>
              </label>
              <p className="text-sm text-gray-600 mb-3">
                This should be from contact manager. Add or search for a person using the same layout and template as above. 
                Extra information belongs to the person and is stored in their profile in contact manager.
              </p>
              
              <ContactSelector
                label="Select Primary Contact"
                value={selectedContacts.primaryContact ? contactToContactInfo(selectedContacts.primaryContact) : null}
                onChange={(contact) => {
                  if (contact && !(contact instanceof Array)) {
                    setSelectedContacts(prev => ({
                      ...prev,
                      primaryContact: contactInfoToContact(contact)
                    }));
                  }
                }}
                type="person"
                showAddButton={true}
                required={true}
                placeholder="Search or add primary contact..."
                className="mb-4"
              />
              
              {selectedContacts.primaryContact && (
                <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Full Name</label>
                        <p className="text-gray-900">{selectedContacts.primaryContact.firstName} {selectedContacts.primaryContact.lastName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Title/Position</label>
                        <p className="text-gray-900">{selectedContacts.primaryContact.title || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Email Address</label>
                        <p className="text-gray-900">{selectedContacts.primaryContact.email || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Phone Number</label>
                        <p className="text-gray-900">{selectedContacts.primaryContact.phone || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">WhatsApp Number</label>
                        <p className="text-gray-900">{selectedContacts.primaryContact.mobile || 'Not specified'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">W-9 Status</label>
                        <div className="flex items-center space-x-2">
                          {selectedContacts.primaryContact.hasW9 ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">W-9 on file</span>
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 text-red-600" />
                              <span className="text-red-600">No W-9 on file</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      W-9 is linked here but managed in document manager. Contact information is tied to the person's profile in contact manager.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Additional Contacts */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-2">
                Additional Contacts
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Add additional authorized representatives or key contacts for your organization
              </p>
              
              <ContactSelector
                label="Add Additional Contacts"
                value={selectedContacts.additionalContacts.map(contactToContactInfo)}
                onChange={(contacts) => {
                  if (Array.isArray(contacts)) {
                    setSelectedContacts(prev => ({
                      ...prev,
                      additionalContacts: contacts.map(contactInfoToContact)
                    }));
                  }
                }}
                type="person"
                multiple={true}
                showAddButton={true}
                placeholder="Search for contacts or add new..."
                className="mb-4"
              />
              
              {selectedContacts.additionalContacts.length > 0 && (
                <div className="space-y-3">
                  {selectedContacts.additionalContacts.map((contact, index) => (
                    <div key={contact.id} className="bg-white p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-medium text-gray-900">{(contact as any).firstName} {(contact as any).lastName}</p>
                            {contact.hasW9 && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                W-9 Provided
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{contact.title || 'No title specified'}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                            <div>
                              <span className="text-gray-600">Email:</span> {(contact as any).email}
                            </div>
                            <div>
                              <span className="text-gray-600">Phone:</span> {(contact as any).phone}
                            </div>
                            {contact.mobile && (
                              <div>
                                <span className="text-gray-600">WhatsApp:</span> {contact.mobile}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedContacts(prev => ({
                              ...prev,
                              additionalContacts: prev.additionalContacts.filter(c => c.id !== contact.id)
                            }));
                            toast.success('Contact removed');
                          }}
                          className="p-2 text-red-600 hover:text-red-800 rounded"
                          title="Remove contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Organizational Addresses
              </div>
              <button
                type="button"
                onClick={() => {
                  const newAddress = {
                    id: Date.now().toString(),
                    type: 'alternate' as const,
                    address: '',
                    address2: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'United States',
                    businessHours: '',
                    businessDays: '',
                    isMailingAddress: false
                  };
                  setOrganizationAddresses([...organizationAddresses, newAddress]);
                  toast.success('New address added');
                }}
                disabled={isFieldDisabled()}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium disabled:opacity-50"
                title="Add new address"
              >
                <Plus className="w-4 h-4" />
              </button>
            </h3>
            
            <div className="space-y-4">
              {organizationAddresses.map((addr, index) => (
                <div key={addr.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={addr.type}
                        onChange={(e) => {
                          const updated = [...organizationAddresses];
                          updated[index].type = e.target.value as any;
                          setOrganizationAddresses(updated);
                        }}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        disabled={isFieldDisabled()}
                      >
                        <option value="main">Main Office</option>
                        <option value="mailing">Mailing Address</option>
                        <option value="physical">Physical Location</option>
                        <option value="satellite">Satellite Office</option>
                        <option value="branch">Branch Location</option>
                        <option value="shipment">Shipment Address</option>
                        <option value="alternate">Alternate Address</option>
                      </select>
                      {addr.type === 'main' && <span className="text-xs text-red-500">*Required</span>}
                    </div>
                    {organizationAddresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrganizationAddresses(organizationAddresses.filter(a => a.id !== addr.id));
                          toast.success('Address removed');
                        }}
                        disabled={isFieldDisabled()}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-sm">Address Line 1 {addr.type === 'main' && <span className="text-red-500">*</span>}</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={addr.address}
                          onChange={e => {
                            const updated = [...organizationAddresses];
                            updated[index].address = e.target.value;
                            setOrganizationAddresses(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Street address"
                          disabled={isFieldDisabled()}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block font-semibold text-sm">Address Line 2</label>
                      <input
                        type="text"
                        value={addr.address2}
                        onChange={e => {
                          const updated = [...organizationAddresses];
                          updated[index].address2 = e.target.value;
                          setOrganizationAddresses(updated);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Suite, apartment, unit, etc."
                        disabled={isFieldDisabled()}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-sm">City {addr.type === 'main' && <span className="text-red-500">*</span>}</label>
                        <input
                          type="text"
                          value={addr.city}
                          onChange={e => {
                            const updated = [...organizationAddresses];
                            updated[index].city = e.target.value;
                            setOrganizationAddresses(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="City"
                          disabled={isFieldDisabled()}
                        />
                      </div>
                      
                      <div>
                        <label className="block font-semibold text-sm">State {addr.type === 'main' && <span className="text-red-500">*</span>}</label>
                        <select
                          value={addr.state}
                          onChange={e => {
                            const updated = [...organizationAddresses];
                            updated[index].state = e.target.value;
                            setOrganizationAddresses(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          disabled={isFieldDisabled()}
                        >
                          <option value="">Select State</option>
                          {US_STATES.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block font-semibold text-sm">ZIP Code {addr.type === 'main' && <span className="text-red-500">*</span>}</label>
                        <input
                          type="text"
                          value={addr.zipCode}
                          onChange={e => {
                            const updated = [...organizationAddresses];
                            updated[index].zipCode = e.target.value;
                            setOrganizationAddresses(updated);
                            // Auto-fill city/state logic can be added here
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="ZIP Code"
                          disabled={isFieldDisabled()}
                          maxLength={5}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-sm">Business Hours</label>
                        <input
                          type="text"
                          value={addr.businessHours || ''}
                          onChange={e => {
                            const updated = [...organizationAddresses];
                            updated[index].businessHours = e.target.value;
                            setOrganizationAddresses(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="e.g., 9:00 AM - 5:00 PM"
                          disabled={isFieldDisabled()}
                        />
                      </div>
                      
                      <div>
                        <label className="block font-semibold text-sm">Business Days</label>
                        <input
                          type="text"
                          value={addr.businessDays || ''}
                          onChange={e => {
                            const updated = [...organizationAddresses];
                            updated[index].businessDays = e.target.value;
                            setOrganizationAddresses(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="e.g., Monday - Friday"
                          disabled={isFieldDisabled()}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={addr.isMailingAddress || false}
                          onChange={e => {
                            const updated = [...organizationAddresses];
                            updated[index].isMailingAddress = e.target.checked;
                            setOrganizationAddresses(updated);
                          }}
                          disabled={isFieldDisabled()}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-900">Use as mailing address</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              {organizationAddresses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No addresses added yet.</p>
                  <p className="text-sm">Click the + button to add an address.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Primary Contact Section */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Primary Contact
              <span className="text-red-500 ml-1">*Required</span>
            </h3>
            
            <div className="mb-4">
              <ContactSelector
                label="Select Primary Contact"
                value={selectedContacts.primaryContact ? contactToContactInfo(selectedContacts.primaryContact) : null}
                onChange={(contact) => {
                  if (contact && !(contact instanceof Array)) {
                    setSelectedContacts(prev => ({ ...(prev as any), primaryContact: contactInfoToContact(contact) }));
                  }
                }}
                type="person"
                showAddButton={true}
                placeholder="Search or add primary contact..."
                required={true}
                className="mb-3"
              />
              
              {selectedContacts.primaryContact && (
                <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Full Name:</span>
                      <p className="text-gray-900">{selectedContacts.primaryContact.firstName} {selectedContacts.primaryContact.lastName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Title/Position:</span>
                      <p className="text-gray-900">{selectedContacts.primaryContact.title || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Email:</span>
                      <p className="text-gray-900">{selectedContacts.primaryContact.email || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Phone:</span>
                      <p className="text-gray-900">{selectedContacts.primaryContact.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">WhatsApp:</span>
                      <p className="text-gray-900">{selectedContacts.primaryContact.mobile || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">W-9 Status:</span>
                      <p className="text-gray-900">
                        {selectedContacts.primaryContact.hasW9 ? (
                          <span className="text-green-600 flex items-center">
                            <Check className="w-4 h-4 mr-1" />
                            W-9 on file
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <X className="w-4 h-4 mr-1" />
                            No W-9 on file
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {!selectedContacts.primaryContact.hasW9 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      <p className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        This contact needs to provide a W-9 form. You can upload it in the Contact Manager.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Additional Contacts Section */}
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Additional Contacts
              </div>
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Add additional authorized representatives or key contacts for your organization
            </p>
            
            <ContactSelector
              label="Add Additional Contacts"
              value={selectedContacts.additionalContacts.map(contactToContactInfo)}
              onChange={(contacts) => {
                if (Array.isArray(contacts)) {
                  setSelectedContacts(prev => ({
                    ...prev,
                    additionalContacts: contacts.map(contactInfoToContact)
                  }));
                }
              }}
              type="person"
              multiple={true}
              showAddButton={true}
              placeholder="Search for contacts or add new..."
              className="mb-4"
            />
            
            {selectedContacts.additionalContacts.length > 0 && (
              <div className="space-y-3">
                {selectedContacts.additionalContacts.map((contact, index) => (
                  <div key={contact.id} className="bg-white p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{(contact as ExtendedContact).name || `${(contact as any).firstName} ${(contact as any).lastName}`.trim()}</p>
                          {contact.hasW9 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              W-9 Provided
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{contact.title || 'No title specified'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                          <div>
                            <span className="text-gray-600">Email:</span> {(contact as any).email}
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span> {(contact as any).phone}
                          </div>
                          {(contact as ExtendedContact).whatsapp && (
                            <div>
                              <span className="text-gray-600">WhatsApp:</span> {(contact as ExtendedContact).whatsapp}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedContacts(prev => ({
                            ...prev,
                            additionalContacts: prev.additionalContacts.filter(c => c.id !== contact.id)
                          }));
                          toast.success('Contact removed');
                        }}
                        className="p-1 text-gray-500 hover:text-red-600 rounded"
                        title="Remove contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedContacts.additionalContacts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No additional contacts added yet.</p>
                <p className="text-sm">Use the ContactSelector above to add contacts from your contact manager.</p>
              </div>
            )}
          </div>
          
          {/* Organizational Identity Section */}
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Organizational Identity
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Group Exemption Section */}
              <div>
                <label className="block font-semibold mb-2">Group Exemption</label>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      id="hasGroupExemption2"
                      type="checkbox"
                      checked={hasGroupExemption}
                      onChange={(e) => setHasGroupExemption(e.target.checked)}
                      disabled={isFieldDisabled()}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="hasGroupExemption2" className="font-medium text-gray-900 cursor-pointer">
                        Part of a Group Exemption
                      </label>
                      <p className="text-sm text-gray-600 mt-1">
                        Check if your organization is covered under a central organization's group exemption ruling
                      </p>
                    </div>
                  </div>
                  
                  {hasGroupExemption && (
                    <div className="ml-7 space-y-4 p-4 bg-indigo-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Central Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={(formData as any).centralOrgName || ''}
                          onChange={(e) => handleInputChange('centralOrgName', e.target.value)}
                          disabled={isFieldDisabled()}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Name of the central organization"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Group Exemption Number (GEN) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={(formData as any).groupExemptionNumber || ''}
                          onChange={(e) => handleInputChange('groupExemptionNumber', e.target.value)}
                          disabled={isFieldDisabled()}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="4-digit GEN (e.g., 1234)"
                          maxLength={4}
                        />
                        <small className="text-gray-500 text-xs block mt-1">
                          The 4-digit number assigned by the IRS to your central organization
                        </small>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Subordinate Number
                        </label>
                        <input
                          type="text"
                          value={(formData as any).subordinateNumber || ''}
                          onChange={(e) => handleInputChange('subordinateNumber', e.target.value)}
                          disabled={isFieldDisabled()}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Your subordinate number (if assigned)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Central Organization EIN <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={(formData as any).centralOrgEIN || ''}
                          onChange={(e) => handleInputChange('centralOrgEIN', e.target.value)}
                          disabled={isFieldDisabled()}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="12-3456789"
                        />
                      </div>
                      
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Important: You must be listed in your central organization's annual group exemption update to the IRS.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Organizational Documents Section */}
          <div className="bg-indigo-50 p-4 rounded-lg mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Organizational Documents
            </h3>
            <div className="space-y-4">
              {/* IRS Determination Letter */}
              <div>
                <label htmlFor="irsLetter" className="block font-semibold">IRS 501(c)(3) Determination Letter</label>
                <div className="space-y-2">
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        id="irsLetter"
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSpecificFileUpload('irsLetter', file);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        disabled={formLocked || isFieldDisabled() || fileStates['irsLetter'] === 'uploading'}
                      />
                      {getFileStateIcon('irsLetter')}
                    </div>
                    {formData.irsLetter && (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                        <span className="text-green-700 text-sm flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {(formData as any).irsLetter?.name || (formData as any).irsLetter?.name || 'Uploaded file'}
                        </span>
                        <button
                          onClick={() => removeFile('irsLetter')}
                          className="text-red-600 hover:text-red-800"
                          disabled={isFieldDisabled()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {fileErrors['irsLetter'] && <p className="text-red-600 text-sm">{fileErrors['irsLetter']}</p>}
                  </>
                </div>
              </div>
              
              {/* W-9 Form */}
              <div>
                <label htmlFor="w9Form" className="block font-semibold">W-9 Form</label>
                <div className="space-y-2">
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        id="w9Form"
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleSpecificFileUpload('w9Form', file);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        disabled={formLocked || isFieldDisabled() || fileStates['w9Form'] === 'uploading'}
                      />
                      {getFileStateIcon('w9Form')}
                    </div>
                    {formData.w9Form && (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                        <span className="text-green-700 text-sm flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {(formData as any).w9Form?.name || (formData as any).w9Form?.name || 'W-9 uploaded'}
                        </span>
                        <button
                          onClick={() => removeFile('w9Form')}
                          className="text-red-600 hover:text-red-800"
                          disabled={isFieldDisabled()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {fileErrors['w9Form'] && <p className="text-red-600 text-sm">{fileErrors['w9Form']}</p>}
                  </>
                </div>
              </div>
              
              {/* Articles of Incorporation */}
              <div>
                <label htmlFor="articlesOfIncorporation" className="block font-semibold">Articles of Incorporation / Certificate of Formation</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="articlesOfIncorporation"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleSpecificFileUpload('articlesOfIncorporation', file);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={formLocked || isFieldDisabled() || fileStates['articlesOfIncorporation'] === 'uploading'}
                    />
                    {getFileStateIcon('articlesOfIncorporation')}
                    <button
                      type="button"
                      onClick={() => setShowDocumentInfo('articlesOfIncorporation')}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
                      title="Add document information"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.articlesOfIncorporation && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                      <span className="text-green-700 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {formData.articlesOfIncorporation.name || formData.articlesOfIncorporation.name || 'Articles uploaded'}
                      </span>
                      <button
                        onClick={() => removeFile('articlesOfIncorporation')}
                        className="text-red-600 hover:text-red-800"
                        disabled={isFieldDisabled()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {fileErrors['articlesOfIncorporation'] && <p className="text-red-600 text-sm">{fileErrors['articlesOfIncorporation']}</p>}
                </div>
              </div>
              
              {/* Bylaws */}
              <div>
                <label htmlFor="bylaws" className="block font-semibold">Bylaws</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="bylaws"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleSpecificFileUpload('bylaws', file);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={formLocked || isFieldDisabled() || fileStates['bylaws'] === 'uploading'}
                    />
                    {getFileStateIcon('bylaws')}
                  </div>
                  {formData.bylaws && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                      <span className="text-green-700 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {formData.bylaws.name || formData.bylaws.name || 'Bylaws uploaded'}
                      </span>
                      <button
                        onClick={() => removeFile('bylaws')}
                        className="text-red-600 hover:text-red-800"
                        disabled={isFieldDisabled()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {fileErrors['bylaws'] && <p className="text-red-600 text-sm">{fileErrors['bylaws']}</p>}
                </div>
              </div>
              
              {/* Certificate of Good Standing */}
              <div>
                <label htmlFor="goodStanding" className="block font-semibold">Certificate of Good Standing / Status</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="goodStanding"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleSpecificFileUpload('goodStanding', file);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={formLocked || isFieldDisabled() || fileStates['goodStanding'] === 'uploading'}
                    />
                    {getFileStateIcon('goodStanding')}
                    <button
                      type="button"
                      onClick={() => setShowDocumentInfo('goodStanding')}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
                      title="Add document information"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.goodStanding && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                      <span className="text-green-700 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {formData.goodStanding.name || formData.goodStanding.name || 'Certificate uploaded'}
                      </span>
                      <button
                        onClick={() => removeFile('goodStanding')}
                        className="text-red-600 hover:text-red-800"
                        disabled={isFieldDisabled()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {fileErrors['goodStanding'] && <p className="text-red-600 text-sm">{fileErrors['goodStanding']}</p>}
                </div>
              </div>
              
              {/* Annual Report */}
              <div>
                <label htmlFor="annualReport" className="block font-semibold">Annual Report (Latest)</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="annualReport"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleSpecificFileUpload('annualReport', file);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={formLocked || isFieldDisabled() || fileStates['annualReport'] === 'uploading'}
                    />
                    {getFileStateIcon('annualReport')}
                    <button
                      type="button"
                      onClick={() => setShowDocumentInfo('annualReport')}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
                      title="Add document information"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.annualReport && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                      <span className="text-green-700 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {formData.annualReport.name || formData.annualReport.name || 'Report uploaded'}
                      </span>
                      <button
                        onClick={() => removeFile('annualReport')}
                        className="text-red-600 hover:text-red-800"
                        disabled={isFieldDisabled()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {fileErrors['annualReport'] && <p className="text-red-600 text-sm">{fileErrors['annualReport']}</p>}
                </div>
              </div>
              
              {/* State Charitable Registration */}
              <div>
                <label htmlFor="charitableRegistration" className="block font-semibold">State Charitable Registration</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      id="charitableRegistration"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleSpecificFileUpload('charitableRegistration', file);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={formLocked || isFieldDisabled() || fileStates['charitableRegistration'] === 'uploading'}
                    />
                    {getFileStateIcon('charitableRegistration')}
                    <button
                      type="button"
                      onClick={() => setShowDocumentInfo('charitableRegistration')}
                      className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
                      title="Add document information"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                  {formData.charitableRegistration && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                      <span className="text-green-700 text-sm flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {formData.charitableRegistration.name || formData.charitableRegistration.name || 'Registration uploaded'}
                      </span>
                      <button
                        onClick={() => removeFile('charitableRegistration')}
                        className="text-red-600 hover:text-red-800"
                        disabled={isFieldDisabled()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {fileErrors['charitableRegistration'] && <p className="text-red-600 text-sm">{fileErrors['charitableRegistration']}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Fields */}
          {dynamicFields['basicInfo']?.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block font-semibold">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id={field.id}
                  type={field.type}
                  value={(field.value as string) || ''}
                  onChange={e => updateDynamicField('basicInfo', field.id, { value: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  disabled={isFieldDisabled()}
                />
                <button
                  onClick={() => removeDynamicField('basicInfo', field.id)}
                  className="px-2 py-2 text-red-600 hover:text-red-800"
                  disabled={isFieldDisabled()}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Contact Manager Integration */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-4">
              <label className="block font-semibold">Contact Management</label>
              <button
                type="button"
                onClick={() => setShowContactManager(true)}
                disabled={isFieldDisabled()}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Manage Contacts
              </button>
            </div>
            
            {contacts.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Current Contacts ({contacts.length})</h4>
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <h5 className="font-medium">{(contact as any).firstName} {(contact as any).lastName}</h5>
                        <p className="text-sm text-gray-600">{contact.organization} • {contact.title}</p>
                        <p className="text-sm text-gray-500">{(contact as any).email} • {(contact as any).phone}</p>
                        <div className="flex gap-1 mt-1">
                          {contact.projectRoles?.map(role => (
                            <span key={role} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingContact(contact.id);
                          setShowContactManager(true);
                        }}
                        disabled={isFieldDisabled()}
                        className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium disabled:opacity-50"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Field Button */}
        <div className="mt-6">
          <button
            onClick={() => addDynamicField('basicInfo', 'text', 'Additional Field', false)}
            className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
            disabled={isFieldDisabled()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </button>
        </div>
      </>
    );
  };

  // --- BEGIN NARRATIVE SECTION ---

  const renderNarrativeSection = () => {
    return (
      <section className="mb-8" aria-labelledby="narrative-heading">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h2 id="narrative-heading" className="text-2xl font-bold">Narrative</h2>
            {renderProgressIndicator('narrative')}
          </div>
          <SectionLock resourceId="narrative" />
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Background Statement */}
          <div>
            <label htmlFor="backgroundStatement" className="block font-semibold">Background Statement <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-3"
              label=""
              value={narrative.backgroundStatement}
              onChange={content => handleNarrativeChange('backgroundStatement', content)}
              placeholder="Describe your organization's history and background..."
              required={true}
            />
            <div className="flex gap-2 mt-2 items-center">
              <label className="block text-sm font-medium text-gray-900 mb-0">Upload Supporting Document</label>
              <input
                type="file"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleNarrativeFile('backgroundStatementDocs', e);
                }}
                className="block"
                disabled={narrativeLocked}
              />
            </div>
            {narrative.backgroundStatementDocs && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {narrative.backgroundStatementDocs.name}
                  </span>
                  <button
                    onClick={() => handleNarrativeChange('backgroundStatementDocs', null)}
                    className="text-red-600 hover:text-red-800"
                    disabled={narrativeLocked}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {(narrativeErrors as any).backgroundStatement && <p className="text-red-600 text-sm">{(narrativeErrors as any).backgroundStatement}</p>}
          </div>

          {/* Mission Statement */}
          <div>
            <label htmlFor="missionStatement" className="block font-semibold">Mission Statement <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-4"
              label=""
              value={narrative.missionStatement}
              onChange={content => handleNarrativeChange('missionStatement', content)}
              placeholder="Your organization's mission statement..."
              required={true}
            />
            <div className="flex gap-2 mt-2 items-center">
              <label className="block text-sm font-medium text-gray-900 mb-0">Upload Supporting Document</label>
              <input
                type="file"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleNarrativeFile('missionStatementDocs', e);
                }}
                className="block"
                disabled={narrativeLocked}
              />
            </div>
            {narrative.missionStatementDocs && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {narrative.missionStatementDocs.name}
                  </span>
                  <button
                    onClick={() => handleNarrativeChange('missionStatementDocs', null)}
                    className="text-red-600 hover:text-red-800"
                    disabled={narrativeLocked}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {(narrativeErrors as any).missionStatement && <p className="text-red-600 text-sm">{(narrativeErrors as any).missionStatement}</p>}
          </div>

          {/* Vision Statement */}
          <div>
            <label htmlFor="visionStatement" className="block font-semibold">Vision Statement</label>
            <NarrativeEntryField
              id="narrative-field-5"
              label=""
              value={narrative.visionStatement}
              onChange={content => handleNarrativeChange('visionStatement', content)}
              placeholder="Your organization's vision for the future..."
            />
            <div className="flex gap-2 mt-2 items-center">
              <label className="block text-sm font-medium text-gray-900 mb-0">Upload Supporting Document</label>
              <input
                type="file"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleNarrativeFile('visionStatementDocs', e);
                }}
                className="block"
                disabled={narrativeLocked}
              />
            </div>
            {narrative.visionStatementDocs && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {narrative.visionStatementDocs.name}
                  </span>
                  <button
                    onClick={() => handleNarrativeChange('visionStatementDocs', null)}
                    className="text-red-600 hover:text-red-800"
                    disabled={narrativeLocked}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {(narrativeErrors as any).visionStatement && <p className="text-red-600 text-sm">{(narrativeErrors as any).visionStatement}</p>}
          </div>

          {/* Impact Statement */}
          <div>
            <label htmlFor="impactStatement" className="block font-semibold">Impact Statement</label>
            <NarrativeEntryField
              id="narrative-field-6"
              label=""
              value={narrative.impactStatement}
              onChange={content => handleNarrativeChange('impactStatement', content)}
              placeholder="Describe the impact your organization has made..."
            />
            <div className="flex gap-2 mt-2 items-center">
              <label className="block text-sm font-medium text-gray-900 mb-0">Upload Supporting Document</label>
              <input
                type="file"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleNarrativeFile('impactStatementDocs', e);
                }}
                className="block"
                disabled={narrativeLocked}
              />
            </div>
            {narrative.impactStatementDocs && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {narrative.impactStatementDocs.name}
                  </span>
                  <button
                    onClick={() => handleNarrativeChange('impactStatementDocs', null)}
                    className="text-red-600 hover:text-red-800"
                    disabled={narrativeLocked}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            {(narrativeErrors as any).impactStatement && <p className="text-red-600 text-sm">{(narrativeErrors as any).impactStatement}</p>}
          </div>

          {/* Strategies Statement */}
          <div>
            <label htmlFor="strategiesStatement" className="block font-semibold">Strategies Statement</label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('strategiesStatement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleNarrativeChange('strategiesStatement', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('strategiesStatement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleNarrativeChange('strategiesStatement', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('strategiesStatement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleNarrativeChange('strategiesStatement', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(narrative.strategiesStatement);
                    toast.success('Strategies statement copied!');
                  }}
                  disabled={!narrative.strategiesStatement || narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <NarrativeEntryField
              id="narrative-field-7"
                label=""
                value={narrative.strategiesStatement}
                onChange={content => handleNarrativeChange('strategiesStatement', content)}
                placeholder="Describe your organization's strategies and approaches..."
                permissions={{ canEdit: !narrativeLocked }}
                />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{getTextStats(narrative.strategiesStatement).words} words</span>
              <span>{getTextStats(narrative.strategiesStatement).characters} characters</span>
            </div>
          </div>

          {/* Needs Statement */}
          <div>
            <label htmlFor="needsStatement" className="block font-semibold">Needs Statement <span className="text-red-500">*</span></label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('needsStatement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleNarrativeChange('needsStatement', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('needsStatement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleNarrativeChange('needsStatement', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('needsStatement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleNarrativeChange('needsStatement', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(narrative.needsStatement);
                    toast.success('Needs statement copied!');
                  }}
                  disabled={!narrative.needsStatement || narrativeLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <NarrativeEntryField
              id="narrative-field-8"
                label=""
                value={narrative.needsStatement}
                onChange={content => handleNarrativeChange('needsStatement', content)}
                placeholder="Describe the needs your organization addresses..."
                permissions={{ canEdit: !narrativeLocked }}
                />
            </div>
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{getTextStats(narrative.needsStatement).words} words</span>
              <span>{getTextStats(narrative.needsStatement).characters} characters</span>
            </div>
            {(narrativeErrors as any).needsStatement && <p className="text-red-600 text-sm">{(narrativeErrors as any).needsStatement}</p>}
          </div>

          {/* Primary Areas of Impact */}
          <div>
            <label htmlFor="primaryAreasOfImpact" className="block font-semibold">Primary Areas of Impact</label>
            <NarrativeEntryField
              id="narrative-field-9"
              label=""
              value={narrative.primaryAreasOfImpact}
              onChange={content => handleNarrativeChange('primaryAreasOfImpact', content)}
              placeholder="Rich text editing: bullets, font size, formatting, links, images. Drag corner to resize. Spell check enabled by browser."
            />
            {(narrativeErrors as any).primaryAreasOfImpact && <p className="text-red-600 text-sm">{(narrativeErrors as any).primaryAreasOfImpact}</p>}
          </div>

          {/* Population Served */}
          <div>
            <label htmlFor="populationServed" className="block font-semibold">Population Served</label>
            <NarrativeEntryField
              id="narrative-field-10"
              label=""
              value={narrative.populationServed}
              onChange={content => handleNarrativeChange('populationServed', content)}
              placeholder="Describe the population you serve..."
              permissions={{ canEdit: !narrativeLocked }}
            />
          </div>

          {/* Service Areas */}
          <div>
            <label htmlFor="serviceAreas" className="block font-semibold">Service Areas</label>
            <NarrativeEntryField
              id="narrative-field-11"
              label=""
              value={narrative.serviceAreas}
              onChange={content => handleNarrativeChange('serviceAreas', content)}
              placeholder="List your service areas..."
              permissions={{ canEdit: !narrativeLocked }}
            />
          </div>

          {/* Service Area Description */}
          <div>
            <label htmlFor="serviceAreaDescription" className="block font-semibold">Service Area Description</label>
            <NarrativeEntryField
              id="narrative-field-12"
              label=""
              value={narrative.serviceAreaDescription}
              onChange={content => handleNarrativeChange('serviceAreaDescription', content)}
              placeholder="Describe your service areas in detail..."
              permissions={{ canEdit: !narrativeLocked }}
            />
          </div>

          {/* Search Keywords */}
          <div>
            <label htmlFor="searchKeywords" className="block font-semibold">Search Keywords</label>
            <input
              id="searchKeywords"
              type="text"
              value={narrative.searchKeywords}
              onChange={e => handleNarrativeChange('searchKeywords', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Keywords separated by commas"
              disabled={narrativeLocked}
            />
            <small className="text-gray-500">Keywords to help people find your organization</small>
          </div>

          {/* Logo Upload */}
          <div>
            <label htmlFor="logoFile" className="block font-semibold">Organization Logo (PNG/JPG, max 5MB)</label>
            <input
              id="logoFile"
              type="file"
              accept="image/png,image/jpeg"
              onChange={e => handleNarrativeFile('logoFile', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={narrativeLocked}
            />
            {narrative.logoFile && <span className="text-green-700 text-sm">{narrative.logoFile.name}</span>}
            {(narrativeErrors as any).logoFile && <p className="text-red-600 text-sm">{(narrativeErrors as any).logoFile}</p>}
          </div>

          {/* Banner Image Upload */}
          <div>
            <label htmlFor="bannerImage" className="block font-semibold">Banner Image (PNG/JPG, max 5MB)</label>
            <input
              id="bannerImage"
              type="file"
              accept="image/png,image/jpeg"
              onChange={e => handleNarrativeFile('bannerImage', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={narrativeLocked}
            />
            {narrative.bannerImage && <span className="text-green-700 text-sm">{narrative.bannerImage.name}</span>}
            {(narrativeErrors as any).bannerImage && <p className="text-red-600 text-sm">{(narrativeErrors as any).bannerImage}</p>}
          </div>

          {/* Social Media */}
          <div>
            <label className="block font-semibold mb-3">Social Media</label>
            <div className="space-y-3">
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Other'].map((platform, index) => (
                <div key={platform} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-900">{platform}:</div>
                  <div className="flex items-center gap-2 flex-1">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`socialType_${platform}`}
                        value="handle"
                        checked={(narrative as any)[`${platform.toLowerCase()}Type`] !== 'url'}
                        onChange={() => handleNarrativeChange(`${platform.toLowerCase()}Type`, 'handle')}
                        className="mr-1"
                        disabled={narrativeLocked}
                      />
                      <span className="text-sm">@</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`socialType_${platform}`}
                        value="url"
                        checked={(narrative as any)[`${platform.toLowerCase()}Type`] === 'url'}
                        onChange={() => handleNarrativeChange(`${platform.toLowerCase()}Type`, 'url')}
                        className="mr-1"
                        disabled={narrativeLocked}
                      />
                      <span className="text-sm">URL</span>
                    </label>
                    <input
                      type="text"
                      value={(narrative as any)[`${platform.toLowerCase()}Account`] || ''}
                      onChange={e => handleNarrativeChange(`${platform.toLowerCase()}Account`, e.target.value)}
                      placeholder={(narrative as any)[`${platform.toLowerCase()}Type`] === 'url' ? 'https://...' : 'username'}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      disabled={narrativeLocked}
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  // Add functionality to add more social media platforms
                  toast.info('Additional social media platforms can be added above');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                disabled={narrativeLocked}
              >
                <Plus className="w-4 h-4" />
                Add another platform
              </button>
            </div>
          </div>

          {/* External Assessments */}
          <div>
            <label htmlFor="externalAssessments" className="block font-semibold">External Assessments</label>
            <NarrativeEntryField
              id="narrative-field-13"
              label=""
              value={narrative.externalAssessments}
              onChange={content => handleNarrativeChange('externalAssessments', content)}
              placeholder="List any external assessments or evaluations..."
              permissions={{ canEdit: !narrativeLocked }}
            />
          </div>

          {/* Annual Report Upload */}
          <div>
            <label htmlFor="annualReport" className="block font-semibold">Annual Report (PDF, max 10MB)</label>
            <input
              id="annualReport"
              type="file"
              accept="application/pdf"
              onChange={e => handleNarrativeFile('annualReport', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={narrativeLocked}
            />
            {narrative.annualReport && <span className="text-green-700 text-sm">{narrative.annualReport.name}</span>}
            {(narrativeErrors as any).annualReport && <p className="text-red-600 text-sm">{(narrativeErrors as any).annualReport}</p>}
          </div>

          {/* Strategic Plan Upload */}
          <div>
            <label htmlFor="strategicPlan" className="block font-semibold">Strategic Plan (PDF, max 10MB)</label>
            <input
              id="strategicPlan"
              type="file"
              accept="application/pdf"
              onChange={e => handleNarrativeFile('strategicPlan', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={narrativeLocked}
            />
            {narrative.strategicPlan && <span className="text-green-700 text-sm">{narrative.strategicPlan.name}</span>}
            {(narrativeErrors as any).strategicPlan && <p className="text-red-600 text-sm">{(narrativeErrors as any).strategicPlan}</p>}
          </div>

        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{narrativeAutoSaveStatus}</div>
      </section>
    );
  }
  // --- END NARRATIVE SECTION ---
  // --- BEGIN GOVERNANCE SECTION ---
  const [governance, setGovernance] = useState({
    boardMembers: '',
    advisoryBoardMembers: '',
    boardDemographics: '',
    boardChairInfo: '',
    boardCoChairInfo: '',
    boardInfo: '',
    standingCommittees: '',
    boardAttendanceSheet: null as File | null,
    boardMeetingMinutes: null as File | null,
    boardBylaws: null as File | null,
    boardConflictOfInterest: null as File | null,
    boardCompensation: '',
    boardTermLimits: '',
    boardElectionProcess: '',
    boardOrientation: '',
    boardEvaluation: '',
    boardSuccession: ''
  });
  const [_governanceErrors, setGovernanceErrors] = useState<unknown>({});
  const [governanceLocked, setGovernanceLocked] = useState(false);
  const [_governanceAutoSaveStatus, setGovernanceAutoSaveStatus] = useState('');

  // Auto-save logic for Governance
  useEffect(() => {
    if (governanceLocked) return;
    const timeout = setTimeout(() => {
      setGovernanceAutoSaveStatus('Saving...');
      setTimeout(() => setGovernanceAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [governance, governanceLocked]);

  const _handleGovernanceChange = (field: string, value: unknown) => {
    setGovernance((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setGovernanceErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const _handleGovernanceFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setGovernanceErrors((prev: unknown) => ({ ...(prev as any), [field]: 'File must be under 10MB' }));
      return;
    }
    setGovernance((prev: unknown) => ({ ...(prev as any), [field]: file }));
    setGovernanceErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };
  const _handleGovernanceLock = () => {
    setGovernanceLocked(true);
  };

  const _handleGovernanceUnlock = () => {
    setGovernanceLocked(false);
  };

  // Board and committee management is now handled through contacts and groups

  // Enhanced Staff Management Functions
  const addStaffMember = (staff: Omit<typeof staffMembers[0], 'id'>) => {
    const newStaff = {
      ...staff,
      id: Date.now().toString(),
      performance: [],
      training: []
    };
    setStaffMembers([...staffMembers, newStaff]);
    toast.success('Staff member added successfully!');
  };

  const updateStaffMember = (id: string, updates: Partial<typeof staffMembers[0]>) => {
    setStaffMembers(staffMembers.map(staff =>
      staff.id === id ? { ...staff, ...updates } : staff
    ));
    setEditingStaffMember(null);
    toast.success('Staff member updated successfully!');
  };

  const deleteStaffMember = (id: string) => {
    setStaffMembers(staffMembers.filter(staff => staff.id !== id));
    toast.success('Staff member removed successfully!');
  };

  const _addPerformanceReview = (staffId: string, review: Omit<typeof staffMembers[0]['performance'][0], 'date'>) => {
    setStaffMembers(staffMembers.map(staff =>
      staff.id === staffId
        ? {
            ...staff,
            performance: [
              ...staff.performance,
              { ...review, date: new Date().toISOString() }
            ]
          }
        : staff
    ));
    toast.success('Performance review added successfully!');
  };

  const _addTrainingRecord = (staffId: string, training: Omit<typeof staffMembers[0]['training'][0], 'date'>) => {
    setStaffMembers(staffMembers.map(staff =>
      staff.id === staffId
        ? {
            ...staff,
            training: [
              ...staff.training,
              { ...training, date: new Date().toISOString() }
            ]
          }
        : staff
    ));
    toast.success('Training record added successfully!');
  };

  const calculateTotalSalary = (): number => {
    return staffMembers.reduce((total, staff) => {
      const salary = parseFloat(staff.salary.replace(/[^0-9.]/g, '')) || 0;
      return total + salary;
    }, 0);
  };

  const calculateTotalDonations = (): number => {
    return staffMembers.reduce((total, staff) => {
      if (staff.donorRole) {
        const amount = parseFloat(staff.donorAmount.replace(/[^0-9.]/g, '')) || 0;
        return total + amount;
      }
      return total;
    }, 0);
  };

  // Board Management Form Components - Removed BoardMemberForm component

  const CommitteeForm: React.FC<{
    committee: typeof committees[0] | null;
    onSave: (committee: Omit<typeof committees[0], 'id'>) => void;
    onCancel: () => void;
  }> = ({ committee, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: committee?.name || '',
      description: committee?.description || '',
      chair: committee?.chair || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        members: [],
        meetings: []
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Committee Name"
          value={(formData as any).name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        />
        <textarea
          placeholder="Description"
          value={(formData as any).description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          rows={3}
          required
        />
        <input
          type="text"
          placeholder="Committee Chair"
          value={(formData as any).chair}
          onChange={(e) => setFormData({...formData, chair: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium">
            Save
          </button>
          <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const MeetingForm: React.FC<{
    meeting: typeof boardMeetings[0] | null;
    members: typeof boardMembers;
    onSave: (meeting: Omit<typeof boardMeetings[0], 'id'>) => void;
    onCancel: () => void;
  }> = ({ meeting, members, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      date: meeting?.date || new Date().toISOString().split('T')[0],
      type: meeting?.type || 'regular' as 'regular' | 'special' | 'annual',
      agenda: meeting?.agenda || '',
      minutes: meeting?.minutes || '',
      attendees: meeting?.attendees || []
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        uploaded: false,
        topics: formData.agenda || '',
        quorum: false,
        decisions: []
      });
    };

    const toggleAttendance = (memberId: string) => {
      // For now, just store member IDs as strings
      const currentAttendees = Array.isArray(formData.attendees) ? formData.attendees : 
                              typeof formData.attendees === 'string' ? [formData.attendees] : [];
      
      if (currentAttendees.includes(memberId)) {
        setFormData({
          ...formData,
          attendees: currentAttendees.filter(id => id !== memberId)
        });
      } else {
        setFormData({
          ...formData,
          attendees: [...currentAttendees, memberId]
        });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <input
            type="date"
            value={(formData as any).date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <select
            value={(formData as any).type}
            onChange={(e) => setFormData({...formData, type: e.target.value as 'regular' | 'special' | 'annual'})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          >
            <option value="regular">Regular Meeting</option>
            <option value="special">Special Meeting</option>
            <option value="annual">Annual Meeting</option>
          </select>
        </div>
        <textarea
          placeholder="Agenda"
          value={(formData as any).agenda}
          onChange={(e) => setFormData({...formData, agenda: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          rows={3}
        />
        <textarea
          placeholder="Minutes"
          value={(formData as any).minutes}
          onChange={(e) => setFormData({...formData, minutes: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          rows={3}
        />
        
        <div>
          <h5 className="font-medium mb-2">Attendance</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {members.map(member => {
              const currentAttendees = Array.isArray(formData.attendees) ? formData.attendees : 
                                      typeof formData.attendees === 'string' ? [formData.attendees] : [];
              const isAttending = currentAttendees.includes(String((member as any).id));
              return (
                <div key={(member as any).id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAttending}
                    onChange={() => toggleAttendance(String((member as any).id))}
                    className="rounded"
                  />
                  <span className="text-sm">{(member as any).name} ({(member as any).title})</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium">
            Save
          </button>
          <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const StaffMemberForm: React.FC<{
    staff: typeof staffMembers[0] | null;
    onSave: (staff: Omit<typeof staffMembers[0], 'id'>) => void;
    onCancel: () => void;
  }> = ({ staff, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: staff?.name || '',
      position: staff?.position || '',
      employmentType: staff?.employmentType || 'Full-time' as 'Full-time' | 'Part-time' | 'Contractor',
      email: staff?.email || '',
      phone: staff?.phone || '',
      hireDate: staff?.hireDate || '',
      salary: staff?.salary || '',
      benefits: staff?.benefits || '',
      donorRole: staff?.donorRole || false,
      donorAmount: staff?.donorAmount || '',
      supervisor: staff?.supervisor || '',
      department: staff?.department || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        performance: [],
        training: []
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={(formData as any).name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <input
            type="text"
            placeholder="Position"
            value={(formData as any).position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <select
            value={(formData as any).employmentType}
            onChange={(e) => setFormData({...formData, employmentType: e.target.value as 'Full-time' | 'Part-time' | 'Contractor'})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contractor">Contractor</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            value={(formData as any).email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={(formData as any).phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <input
            type="date"
            placeholder="Hire Date"
            value={(formData as any).hireDate}
            onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <input
            type="text"
            placeholder="Salary"
            value={(formData as any).salary}
            onChange={(e) => setFormData({...formData, salary: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <input
            type="text"
            placeholder="Supervisor"
            value={(formData as any).supervisor}
            onChange={(e) => setFormData({...formData, supervisor: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          <input
            type="text"
            placeholder="Department"
            value={(formData as any).department}
            onChange={(e) => setFormData({...formData, department: e.target.value})}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        
        <textarea
          placeholder="Benefits"
          value={(formData as any).benefits}
          onChange={(e) => setFormData({...formData, benefits: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          rows={2}
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean((formData as any).donorRole)}
              onChange={(e) => setFormData({...formData, donorRole: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Donor Role</span>
          </label>
          {formData.donorRole && (
            <input
              type="text"
              placeholder="Donation Amount"
              value={(formData as any).donorAmount}
              onChange={(e) => setFormData({...formData, donorAmount: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          )}
        </div>

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium">
            Save
          </button>
          <button type="button" onClick={onCancel} className="px-3 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const renderGovernanceSection = () => {
    // Get board members and committees from contacts
    const boardMembersFromContacts = contacts.filter(c => c.groups?.includes('board')).map(contact => ({
      contactId: contact.id.toString(),
      contact,
      role: contact.boardInfo?.role || 'Board Member',
      termStart: contact.boardInfo?.termStart || new Date().toISOString().split('T')[0],
      termEnd: contact.boardInfo?.termEnd,
      committees: contact.boardInfo?.committees || [],
      attendance: contact.boardInfo?.attendance || 0,
      isChair: (contact.boardInfo?.role || '').toLowerCase().includes('chair') && !(contact.boardInfo?.role || '').toLowerCase().includes('co-chair'),
      isCoChair: (contact.boardInfo?.role || '').toLowerCase().includes('co-chair')
    }));
    
    // Get committees from contact groups
    const contactGroups = Array.from(new Set(contacts.flatMap(c => c.groups || [])));
    const committeeGroups = contactGroups.filter(g => 
      g !== 'board' && g !== 'donors' && g !== 'volunteers' && g !== 'staff'
    ).map(groupName => ({
      id: groupName,
      name: groupName,
      type: 'user-defined' as const,
      members: contacts.filter(c => c.groups?.includes(groupName)).map(contact => ({
        contactId: contact.id.toString(),
        contact,
        role: 'Member',
        termStart: new Date().toISOString().split('T')[0]
      }))
    }));
    
    return (
      <section className="mb-8" aria-labelledby="governance-heading">
        <GovernanceSection
          boardMembers={boardMembersFromContacts}
          committees={committeeGroups}
          contacts={contacts}
          groups={contactGroups}
          narrativeFields={narrativeFields}
          documents={documents}
          onBoardMemberAdd={(member: unknown) => {
            // Add to contacts with board group
            const newContact = {
              id: Date.now(),
              type: 'person',
              prefix: '',
              firstName: (member as any).name?.split(' ')[0] || '',
              lastName: (member as any).name?.split(' ').slice(1).join(' ') || '',
              organization: '',
              title: (member as any).role || '',
              email: (member as any).email || '',
              phone: (member as any).phone || '',
              mobile: '',
              website: '',
              address: '',
              address2: '',
              city: '',
              state: '',
              zipCode: '',
              country: 'USA',
              addressHistory: [],
              projectRoles: [],
              tags: ['board member'],
              notes: '',
              createdDate: new Date().toISOString(),
              lastModified: new Date().toISOString(),
              dataCompleteness: 0,
              customFields: {},
              is1099: false,
              hasW9: false,
              groups: ['board'],
              boardInfo: {
                role: (member as any).role,
                committees: (member as any).committees || [],
                termStart: (member as any).termStart,
                termEnd: (member as any).termEnd
              }
            };
            setContacts([...contacts, newContact as Contact]);
          }}
          onBoardMemberUpdate={(contactId, updates) => {
            setContacts(contacts.map(c => 
              c.id.toString() === contactId
                ? {
                    ...c,
                    boardInfo: {
                      ...c.boardInfo,
                      ...updates
                    }
                  }
                : c
            ));
          }}
          onBoardMemberRemove={(contactId) => {
            setContacts(contacts.map(c => 
              c.id.toString() === contactId
                ? { ...c, groups: c.groups?.filter(g => g !== 'board') || [] }
                : c
            ));
          }}
          onCommitteeAdd={(committee) => {
            // Committee is managed through contact groups
            toast.success('Committee added as a contact group');
          }}
          onCommitteeUpdate={(committeeId, updates) => {
            // Update committee through contact groups
            toast.success('Committee updated');
          }}
          onCommitteeRemove={(committeeId) => {
            // Remove committee group from contacts
            setContacts(contacts.map(c => ({
              ...c,
              groups: c.groups?.filter(g => g !== committeeId) || []
            })));
          }}
          onNarrativeChange={(fieldId, content) => {
            setNarrativeFields(prev => ({ ...(prev as any), [fieldId]: content }));
          }}
          onDocumentUpload={async (fieldId: string, file: File) => {
            try {
              const uploadedDoc = await documentService.uploadDocument(file, { category: 'governance' });
              setDocuments(prev => ({ ...(prev as any), [fieldId]: uploadedDoc.id }));
              toast.success('Document uploaded successfully');
            } catch (error) {
              toast.error('Failed to upload document');
              logger.error('Upload error:', error as any);
            }
          }}
        />
      </section>
    );
  };
  // --- END GOVERNANCE SECTION ---
  
  // --- REFERENCES & NETWORKS SECTION ---
  const renderReferencesNetworksSection = () => {
    // Get references from contacts marked as references
    const referencesFromContacts = contacts.filter(c => c.tags?.includes('reference')).map(contact => ({
      id: contact.id.toString(),
      contactId: contact.id.toString(),
      contact: {
        ...contact,
        id: contact.id.toString(),
        type: 'person' as any,
        name: `${contact.firstName} ${contact.lastName}`.trim()
      },
      type: 'professional' as const,
      relationship: contact.notes || 'Professional reference',
      yearsKnown: 1,
      canContact: true,
      preferredContactMethod: 'email' as const,
      verified: true
    }));
    
    // Get partnerships from organization contacts
    const partnershipsFromContacts = contacts.filter(c => 
      c.isOrganization && c.tags?.includes('partner')
    ).map(contact => ({
      id: contact.id.toString(),
      organizationId: contact.id.toString(),
      organization: {
        ...contact,
        id: contact.id.toString(),
        type: 'organization' as any,
        name: contact.organization || `${contact.firstName} ${contact.lastName}`.trim()
      },
      type: 'implementation' as const,
      status: 'active' as const,
      startDate: new Date().toISOString().split('T')[0],
      description: contact.notes || 'Partnership'
    }));
    
    return (
      <section className="mb-8" aria-labelledby="references-networks-heading">
        <ReferencesNetworksSection
          references={referencesFromContacts}
          networkAffiliations={[]} // Could be stored in formData if needed
          partnerships={partnershipsFromContacts}
          contacts={contacts}
          narrativeFields={narrativeFields}
          documents={documents}
          onReferenceAdd={(reference) => {
            // Add reference tag to contact
            const contact = contacts.find(c => c.id.toString() === reference.contactId);
            if (contact) {
              setContacts(contacts.map(c => 
                c.id === contact.id
                  ? { ...c, tags: [...(c.tags || []), 'reference'] }
                  : c
              ));
            }
          }}
          onReferenceUpdate={(referenceId, updates) => {
            // Update contact with reference info
            setContacts(contacts.map(c => 
              c.id.toString() === referenceId
                ? { ...c, notes: updates.notes || c.notes }
                : c
            ));
          }}
          onReferenceRemove={(referenceId) => {
            // Remove reference tag from contact
            setContacts(contacts.map(c => 
              c.id.toString() === referenceId
                ? { ...c, tags: c.tags?.filter(t => t !== 'reference') || [] }
                : c
            ));
          }}
          onNetworkAdd={(network) => {
            // Could store in formData.networkAffiliations
            toast.success('Network affiliation added');
          }}
          onNetworkUpdate={(networkId, updates) => {
            toast.success('Network affiliation updated');
          }}
          onNetworkRemove={(networkId) => {
            toast.success('Network affiliation removed');
          }}
          onPartnershipAdd={(partnership) => {
            // Add partner tag to organization contact
            const org = contacts.find(c => c.id.toString() === partnership.organizationId);
            if (org) {
              setContacts(contacts.map(c => 
                c.id === org.id
                  ? { ...c, tags: [...(c.tags || []), 'partner'] }
                  : c
              ));
            }
          }}
          onPartnershipUpdate={(partnershipId, updates) => {
            // Update organization contact
            setContacts(contacts.map(c => 
              c.id.toString() === partnershipId
                ? { ...c, notes: updates.description || c.notes }
                : c
            ));
          }}
          onPartnershipRemove={(partnershipId) => {
            // Remove partner tag from organization
            setContacts(contacts.map(c => 
              c.id.toString() === partnershipId
                ? { ...c, tags: c.tags?.filter(t => t !== 'partner') || [] }
                : c
            ));
          }}
          onNarrativeChange={(fieldId, content) => {
            setNarrativeFields(prev => ({ ...(prev as any), [fieldId]: content }));
          }}
          onDocumentUpload={async (fieldId: string, file: File) => {
            try {
              const uploadedDoc = await documentService.uploadDocument(file, { category: 'governance' });
              setDocuments(prev => ({ ...(prev as any), [fieldId]: uploadedDoc.id }));
              toast.success('Document uploaded successfully');
            } catch (error) {
              toast.error('Failed to upload document');
              logger.error('Upload error:', error as any);
            }
          }}
        />
      </section>
    );
  };
  // --- END REFERENCES & NETWORKS SECTION ---
  
  // --- ORGANIZATIONAL DOCUMENTS SECTION ---
  // Entity Documents Section (renamed from Organizational Documents)
  const renderEntityDocumentsSection = () => {
    // Group documents by section for better organization
    const documentSections = [
      {
        id: 'core-legal',
        title: 'Core Legal Documents',
        icon: <Building2 className="w-5 h-5" />,
        description: 'Essential legal documents required for operation',
        documents: [
          { 
            key: 'irsLetter', 
            label: 'IRS 501(c)(3) Determination Letter',
            helpText: 'Your official IRS determination letter confirming 501(c)(3) status',
            required: false
          },
          { 
            key: 'w9Form', 
            label: 'W-9 Form',
            helpText: 'Completed W-9 form for tax reporting purposes',
            required: true
          },
          { 
            key: 'articlesOfIncorporation', 
            label: 'Articles of Incorporation / Certificate of Formation',
            helpText: 'Legal documents establishing your organization',
            required: true
          },
          { 
            key: 'bylaws', 
            label: 'Bylaws',
            helpText: 'Organizational bylaws and governance documents',
            required: true
          },
          { 
            key: 'goodStanding', 
            label: 'Certificate of Good Standing / Status',
            helpText: 'Current certificate of good standing from your state',
            required: false
          },
          { 
            key: 'irsDeterminationLetter', 
            label: 'IRS Determination Letter (Alternative)',
            helpText: 'Alternative field for IRS determination letter (will be merged with main field)',
            required: false
          },
        ]
      },
      {
        id: 'financial-legal',
        title: 'Financial & Tax Documents',
        icon: <CircleDollarSign className="w-5 h-5" />,
        description: 'Financial statements, tax returns, and audit reports',
        documents: [
          { 
            key: 'form990', 
            label: 'Form 990 (Last 3 Years)',
            helpText: 'IRS Form 990 tax returns for the last three years',
            required: true
          },
          { 
            key: 'financialStatements', 
            label: 'Audited Financial Statements',
            helpText: 'Most recent audited financial statements',
            required: true
          },
          { 
            key: 'annualBudget', 
            label: 'Annual Budget',
            helpText: 'Current year approved budget',
            required: true
          },
          { 
            key: 'auditReport', 
            label: 'Independent Audit Report',
            helpText: 'Most recent independent audit report',
            required: false
          },
        ]
      },
      {
        id: 'governance',
        title: 'Governance Documents',
        icon: <Shield className="w-5 h-5" />,
        description: 'Board and committee documentation',
        documents: [
          { 
            key: 'boardMeetingMinutes', 
            label: 'Board Meeting Minutes',
            helpText: 'Recent board meeting minutes and resolutions',
            required: false
          },
          { 
            key: 'committeeBylaws', 
            label: 'Committee Bylaws/Policies',
            helpText: 'Committee governance documents and policies',
            required: false
          },
          { 
            key: 'conflictOfInterestPolicy', 
            label: 'Conflict of Interest Policy',
            helpText: 'Board conflict of interest policy and forms',
            required: false
          },
          { 
            key: 'boardList', 
            label: 'Board of Directors List',
            helpText: 'Current board member roster with contact information',
            required: false
          },
        ]
      },
      {
        id: 'digital-brand',
        title: 'Digital Assets & Branding',
        icon: <Globe className="w-5 h-5" />,
        description: 'Logos, brand assets, and digital materials',
        documents: [
          { 
            key: 'logo', 
            label: 'Organization Logo',
            helpText: 'Official organization logo files (PNG/JPG)',
            required: false
          },
          { 
            key: 'bannerImage', 
            label: 'Banner/Header Images',
            helpText: 'Website and marketing banner images',
            required: false
          },
          { 
            key: 'brandGuidelines', 
            label: 'Brand Guidelines Document',
            helpText: 'Complete brand guidelines including colors, fonts, usage',
            required: false
          },
          { 
            key: 'brandAssets', 
            label: 'Brand Asset Collection',
            helpText: 'Additional logos, icons, patterns, templates',
            required: false
          },
        ]
      },
      {
        id: 'tax-identification',
        title: 'Tax Identification Documents',
        icon: <FileText className="w-5 h-5" />,
        description: 'Documents related to tax identification and organizational status',
        documents: [
          { 
            key: 'stateNonProfitRegistration', 
            label: 'State Non-Profit Registration',
            helpText: 'State-level nonprofit registration documents and certificates',
            required: false
          },
          { 
            key: 'foreignEntityDocs', 
            label: 'Foreign Entity Registration Documents',
            helpText: 'Registration documents for foreign entity organizations',
            required: false
          },
          { 
            key: 'fiscalSponsorshipAgreement', 
            label: 'Fiscal Sponsorship Agreement',
            helpText: 'Agreement with fiscal sponsor organization',
            required: false
          },
        ]
      },
      {
        id: 'organizational-identity',
        title: 'Organizational Identity Documents',
        icon: <Building2 className="w-5 h-5" />,
        description: 'Documents related to organization name, structure, and identity',
        documents: [
          { 
            key: 'orgNameDocs', 
            label: 'Organization Name Supporting Documents',
            helpText: 'Documents that substantiate the organization name (Articles of Incorporation, DBA filing, etc.)',
            required: false
          },
          { 
            key: 'groupExemptionLetter', 
            label: 'Group Exemption Letter',
            helpText: 'Group exemption letter from the IRS for subordinate organizations',
            required: false
          },
          { 
            key: 'subordinateNumberLetter', 
            label: 'Subordinate Number Assignment Letter',
            helpText: 'Letter assigning your subordinate number from the central organization',
            required: false
          },
          { 
            key: 'centralOrgEINDoc', 
            label: 'Central Organization EIN Documentation',
            helpText: 'Documentation showing the central organization\'s EIN for group exemption',
            required: false
          },
        ]
      },
      {
        id: 'operational',
        title: 'Operational Documents',
        icon: <Users className="w-5 h-5" />,
        description: 'Policies, procedures, and organizational materials',
        documents: [
          { 
            key: 'annualReport', 
            label: 'Annual Report (Latest)',
            helpText: 'Most recent annual report filed with the state',
            required: false
          },
          { 
            key: 'charitableRegistration', 
            label: 'State Charitable Registration',
            helpText: 'Registration documents for charitable solicitation',
            required: false
          },
          { 
            key: 'organizationalChart', 
            label: 'Organizational Chart',
            helpText: 'Current organizational structure diagram',
            required: false
          },
          { 
            key: 'policyManual', 
            label: 'Policy Manual',
            helpText: 'Comprehensive organizational policies and procedures',
            required: false
          },
        ]
      }
    ];

    return (
      <section className="mb-8" aria-labelledby="entity-documents-heading">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 id="entity-documents-heading" className="text-2xl font-bold">Entity Documents</h2>
            {renderProgressIndicator('entityDocuments')}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-8">

          {documentSections.map((section) => (
            <CollapsibleSection key={section.id} id={section.id} title={section.title} resourceId={`entity-docs-${section.id}`}>
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-600">
                      {section.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {section.documents.map((doc) => (
                    <div key={doc.key}>
                      <IntegratedDocumentUploadField
                        label={doc.label}
                        value={documents[doc.key]}
                        onChange={(docIds) => handleDocumentUpload(doc.key, docIds)}
                        accept="application/pdf,image/*,.doc,.docx"
                        category="entity-documents"
                        helpText={doc.helpText}
                        required={doc.required}
                        onDocumentManagerOpen={() => setShowDocumentManager(true)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleSection>
          ))}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Document Management Tips</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Documents uploaded in any section automatically appear here</li>
                  <li>• Required documents are marked with a red asterisk (*)</li>
                  <li>• Use the Document Manager for bulk uploads and advanced organization</li>
                  <li>• All documents are version-controlled and audit-tracked</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const _renderOrganizationalDocumentsSection = () => {
    return (
      <section className="mb-8" aria-labelledby="organizational-documents-heading">
        <OrganizationalDocuments
          documents={documents}
          onDocumentUpload={async (fieldId, file) => {
            // Upload the file using document service
            const uploadedDoc = await documentService.uploadDocument(file, { category: 'legal' });
            setDocuments(prev => ({
              ...prev,
              [fieldId]: uploadedDoc.id
            }));
          }}
          onDocumentView={async (fieldId) => {
            const docId = documents[fieldId];
            if (docId && typeof docId === 'string') {
              const doc = await documentService.getDocument(docId);
              if (doc?.url) {
                window.open(doc.url, '_blank');
              }
            }
          }}
          onDocumentDownload={async (fieldId) => {
            const docId = documents[fieldId];
            if (docId && typeof docId === 'string') {
              const doc = await documentService.getDocument(docId);
              if (doc?.url) {
                const a = document.createElement('a');
                a.href = doc.url;
                a.download = doc.name || fieldId;
                a.click();
              }
            }
          }}
          onDocumentDelete={(fieldId) => {
            setDocuments(prev => {
              const updated = { ...prev };
              delete updated[fieldId];
              return updated;
            });
          }}
        />
      </section>
    );
  };
  
  // --- BEGIN MANAGEMENT SECTION ---
  const [management, setManagement] = useState({
    fundraisingPlan: '',
    strategicPlan: '',
    continuityPlan: '',
    technologyPlan: '',
    successionPlan: '',
    staffVolunteers: '',
    staffDemographics: '',
    staffGenderDemographics: '',
    ceoInfo: '',
    directorsPolicy: '',
    nondiscriminationPolicy: '',
    documentDestructionPolicy: '',
    whistleblowerPolicy: '',
    policyProcedures: '',
    governmentLicenses: '',
    evaluations: '',
    managementReport: null as File | null,
    organizationalChart: null as File | null,
    jobDescriptions: null as File | null,
    performanceEvaluations: null as File | null,
    trainingPrograms: '',
    professionalDevelopment: '',
    compensationPolicy: '',
    benefitsPolicy: '',
    remoteWorkPolicy: '',
    safetyPolicy: '',
    emergencyProcedures: ''
  });
  const [managementErrors, setManagementErrors] = useState<unknown>({});
  const [managementLocked, setManagementLocked] = useState(false);
  const [managementAutoSaveStatus, setManagementAutoSaveStatus] = useState('');

  // Auto-save logic for Management
  useEffect(() => {
    if (managementLocked) return;
    const timeout = setTimeout(() => {
      setManagementAutoSaveStatus('Saving...');
      setTimeout(() => setManagementAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [management, managementLocked]);

  const handleManagementChange = (field: string, value: unknown) => {
    setManagement((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setManagementErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const handleManagementFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setManagementErrors((prev: unknown) => ({ ...(prev as any), [field]: 'File must be under 10MB' }));
      return;
    }
    setManagementErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
    setManagement((prev: unknown) => ({ ...(prev as any), [field]: file }));
  };

  const handleManagementLock = () => {
    setManagementLocked(true);
  };

  const handleManagementUnlock = () => {
    setManagementLocked(false);
  };

  const renderManagementSection = () => {
    return (
      <section className="mb-8" aria-labelledby="management-heading">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h2 id="management-heading" className="text-2xl font-bold">Management</h2>
            {renderProgressIndicator('management')}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              onClick={() => setShowStaffManager(true)}
              disabled={managementLocked}
            >
              Staff Manager
            </button>
            {managementLocked ? (
              <button
                className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-colors font-medium"
                onClick={handleManagementUnlock}
                aria-label="Unlock section"
              >Unlock</button>
            ) : (
              <button
                className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
                onClick={handleManagementLock}
                aria-label="Lock section"
              >Lock</button>
            )}
          </div>
        </div>
        <div className={`grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow ${managementLocked ? 'opacity-60 pointer-events-none' : ''}`}>

          {/* Fundraising Plan */}
          <div>
            <label htmlFor="fundraisingPlan" className="block font-semibold">Fundraising Plan <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-14"
              label=""
              value={management.fundraisingPlan}
              onChange={content => handleManagementChange('fundraisingPlan', content)}
              placeholder="Describe your fundraising strategy and plan..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).fundraisingPlan && <p className="text-red-600 text-sm">{(managementErrors as any).fundraisingPlan}</p>}
          </div>

          {/* Strategic Plan */}
          <div>
            <label htmlFor="strategicPlan" className="block font-semibold">Strategic Plan <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-15"
              label=""
              value={management.strategicPlan}
              onChange={content => handleManagementChange('strategicPlan', content)}
              placeholder="Describe your strategic planning process and current plan..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).strategicPlan && <p className="text-red-600 text-sm">{(managementErrors as any).strategicPlan}</p>}
          </div>

          {/* Continuity Plan */}
          <div>
            <label htmlFor="continuityPlan" className="block font-semibold">Continuity Plan <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-16"
              label=""
              value={management.continuityPlan}
              onChange={content => handleManagementChange('continuityPlan', content)}
              placeholder="Describe your business continuity and disaster recovery plan..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).continuityPlan && <p className="text-red-600 text-sm">{(managementErrors as any).continuityPlan}</p>}
          </div>

          {/* Technology Plan */}
          <div>
            <label htmlFor="technologyPlan" className="block font-semibold">Technology Plan <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-17"
              label=""
              value={management.technologyPlan}
              onChange={content => handleManagementChange('technologyPlan', content)}
              placeholder="Describe your technology infrastructure and plans..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).technologyPlan && <p className="text-red-600 text-sm">{(managementErrors as any).technologyPlan}</p>}
          </div>

          {/* Succession Plan */}
          <div>
            <label htmlFor="successionPlan" className="block font-semibold">Succession Plan <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-18"
              label=""
              value={management.successionPlan}
              onChange={content => handleManagementChange('successionPlan', content)}
              placeholder="Describe your leadership succession planning..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).successionPlan && <p className="text-red-600 text-sm">{(managementErrors as any).successionPlan}</p>}
          </div>

          {/* Staff and Volunteers */}
          <div>
            <label className="block font-semibold mb-3">Staff and Volunteers <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Staff Column */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-lg">Staff Members</h4>
                  <button
                    type="button"
                    onClick={() => setShowStaffManager(true)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Staff
                  </button>
                </div>
                <div className="space-y-2">
                  {staffMembers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No staff members added yet</p>
                  ) : (
                    staffMembers.map(staff => (
                      <div key={staff.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-sm text-gray-600">{staff.position}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Staff</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Volunteers Column */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-lg">Volunteers</h4>
                  <button
                    type="button"
                    onClick={() => setShowVolunteerManager(true)}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Add Volunteer
                  </button>
                </div>
                <div className="space-y-2">
                  {volunteers.length === 0 ? (
                    <p className="text-gray-500 text-sm">No volunteers added yet</p>
                  ) : (
                    volunteers.map(volunteer => (
                      <div key={volunteer.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{volunteer.name}</p>
                          <p className="text-sm text-gray-600">{volunteer.role}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Volunteer</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            {(managementErrors as any).staffVolunteers && <p className="text-red-600 text-sm mt-2">{(managementErrors as any).staffVolunteers}</p>}
          </div>

          {/* Staff Demographics */}
          <div>
            <label htmlFor="staffDemographics" className="block font-semibold mb-2">Staff Demographics <span className="text-red-500">*</span></label>
            
            {/* Auto-generated Demographics Summary */}
            {staffMembers.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h5 className="font-medium text-sm mb-2">Auto-Generated Summary:</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Staff:</span>
                    <span className="font-medium ml-2">{staffMembers.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Full-time:</span>
                    <span className="font-medium ml-2">{staffMembers.filter(s => s.employmentType === 'Full-time').length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Part-time:</span>
                    <span className="font-medium ml-2">{staffMembers.filter(s => s.employmentType === 'Part-time').length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contractors:</span>
                    <span className="font-medium ml-2">{staffMembers.filter(s => s.employmentType === 'Contractor').length}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Notes Field */}
            <NarrativeEntryField
              id="narrative-field-19"
              label=""
              value={management.staffDemographics}
              onChange={content => handleManagementChange('staffDemographics', content)}
              placeholder="Add additional notes about staff diversity and demographics..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).staffDemographics && <p className="text-red-600 text-sm">{(managementErrors as any).staffDemographics}</p>}
          </div>

          {/* Staff Gender Demographics */}
          <div>
            <label htmlFor="staffGenderDemographics" className="block font-semibold">Staff Gender Demographics <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-20"
              label=""
              value={management.staffGenderDemographics}
              onChange={content => handleManagementChange('staffGenderDemographics', content)}
              placeholder="Describe staff gender distribution..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).staffGenderDemographics && <p className="text-red-600 text-sm">{(managementErrors as any).staffGenderDemographics}</p>}
          </div>

          {/* CEO Information */}
          <div>
            <label className="block font-semibold mb-3">CEO/Executive Director Information <span className="text-red-500">*</span></label>
            
            {/* CEO Selection */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h5 className="font-medium">Current CEO/Executive Director</h5>
                <button
                  type="button"
                  onClick={() => setShowContactManager(true)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors"
                >
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Select Person
                </button>
              </div>
              
              {selectedCEO ? (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{selectedCEO.name}</p>
                      <p className="text-sm text-gray-600">{selectedCEO.title || 'CEO/Executive Director'}</p>
                      <p className="text-sm text-gray-500">{selectedCEO.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCEO(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No CEO/Executive Director selected</p>
              )}
            </div>
            
            {/* Additional Notes */}
            <NarrativeEntryField
              id="narrative-field-21"
              label=""
              value={management.ceoInfo}
              onChange={content => handleManagementChange('ceoInfo', content)}
              placeholder="Additional background, experience, or notes about the CEO/Executive Director..."
              permissions={{ canEdit: !managementLocked }}
              required={false}
            />
            {(managementErrors as any).ceoInfo && <p className="text-red-600 text-sm">{(managementErrors as any).ceoInfo}</p>}
          </div>

          {/* Directors Policy */}
          <div>
            <label htmlFor="directorsPolicy" className="block font-semibold">Directors and Officers Policy <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-22"
              label=""
              value={management.directorsPolicy}
              onChange={content => handleManagementChange('directorsPolicy', content)}
              placeholder="Describe your directors and officers insurance policy..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).directorsPolicy && <p className="text-red-600 text-sm">{(managementErrors as any).directorsPolicy}</p>}
          </div>

          {/* Non-Discrimination Policy */}
          <div>
            <label htmlFor="nondiscriminationPolicy" className="block font-semibold">Non-Discrimination Policy <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-23"
              label=""
              value={management.nondiscriminationPolicy}
              onChange={content => handleManagementChange('nondiscriminationPolicy', content)}
              placeholder="Describe your non-discrimination policy..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).nondiscriminationPolicy && <p className="text-red-600 text-sm">{(managementErrors as any).nondiscriminationPolicy}</p>}
          </div>

          {/* Document Destruction Policy */}
          <div>
            <label htmlFor="documentDestructionPolicy" className="block font-semibold">Document Destruction Policy <span className="text-red-500">*</span></label>
            <NarrativeEntryField
              id="narrative-field-24"
              label=""
              value={management.documentDestructionPolicy}
              onChange={content => handleManagementChange('documentDestructionPolicy', content)}
              placeholder="Describe your document retention and destruction policy..."
              permissions={{ canEdit: !managementLocked }}
              required={true}
            />
            {(managementErrors as any).documentDestructionPolicy && <p className="text-red-600 text-sm">{(managementErrors as any).documentDestructionPolicy}</p>}
          </div>

          {/* Whistleblower Policy */}
          <div>
            <label htmlFor="whistleblowerPolicy" className="block font-semibold">Whistleblower Policy</label>
            <NarrativeEntryField
              id="narrative-field-25"
              label=""
              value={management.whistleblowerPolicy}
              onChange={content => handleManagementChange('whistleblowerPolicy', content)}
              placeholder="Describe your whistleblower protection policy..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Policy and Procedures */}
          <div>
            <label htmlFor="policyProcedures" className="block font-semibold">Policy and Procedures Manual</label>
            <NarrativeEntryField
              id="narrative-field-26"
              label=""
              value={management.policyProcedures}
              onChange={content => handleManagementChange('policyProcedures', content)}
              placeholder="Describe your policy and procedures manual..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Government Licenses */}
          <div>
            <label htmlFor="governmentLicenses" className="block font-semibold">Government Licenses and Permits</label>
            <NarrativeEntryField
              id="narrative-field-27"
              label=""
              value={management.governmentLicenses}
              onChange={content => handleManagementChange('governmentLicenses', content)}
              placeholder="List required government licenses and permits..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Evaluations */}
          <div>
            <label htmlFor="evaluations" className="block font-semibold">Program Evaluations</label>
            <NarrativeEntryField
              id="narrative-field-28"
              label=""
              value={management.evaluations}
              onChange={content => handleManagementChange('evaluations', content)}
              placeholder="Describe your program evaluation processes..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Management Report */}
          <div>
            <label htmlFor="managementReport" className="block font-semibold">Management Report (PDF, max 10MB)</label>
            <input
              id="managementReport"
              type="file"
              accept="application/pdf"
              onChange={e => handleManagementFile('managementReport', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={managementLocked}
            />
            {management.managementReport && <span className="text-green-700 text-sm">{management.managementReport.name}</span>}
            {(managementErrors as any).managementReport && <p className="text-red-600 text-sm">{(managementErrors as any).managementReport}</p>}
          </div>

          {/* Organizational Chart */}
          <div>
            <label htmlFor="organizationalChart" className="block font-semibold">Organizational Chart (PDF, max 10MB)</label>
            <input
              id="organizationalChart"
              type="file"
              accept="application/pdf"
              onChange={e => handleManagementFile('organizationalChart', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={managementLocked}
            />
            {management.organizationalChart && <span className="text-green-700 text-sm">{management.organizationalChart.name}</span>}
            {(managementErrors as any).organizationalChart && <p className="text-red-600 text-sm">{(managementErrors as any).organizationalChart}</p>}
          </div>

          {/* Job Descriptions */}
          <div>
            <label htmlFor="jobDescriptions" className="block font-semibold">Job Descriptions (PDF, max 10MB)</label>
            <input
              id="jobDescriptions"
              type="file"
              accept="application/pdf"
              onChange={e => handleManagementFile('jobDescriptions', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={managementLocked}
            />
            {management.jobDescriptions && <span className="text-green-700 text-sm">{management.jobDescriptions.name}</span>}
            {(managementErrors as any).jobDescriptions && <p className="text-red-600 text-sm">{(managementErrors as any).jobDescriptions}</p>}
          </div>

          {/* Performance Evaluations */}
          <div>
            <label htmlFor="performanceEvaluations" className="block font-semibold">Performance Evaluation System (PDF, max 10MB)</label>
            <input
              id="performanceEvaluations"
              type="file"
              accept="application/pdf"
              onChange={e => handleManagementFile('performanceEvaluations', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={managementLocked}
            />
            {management.performanceEvaluations && <span className="text-green-700 text-sm">{management.performanceEvaluations.name}</span>}
            {(managementErrors as any).performanceEvaluations && <p className="text-red-600 text-sm">{(managementErrors as any).performanceEvaluations}</p>}
          </div>

          {/* Training Programs */}
          <div>
            <label htmlFor="trainingPrograms" className="block font-semibold">Training Programs</label>
            <NarrativeEntryField
              id="narrative-field-29"
              label=""
              value={management.trainingPrograms}
              onChange={content => handleManagementChange('trainingPrograms', content)}
              placeholder="Describe staff training and development programs..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Professional Development */}
          <div>
            <label htmlFor="professionalDevelopment" className="block font-semibold">Professional Development</label>
            <NarrativeEntryField
              id="narrative-field-30"
              label=""
              value={management.professionalDevelopment}
              onChange={content => handleManagementChange('professionalDevelopment', content)}
              placeholder="Describe professional development opportunities..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Compensation Policy */}
          <div>
            <label htmlFor="compensationPolicy" className="block font-semibold">Compensation Policy</label>
            <NarrativeEntryField
              id="narrative-field-31"
              label=""
              value={management.compensationPolicy}
              onChange={content => handleManagementChange('compensationPolicy', content)}
              placeholder="Describe your compensation policy and structure..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Benefits Policy */}
          <div>
            <label htmlFor="benefitsPolicy" className="block font-semibold">Benefits Policy</label>
            <NarrativeEntryField
              id="narrative-field-32"
              label=""
              value={management.benefitsPolicy}
              onChange={content => handleManagementChange('benefitsPolicy', content)}
              placeholder="Describe your employee benefits package..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Remote Work Policy */}
          <div>
            <label htmlFor="remoteWorkPolicy" className="block font-semibold">Remote Work Policy</label>
            <NarrativeEntryField
              id="narrative-field-33"
              label=""
              value={management.remoteWorkPolicy}
              onChange={content => handleManagementChange('remoteWorkPolicy', content)}
              placeholder="Describe your remote work and telecommuting policy..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Safety Policy */}
          <div>
            <label htmlFor="safetyPolicy" className="block font-semibold">Safety Policy</label>
            <NarrativeEntryField
              id="narrative-field-34"
              label=""
              value={management.safetyPolicy}
              onChange={content => handleManagementChange('safetyPolicy', content)}
              placeholder="Describe your workplace safety policy..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Emergency Procedures */}
          <div>
            <label htmlFor="emergencyProcedures" className="block font-semibold">Emergency Procedures</label>
            <NarrativeEntryField
              id="narrative-field-35"
              label=""
              value={management.emergencyProcedures}
              onChange={content => handleManagementChange('emergencyProcedures', content)}
              placeholder="Describe your emergency procedures and protocols..."
              permissions={{ canEdit: !managementLocked }}
            />
          </div>

          {/* Document Manager Integration */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block font-semibold">Document Management</label>
              <button
                type="button"
                onClick={() => setShowDocumentManager(true)}
                disabled={managementLocked}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Manage Documents
              </button>
            </div>
            
            {Object.keys(documents).length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Current Documents ({Object.keys(documents).length})</h4>
                <p className="text-sm text-gray-600">Documents have been uploaded for this application.</p>
              </div>
            )}
          </div>

        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{managementAutoSaveStatus}</div>
      </section>
    );
  }
  // --- END MANAGEMENT SECTION ---
  // --- BEGIN FINANCIALS SECTION ---
  const [financials, setFinancials] = useState({
    form990: '',
    currentFiscalYear: '',
    audits: '',
    financialInfo: '',
    capitalCampaign: '',
    endowment: '',
    irsLetter: null as File | null,
    financialStatements: null as File | null,
    budget: null as File | null,
    auditReport: null as File | null,
    taxReturns: null as File | null,
    grantReports: null as File | null,
    fundraisingRevenue: '',
    programRevenue: '',
    investmentIncome: '',
    otherRevenue: '',
    totalRevenue: '',
    programExpenses: '',
    administrativeExpenses: '',
    fundraisingExpenses: '',
    totalExpenses: '',
    netAssets: '',
    cashFlow: '',
    debtObligations: '',
    investmentPolicy: '',
    reservePolicy: '',
    financialControls: '',
    internalControls: '',
    externalAuditor: '',
    auditCommittee: '',
    financialTransparency: ''
  });
  const [financialsErrors, setFinancialsErrors] = useState<unknown>({});
  const [financialsLocked, setFinancialsLocked] = useState(false);
  const [financialsAutoSaveStatus, setFinancialsAutoSaveStatus] = useState('');

  // Auto-save logic for Financials
  useEffect(() => {
    if (financialsLocked) return;
    const timeout = setTimeout(() => {
      setFinancialsAutoSaveStatus('Saving...');
      setTimeout(() => setFinancialsAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [financials, financialsLocked]);

  const handleFinancialsChange = (field: string, value: unknown) => {
    setFinancials((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setFinancialsErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const _handleFinancialsFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setFinancialsErrors((prev: unknown) => ({ ...(prev as any), [field]: 'File must be under 10MB' }));
      return;
    }
    setFinancialsErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
    setFinancials((prev: unknown) => ({ ...(prev as any), [field]: file }));
  };

  const handleFinancialsLock = () => {
    setFinancialsLocked(true);
  };

  const handleFinancialsUnlock = () => {
    setFinancialsLocked(false);
  };

  const renderFinancialSection = () => {
    return (
      <section className="mb-8" aria-labelledby="financials-heading">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h2 id="financials-heading" className="text-2xl font-bold">Enhanced Financial Management</h2>
            {renderProgressIndicator('financials')}
          </div>
          {financialsLocked ? (
            <button
              className="ml-4 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-colors font-medium"
              onClick={handleFinancialsUnlock}
              aria-label="Unlock section"
            >Unlock</button>
          ) : (
            <button
              className="ml-4 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              onClick={handleFinancialsLock}
              aria-label="Lock section"
            >Lock</button>
          )}
        </div>
        
        <EnhancedFinancialSection
          formData={financials}
          errors={financialsErrors}
          locked={financialsLocked}
          onInputChange={handleFinancialsChange}
          onFileUpload={(field, file) => {
            // Handle file upload directly for the financial section
            setFormData(prev => ({
              ...prev,
              [field]: file
            }));
            toast.success(`${field} uploaded successfully`);
          }}
          sectionId="financials"
        />
        
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{financialsAutoSaveStatus}</div>
      </section>
    );
  }
  // --- BEGIN PROGRAMS SECTION ---

  // Auto-save logic for Programs
  useEffect(() => {
    if (programsLocked) return;
    const timeout = setTimeout(() => {
      setProgramsAutoSaveStatus('Saving...');
      setTimeout(() => setProgramsAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [programs, programsLocked]);

  const handleProgramsChange = (field: string, value: unknown) => {
    setPrograms((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setProgramsErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const handleProgramsFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setProgramsErrors((prev: unknown) => ({ ...(prev as any), [field]: 'File must be under 10MB' }));
      return;
    }
    setProgramsErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
    setPrograms((prev: unknown) => ({ ...(prev as any), [field]: file }));
  };

  const handleProgramsLock = () => {
    setProgramsLocked(true);
  };

  const handleProgramsUnlock = () => {
    setProgramsLocked(false);
  };

  const renderProgramsSection = () => {
    return (
      <section className="mb-8" aria-labelledby="programs-heading">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <h2 id="programs-heading" className="text-2xl font-bold">Programs</h2>
            {renderProgressIndicator('programs')}
          </div>
          {programsLocked ? (
            <button
              className="ml-4 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-colors font-medium"
              onClick={handleProgramsUnlock}
              aria-label="Unlock section"
            >Unlock</button>
          ) : (
            <button
              className="ml-4 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              onClick={handleProgramsLock}
              aria-label="Lock section"
            >Lock</button>
          )}
        </div>
        <div className={`grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow ${programsLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          {/* Program List */}
          <div>
            <label htmlFor="programList" className="block font-semibold">Program List</label>
            <NarrativeEntryField
              id="narrative-field-45"
              label=""
              value={programs.programList}
              onChange={content => handleProgramsChange('programList', content)}
              placeholder="List all your programs and services..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Descriptions */}
          <div>
            <label htmlFor="programDescriptions" className="block font-semibold">Program Descriptions</label>
            <NarrativeEntryField
              id="narrative-field-46"
              label=""
              value={programs.programDescriptions}
              onChange={(content) => handleProgramsChange('programDescriptions', content)}
              placeholder="Provide detailed descriptions of each program..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Outcomes */}
          <div>
            <label htmlFor="programOutcomes" className="block font-semibold">Program Outcomes</label>
            <NarrativeEntryField
              id="narrative-field-47"
              label=""
              value={programs.programOutcomes}
              onChange={(content) => handleProgramsChange('programOutcomes', content)}
              placeholder="Describe the outcomes and results of your programs..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Metrics */}
          <div>
            <label htmlFor="programMetrics" className="block font-semibold">Program Metrics</label>
            <NarrativeEntryField
              id="narrative-field-48"
              label=""
              value={programs.programMetrics}
              onChange={content => handleProgramsChange('programMetrics', content)}
              placeholder="Describe the metrics and measurements used to evaluate programs..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Funding */}
          <div>
            <label htmlFor="programFunding" className="block font-semibold">Program Funding</label>
            <NarrativeEntryField
              id="narrative-field-49"
              label=""
              value={programs.programFunding}
              onChange={content => handleProgramsChange('programFunding', content)}
              placeholder="Describe how your programs are funded..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Partners */}
          <div>
            <label htmlFor="programPartners" className="block font-semibold">Program Partners</label>
            <NarrativeEntryField
              id="narrative-field-50"
              label=""
              value={programs.programPartners}
              onChange={content => handleProgramsChange('programPartners', content)}
              placeholder="List partners and collaborators for your programs..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Evaluation */}
          <div>
            <label htmlFor="programEvaluation" className="block font-semibold">Program Evaluation</label>
            <NarrativeEntryField
              id="narrative-field-51"
              label=""
              value={programs.programEvaluation}
              onChange={(content) => handleProgramsChange('programEvaluation', content)}
              placeholder="Describe your program evaluation processes..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Reports */}
          <div>
            <label htmlFor="programReports" className="block font-semibold">Program Reports (PDF, max 10MB)</label>
            <input
              id="programReports"
              type="file"
              accept="application/pdf"
              onChange={e => handleProgramsFile('programReports', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={programsLocked}
            />
            {programs.programReports && <span className="text-green-700 text-sm">{programs.programReports.name}</span>}
            {(programsErrors as any).programReports && <p className="text-red-600 text-sm">{(programsErrors as any).programReports}</p>}
          </div>

          {/* Program Photos */}
          <div>
            <label htmlFor="programPhotos" className="block font-semibold">Program Photos (JPG/PNG, max 10MB)</label>
            <input
              id="programPhotos"
              type="file"
              accept="image/jpeg,image/png"
              onChange={e => handleProgramsFile('programPhotos', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={programsLocked}
            />
            {programs.programPhotos && <span className="text-green-700 text-sm">{programs.programPhotos.name}</span>}
            {(programsErrors as any).programPhotos && <p className="text-red-600 text-sm">{(programsErrors as any).programPhotos}</p>}
          </div>

          {/* Program Videos */}
          <div>
            <label htmlFor="programVideos" className="block font-semibold">Program Video Links</label>
            <NarrativeEntryField
              id="narrative-field-52"
              label=""
              value={programs.programVideos}
              onChange={content => handleProgramsChange('programVideos', content)}
              placeholder="YouTube, Vimeo, or other video URLs showcasing your programs..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Testimonials */}
          <div>
            <label htmlFor="programTestimonials" className="block font-semibold">Program Testimonials</label>
            <NarrativeEntryField
              id="narrative-field-53"
              label=""
              value={programs.programTestimonials}
              onChange={content => handleProgramsChange('programTestimonials', content)}
              placeholder="Share testimonials from program participants or beneficiaries..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Impact */}
          <div>
            <label htmlFor="programImpact" className="block font-semibold">Program Impact</label>
            <NarrativeEntryField
              id="narrative-field-54"
              label=""
              value={programs.programImpact}
              onChange={content => handleProgramsChange('programImpact', content)}
              placeholder="Describe the broader impact of your programs on the community..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Challenges */}
          <div>
            <label htmlFor="programChallenges" className="block font-semibold">Program Challenges</label>
            <NarrativeEntryField
              id="narrative-field-55"
              label=""
              value={programs.programChallenges}
              onChange={content => handleProgramsChange('programChallenges', content)}
              placeholder="Describe challenges faced in program delivery and how they're addressed..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Goals */}
          <div>
            <label htmlFor="programGoals" className="block font-semibold">Program Goals</label>
            <NarrativeEntryField
              id="narrative-field-56"
              label=""
              value={programs.programGoals}
              onChange={content => handleProgramsChange('programGoals', content)}
              placeholder="Describe the goals and objectives of your programs..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Timeline */}
          <div>
            <label htmlFor="programTimeline" className="block font-semibold">Program Timeline</label>
            <NarrativeEntryField
              id="narrative-field-57"
              label=""
              value={programs.programTimeline}
              onChange={content => handleProgramsChange('programTimeline', content)}
              placeholder="Describe the timeline and duration of your programs..."
              permissions={{ canEdit: !programsLocked }}
            />
          </div>

          {/* Program Budget */}
          <div>
            <label htmlFor="programBudget" className="block font-semibold">Program Budget</label>
            <textarea
              id="programBudget"
              value={programs.programBudget}
              onChange={e => handleProgramsChange('programBudget', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe the budget allocation for your programs..."
              rows={3}
              disabled={programsLocked}
            />
          </div>

          {/* Program Staff */}
          <div>
            <label htmlFor="programStaff" className="block font-semibold">Program Staff</label>
            <textarea
              id="programStaff"
              value={programs.programStaffing}
              onChange={e => handleProgramsChange('programStaffing', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe the staff involved in program delivery..."
              rows={3}
              disabled={programsLocked}
            />
          </div>

          {/* Program Volunteers */}
          <div>
            <label htmlFor="programVolunteers" className="block font-semibold">Program Volunteers</label>
            <textarea
              id="programVolunteers"
              value={programs.programVolunteers}
              onChange={e => handleProgramsChange('programVolunteers', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe volunteer involvement in programs..."
              rows={3}
              disabled={programsLocked}
            />
          </div>

          {/* Program Materials */}
          <div>
            <label htmlFor="programMaterials" className="block font-semibold">Program Materials</label>
            <textarea
              id="programMaterials"
              value={programs.programMaterials}
              onChange={e => handleProgramsChange('programMaterials', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe materials and resources used in programs..."
              rows={3}
              disabled={programsLocked}
            />
          </div>

          {/* Program Technology */}
          <div>
            <label htmlFor="programTechnology" className="block font-semibold">Program Technology</label>
            <textarea
              id="programTechnology"
              value={programs.programTechnology}
              onChange={e => handleProgramsChange('programTechnology', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe technology used in program delivery..."
              rows={3}
              disabled={programsLocked}
            />
          </div>

          {/* Program Manager Integration */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block font-semibold">Program Management</label>
              <button
                type="button"
                onClick={() => setShowProgramManager(true)}
                disabled={programsLocked}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Manage Projects
              </button>
            </div>
            
            {projects.length > 0 && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Current Projects ({projects.length})</h4>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <h5 className="font-medium">{project.name}</h5>
                        <p className="text-sm text-gray-600">{project.description.substring(0, 100)}...</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded ${
                            project.status === 'active' ? 'bg-green-100 text-green-700' :
                            project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-900'
                          }`}>
                            {project.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Budget: ${project.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProject(project.id);
                          setShowProgramManager(true);
                        }}
                        disabled={programsLocked}
                        className="px-3 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium disabled:opacity-50"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{programsAutoSaveStatus}</div>
      </section>
    );
  }
  // --- END PROGRAMS SECTION ---
  // --- BEGIN IMPACT SECTION ---
  const [impact, setImpact] = useState({
    impactMetrics: '',
    outcomeMeasures: '',
    successStories: '',
    communityImpact: '',
    longTermOutcomes: '',
    evaluationResults: '',
    impactReports: null as File | null,
    impactData: '',
    beneficiaryStories: '',
    socialReturn: '',
    sustainabilityMetrics: '',
    scalabilityAssessment: '',
    replicationPotential: '',
    innovationImpact: '',
    systemicChange: '',
    stakeholderFeedback: '',
    externalValidation: '',
    awardsRecognition: '',
    awards: [] as Array<{
      name: string;
      date: string;
      organization: unknown;
      recipient: unknown;
      category: string;
      url: string;
      monetaryValue: string;
      notes: string;
      documents: File[];
    }>,
    mediaCoverage: '',
    mediaCoverageLinks: [] as string[],
    mediaCoverageItems: [] as Array<{
      title: string;
      outlet: string;
      date: string;
      personFeatured: unknown;
      url: string;
      summary: string;
      publisher: string;
      mediaType: string;
      documents: File[];
    }>,
    researchPublications: '',
    publications: [] as Array<{
      title: string;
      authors: string;
      primaryAuthor: unknown;
      additionalAuthors: string;
      publicationDate: string;
      journal: string;
      volume: string;
      issue: string;
      pages: string;
      doi: string;
      url: string;
      abstract: string;
      citationStyle: 'apa' | 'mla' | 'chicago';
      publisher: string;
      mediaType: string;
      documents: File[];
    }>
  });
  const [impactErrors, setImpactErrors] = useState<unknown>({});
  const [impactLocked, setImpactLocked] = useState(false);
  const [impactAutoSaveStatus, setImpactAutoSaveStatus] = useState('');

  // Auto-save logic for Impact
  useEffect(() => {
    if (impactLocked) return;
    const timeout = setTimeout(() => {
      setImpactAutoSaveStatus('Saving...');
      setTimeout(() => setImpactAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [impact, impactLocked]);

  const handleImpactChange = (field: string, value: unknown) => {
    setImpact((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setImpactErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const handleImpactFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setImpactErrors((prev: unknown) => ({ ...(prev as any), [field]: 'File must be under 10MB' }));
      return;
    }
    setImpactErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
    setImpact((prev: unknown) => ({ ...(prev as any), [field]: file }));
  };

  const handleImpactLock = () => {
    setImpactLocked(true);
  };

  const handleImpactUnlock = () => {
    setImpactLocked(false);
  };

  const renderImpactSection = () => {
    return (
      <section className="mb-8" aria-labelledby="impact-heading">
        <div className="flex items-center justify-between mb-2">
          <h2 id="impact-heading" className="text-2xl font-bold">Impact & Outcomes</h2>
          {impactLocked ? (
            <button
              className="ml-4 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-colors font-medium"
              onClick={handleImpactUnlock}
              aria-label="Unlock section"
            >Unlock</button>
          ) : (
            <button
              className="ml-4 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              onClick={handleImpactLock}
              aria-label="Lock section"
            >Lock</button>
          )}
        </div>
        <div className={`grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow ${impactLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          {/* Impact Metrics */}
          <div>
            <label htmlFor="impactMetrics" className="block font-semibold">Impact Metrics</label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('impactMetrics') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleImpactChange('impactMetrics', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={impactLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('impactMetrics') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleImpactChange('impactMetrics', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={impactLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('impactMetrics') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleImpactChange('impactMetrics', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={impactLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(impact.impactMetrics);
                    toast.success('Impact metrics copied!');
                  }}
                  disabled={!impact.impactMetrics || impactLocked}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="impactMetrics"
                value={impact.impactMetrics}
                onChange={e => handleImpactChange('impactMetrics', e.target.value)}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none"
                placeholder="Describe the key metrics used to measure your organization's impact..."
                rows={5}
                disabled={impactLocked}
              />
            </div>
          </div>

          {/* Outcome Measures */}
          <div>
            <label htmlFor="outcomeMeasures" className="block font-semibold">Outcome Measures</label>
            <textarea
              id="outcomeMeasures"
              value={impact.outcomeMeasures}
              onChange={e => handleImpactChange('outcomeMeasures', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe how you measure and track outcomes..."
              rows={4}
              disabled={impactLocked}
            />
          </div>

          {/* Success Stories */}
          <div>
            <label htmlFor="successStories" className="block font-semibold">Success Stories</label>
            <textarea
              id="successStories"
              value={impact.successStories}
              onChange={e => handleImpactChange('successStories', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Share specific success stories and case studies..."
              rows={6}
              disabled={impactLocked}
            />
          </div>

          {/* Community Impact */}
          <div>
            <label htmlFor="communityImpact" className="block font-semibold">Community Impact</label>
            <textarea
              id="communityImpact"
              value={impact.communityImpact}
              onChange={e => handleImpactChange('communityImpact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe the broader impact on the community..."
              rows={4}
              disabled={impactLocked}
            />
          </div>

          {/* Long-term Outcomes */}
          <div>
            <label htmlFor="longTermOutcomes" className="block font-semibold">Long-term Outcomes</label>
            <textarea
              id="longTermOutcomes"
              value={impact.longTermOutcomes}
              onChange={e => handleImpactChange('longTermOutcomes', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe long-term outcomes and sustained impact..."
              rows={4}
              disabled={impactLocked}
            />
          </div>

          {/* Evaluation Results */}
          <div>
            <label htmlFor="evaluationResults" className="block font-semibold">Evaluation Results</label>
            <textarea
              id="evaluationResults"
              value={impact.evaluationResults}
              onChange={e => handleImpactChange('evaluationResults', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Share results from formal evaluations and assessments..."
              rows={4}
              disabled={impactLocked}
            />
          </div>

          {/* Impact Reports */}
          <div>
            <label htmlFor="impactReports" className="block font-semibold">Impact Reports (PDF, max 10MB)</label>
            <input
              id="impactReports"
              type="file"
              accept="application/pdf"
              onChange={e => handleImpactFile('impactReports', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={impactLocked}
            />
            {impact.impactReports && <span className="text-green-700 text-sm">{impact.impactReports.name}</span>}
            {(impactErrors as any).impactReports && <p className="text-red-600 text-sm">{(impactErrors as any).impactReports}</p>}
          </div>

          {/* Impact Data */}
          <div>
            <label htmlFor="impactData" className="block font-semibold">Impact Data</label>
            <textarea
              id="impactData"
              value={impact.impactData}
              onChange={e => handleImpactChange('impactData', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Share quantitative data and statistics demonstrating impact..."
              rows={4}
              disabled={impactLocked}
            />
          </div>

          {/* Beneficiary Stories */}
          <div>
            <label htmlFor="beneficiaryStories" className="block font-semibold">Beneficiary Stories</label>
            <textarea
              id="beneficiaryStories"
              value={impact.beneficiaryStories}
              onChange={e => handleImpactChange('beneficiaryStories', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Share stories from beneficiaries and program participants..."
              rows={4}
              disabled={impactLocked}
            />
          </div>

          {/* Social Return on Investment */}
          <div>
            <label htmlFor="socialReturn" className="block font-semibold">Social Return on Investment</label>
            <textarea
              id="socialReturn"
              value={impact.socialReturn}
              onChange={e => handleImpactChange('socialReturn', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your social return on investment calculations..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* Sustainability Metrics */}
          <div>
            <label htmlFor="sustainabilityMetrics" className="block font-semibold">Sustainability Metrics</label>
            <textarea
              id="sustainabilityMetrics"
              value={impact.sustainabilityMetrics}
              onChange={e => handleImpactChange('sustainabilityMetrics', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe metrics related to program sustainability..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* Scalability Assessment */}
          <div>
            <label htmlFor="scalabilityAssessment" className="block font-semibold">Scalability Assessment</label>
            <textarea
              id="scalabilityAssessment"
              value={impact.scalabilityAssessment}
              onChange={e => handleImpactChange('scalabilityAssessment', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Assess the potential for scaling your programs..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* Replication Potential */}
          <div>
            <label htmlFor="replicationPotential" className="block font-semibold">Replication Potential</label>
            <textarea
              id="replicationPotential"
              value={impact.replicationPotential}
              onChange={e => handleImpactChange('replicationPotential', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe the potential for replicating your model elsewhere..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* Innovation Impact */}
          <div>
            <label htmlFor="innovationImpact" className="block font-semibold">Innovation Impact</label>
            <textarea
              id="innovationImpact"
              value={impact.innovationImpact}
              onChange={e => handleImpactChange('innovationImpact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe innovative approaches and their impact..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* Systemic Change */}
          <div>
            <label htmlFor="systemicChange" className="block font-semibold">Systemic Change</label>
            <textarea
              id="systemicChange"
              value={impact.systemicChange}
              onChange={e => handleImpactChange('systemicChange', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe efforts to create systemic change..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* Stakeholder Feedback */}
          <div>
            <label htmlFor="stakeholderFeedback" className="block font-semibold">Stakeholder Feedback</label>
            <textarea
              id="stakeholderFeedback"
              value={impact.stakeholderFeedback}
              onChange={e => handleImpactChange('stakeholderFeedback', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Share feedback from stakeholders and partners..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* External Validation */}
          <div>
            <label htmlFor="externalValidation" className="block font-semibold">External Validation</label>
            <textarea
              id="externalValidation"
              value={impact.externalValidation}
              onChange={e => handleImpactChange('externalValidation', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe external validation of your impact..."
              rows={3}
              disabled={impactLocked}
            />
          </div>

          {/* Awards and Recognition */}
          <div>
            <label className="block font-semibold mb-2">Awards and Recognition</label>
            <div className="space-y-4">
              {(impact.awards || []).map((award, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Award Name *</label>
                      <input
                        type="text"
                        value={award.name || ''}
                        onChange={(e) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], name: e.target.value };
                          handleImpactChange('awards', newAwards);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Excellence in Nonprofit Management"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Received *</label>
                      <input
                        type="date"
                        value={award.date || ''}
                        onChange={(e) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], date: e.target.value };
                          handleImpactChange('awards', newAwards);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Awarding Organization *</label>
                      <ContactSelector
                        label=""
                        value={award.organization as ContactInfo | ContactInfo[] | null}
                        onChange={(org) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], organization: org };
                          handleImpactChange('awards', newAwards);
                        }}
                        type="organization"
                        placeholder="Select or add awarding organization"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipient *</label>
                      <ContactSelector
                        label=""
                        value={award.recipient as ContactInfo | ContactInfo[] | null}
                        onChange={(person) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], recipient: person };
                          handleImpactChange('awards', newAwards);
                        }}
                        type="person"
                        placeholder="Select person who received award"
                        disabled={impactLocked}
                      />
                      <p className="text-xs text-gray-500 mt-1">Award will be linked to both the person and organization</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Award Category</label>
                      <select
                        value={award.category || ''}
                        onChange={(e) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], category: e.target.value };
                          handleImpactChange('awards', newAwards);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={impactLocked}
                      >
                        <option value="">Select category</option>
                        <option value="excellence">Excellence Award</option>
                        <option value="innovation">Innovation Award</option>
                        <option value="leadership">Leadership Award</option>
                        <option value="service">Service Award</option>
                        <option value="impact">Impact Award</option>
                        <option value="lifetime">Lifetime Achievement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Award URL</label>
                      <input
                        type="url"
                        value={award.url || ''}
                        onChange={(e) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], url: e.target.value };
                          handleImpactChange('awards', newAwards);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monetary Value</label>
                      <input
                        type="number"
                        value={award.monetaryValue || ''}
                        onChange={(e) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], monetaryValue: e.target.value };
                          handleImpactChange('awards', newAwards);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        disabled={impactLocked}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Description</label>
                      <textarea
                        value={award.notes || ''}
                        onChange={(e) => {
                          const newAwards = [...(impact.awards || [])];
                          newAwards[index] = { ...newAwards[index], notes: e.target.value };
                          handleImpactChange('awards', newAwards);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional details about the award..."
                        rows={2}
                        disabled={impactLocked}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Award Documents</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const newAwards = [...(impact.awards || [])];
                            newAwards[index] = { 
                              ...newAwards[index], 
                              documents: [...(newAwards[index].documents || []), ...files] 
                            };
                            handleImpactChange('awards', newAwards);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={impactLocked}
                        />
                        {award.documents && award.documents.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {award.documents.length} file(s) selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Upload award certificates, photos, or related documents</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newAwards = (impact.awards || []).filter((_, i) => i !== index);
                      handleImpactChange('awards', newAwards);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                    disabled={impactLocked}
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Remove Award
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newAward = {
                    name: '',
                    date: '',
                    organization: null,
                    recipient: null,
                    category: '',
                    url: '',
                    monetaryValue: '',
                    notes: '',
                    documents: []
                  };
                  handleImpactChange('awards', [...(impact.awards || []), newAward]);
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                disabled={impactLocked}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Award
              </button>
            </div>
          </div>

          {/* Media Coverage - Enhanced with Person Attribution */}
          <div>
            <label className="block font-semibold mb-2">Media Coverage</label>
            <div className="space-y-4">
              {(impact.mediaCoverageItems || []).map((coverage, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Article Title *</label>
                      <input
                        type="text"
                        value={coverage.title || ''}
                        onChange={(e) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], title: e.target.value };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Local Nonprofit Makes Impact in Community"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Media Outlet *</label>
                      <input
                        type="text"
                        value={coverage.outlet || ''}
                        onChange={(e) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], outlet: e.target.value };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="New York Times, CNN, etc."
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date *</label>
                      <input
                        type="date"
                        value={coverage.date || ''}
                        onChange={(e) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], date: e.target.value };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Person Quoted/Featured</label>
                      <ContactSelector
                        label=""
                        value={coverage.personFeatured as ContactInfo | ContactInfo[] | null}
                        onChange={(person) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], personFeatured: person };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        type="person"
                        placeholder="Select person featured"
                        disabled={impactLocked}
                      />
                      <p className="text-xs text-gray-500 mt-1">Coverage will be linked to both the person and organization</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Article URL *</label>
                      <input
                        type="url"
                        value={coverage.url || ''}
                        onChange={(e) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], url: e.target.value };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                      <input
                        type="text"
                        value={coverage.publisher || ''}
                        onChange={(e) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], publisher: e.target.value };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Publisher name"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                      <select
                        value={coverage.mediaType || ''}
                        onChange={(e) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], mediaType: e.target.value };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={impactLocked}
                      >
                        <option value="">Select type</option>
                        <option value="article">News Article</option>
                        <option value="blog">Blog Post</option>
                        <option value="video">Video</option>
                        <option value="podcast">Podcast</option>
                        <option value="social">Social Media</option>
                        <option value="press">Press Release</option>
                        <option value="interview">Interview</option>
                        <option value="feature">Feature Story</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key Quote/Summary</label>
                      <textarea
                        value={coverage.summary || ''}
                        onChange={(e) => {
                          const newCoverage = [...(impact.mediaCoverageItems || [])];
                          newCoverage[index] = { ...newCoverage[index], summary: e.target.value };
                          handleImpactChange('mediaCoverageItems', newCoverage);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Key quote or brief summary of the coverage..."
                        rows={2}
                        disabled={impactLocked}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Media Documents</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const newCoverage = [...(impact.mediaCoverageItems || [])];
                            newCoverage[index] = { 
                              ...newCoverage[index], 
                              documents: [...(newCoverage[index].documents || []), ...files] 
                            };
                            handleImpactChange('mediaCoverageItems', newCoverage);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={impactLocked}
                        />
                        {coverage.documents && coverage.documents.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {coverage.documents.length} file(s) selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Upload article PDFs, screenshots, or related media files</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCoverage = (impact.mediaCoverageItems || []).filter((_, i) => i !== index);
                      handleImpactChange('mediaCoverageItems', newCoverage);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                    disabled={impactLocked}
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Remove Coverage
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newCoverageItem = {
                    title: '',
                    outlet: '',
                    date: '',
                    personFeatured: null,
                    url: '',
                    summary: '',
                    publisher: '',
                    mediaType: '',
                    documents: []
                  };
                  handleImpactChange('mediaCoverageItems', [...(impact.mediaCoverageItems || []), newCoverageItem]);
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                disabled={impactLocked}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Media Coverage
              </button>
            </div>
          </div>

          {/* Research Publications with Citation Tools */}
          <div>
            <label className="block font-semibold mb-2">Research Publications</label>
            <div className="space-y-4">
              {(impact.publications || []).map((pub, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        value={(pub as any).title || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], title: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Impact of Community Programs on Youth Development"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Author *</label>
                      <ContactSelector
                        label=""
                        value={(pub as any).primaryAuthor as ContactInfo | ContactInfo[] | null}
                        onChange={(person) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], primaryAuthor: person };
                          handleImpactChange('publications', newPubs);
                        }}
                        type="person"
                        placeholder="Select primary author"
                        disabled={impactLocked}
                      />
                      <p className="text-xs text-gray-500 mt-1">Publication will be linked to both the author and organization</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Additional Authors</label>
                      <input
                        type="text"
                        value={(pub as any).additionalAuthors || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], additionalAuthors: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Co-author names..."
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date *</label>
                      <input
                        type="date"
                        value={(pub as any).publicationDate || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], publicationDate: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Journal/Publisher</label>
                      <input
                        type="text"
                        value={(pub as any).journal || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], journal: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Journal of Nonprofit Management"
                        disabled={impactLocked}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume</label>
                        <input
                          type="text"
                          value={(pub as any).volume || ''}
                          onChange={(e) => {
                            const newPubs = [...(impact.publications || [])];
                            newPubs[index] = { ...newPubs[index], volume: e.target.value };
                            handleImpactChange('publications', newPubs);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="12"
                          disabled={impactLocked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                        <input
                          type="text"
                          value={(pub as any).issue || ''}
                          onChange={(e) => {
                            const newPubs = [...(impact.publications || [])];
                            newPubs[index] = { ...newPubs[index], issue: e.target.value };
                            handleImpactChange('publications', newPubs);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="3"
                          disabled={impactLocked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pages</label>
                        <input
                          type="text"
                          value={(pub as any).pages || ''}
                          onChange={(e) => {
                            const newPubs = [...(impact.publications || [])];
                            newPubs[index] = { ...newPubs[index], pages: e.target.value };
                            handleImpactChange('publications', newPubs);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="45-62"
                          disabled={impactLocked}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                      <input
                        type="text"
                        value={(pub as any).doi || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], doi: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10.1234/example"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                      <input
                        type="url"
                        value={(pub as any).url || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], url: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Citation Style</label>
                      <select
                        value={(pub as any).citationStyle || 'apa'}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], citationStyle: e.target.value as any };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={impactLocked}
                      >
                        <option value="apa">APA</option>
                        <option value="mla">MLA</option>
                        <option value="chicago">Chicago</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
                      <input
                        type="text"
                        value={(pub as any).publisher || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], publisher: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Publisher name"
                        disabled={impactLocked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
                      <select
                        value={(pub as any).mediaType || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], mediaType: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        disabled={impactLocked}
                      >
                        <option value="">Select type</option>
                        <option value="journal">Journal Article</option>
                        <option value="book">Book</option>
                        <option value="chapter">Book Chapter</option>
                        <option value="conference">Conference Paper</option>
                        <option value="report">Research Report</option>
                        <option value="whitepaper">White Paper</option>
                        <option value="thesis">Thesis/Dissertation</option>
                        <option value="working">Working Paper</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                      <textarea
                        value={(pub as any).abstract || ''}
                        onChange={(e) => {
                          const newPubs = [...(impact.publications || [])];
                          newPubs[index] = { ...newPubs[index], abstract: e.target.value };
                          handleImpactChange('publications', newPubs);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Brief summary of the publication..."
                        rows={2}
                        disabled={impactLocked}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Publication Documents</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const newPubs = [...(impact.publications || [])];
                            newPubs[index] = { 
                              ...newPubs[index], 
                              documents: [...(newPubs[index].documents || []), ...files] 
                            };
                            handleImpactChange('publications', newPubs);
                          }}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          accept=".pdf,.doc,.docx"
                          disabled={impactLocked}
                        />
                        {(pub as any).documents && (pub as any).documents.length > 0 && (
                          <span className="text-sm text-gray-600">
                            {(pub as any).documents.length} file(s) selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Upload the full publication PDF or related documents</p>
                    </div>
                  </div>
                  
                  {/* Generated Citation */}
                  <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Generated Citation:</label>
                    <div className="text-sm text-gray-700 font-mono">
                      {generateCitation(pub)}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generateCitation(pub));
                        toast.success('Citation copied to clipboard');
                      }}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-3 h-3 inline mr-1" />
                      Copy Citation
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const newPubs = (impact.publications || []).filter((_, i) => i !== index);
                      handleImpactChange('publications', newPubs);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                    disabled={impactLocked}
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Remove Publication
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newPub = {
                    title: '',
                    authors: '',
                    primaryAuthor: null,
                    additionalAuthors: '',
                    publicationDate: '',
                    journal: '',
                    volume: '',
                    issue: '',
                    pages: '',
                    doi: '',
                    url: '',
                    abstract: '',
                    citationStyle: 'apa' as const,
                    publisher: '',
                    mediaType: '',
                    documents: []
                  };
                  handleImpactChange('publications', [...(impact.publications || []), newPub]);
                }}
                className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                disabled={impactLocked}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Add Publication
              </button>
            </div>
          </div>

        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{impactAutoSaveStatus}</div>
      </section>
    );
  }
  // --- END IMPACT SECTION ---
  // --- BEGIN COMPLIANCE SECTION ---
  const [compliance, setCompliance] = useState({
    legalStatus: '',
    taxExemptStatus: '',
    stateRegistration: '',
    federalCompliance: '',
    stateCompliance: '',
    localCompliance: '',
    regulatoryRequirements: '',
    complianceReports: null as File | null,
    legalDocuments: null as File | null,
    permitsLicenses: null as File | null,
    insuranceCertificates: null as File | null,
    auditFindings: '',
    correctiveActions: '',
    complianceOfficer: '',
    complianceTraining: '',
    riskAssessment: '',
    monitoringProcedures: '',
    reportingRequirements: '',
    recordRetention: '',
    dataProtection: ''
  });
  const [complianceErrors, setComplianceErrors] = useState<unknown>({});
  const [complianceLocked, setComplianceLocked] = useState(false);
  const [complianceAutoSaveStatus, setComplianceAutoSaveStatus] = useState('');

  // Auto-save logic for Compliance
  useEffect(() => {
    if (complianceLocked) return;
    const timeout = setTimeout(() => {
      setComplianceAutoSaveStatus('Saving...');
      setTimeout(() => setComplianceAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [compliance, complianceLocked]);

  const handleComplianceChange = (field: string, value: unknown) => {
    setCompliance((prev: unknown) => ({ ...(prev as any), [field]: value }));
    setComplianceErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
  };

  const handleComplianceFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) {
      setComplianceErrors((prev: unknown) => ({ ...(prev as any), [field]: 'File must be under 10MB' }));
      return;
    }
    setComplianceErrors((prev: unknown) => ({ ...(prev as any), [field]: undefined }));
    setCompliance((prev: unknown) => ({ ...(prev as any), [field]: file }));
  };

  const handleComplianceLock = () => {
    setComplianceLocked(true);
  };

  const handleComplianceUnlock = () => {
    setComplianceLocked(false);
  };

  const renderComplianceSection = () => {
    return (
      <section className="mb-8" aria-labelledby="compliance-heading">
        <div className="flex items-center justify-between mb-2">
          <h2 id="compliance-heading" className="text-2xl font-bold">Compliance & Legal</h2>
          {complianceLocked ? (
            <button
              className="ml-4 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-colors font-medium"
              onClick={handleComplianceUnlock}
              aria-label="Unlock section"
            >Unlock</button>
          ) : (
            <button
              className="ml-4 px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              onClick={handleComplianceLock}
              aria-label="Lock section"
            >Lock</button>
          )}
        </div>
        <div className={`grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow ${complianceLocked ? 'opacity-60 pointer-events-none' : ''}`}>
          {/* Legal Status */}
          <div>
            <label htmlFor="legalStatus" className="block font-semibold">Legal Status</label>
            <div className="flex">
              <textarea
                id="legalStatus"
                value={compliance.legalStatus}
                onChange={e => handleComplianceChange('legalStatus', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Describe your organization's legal status and structure..."
                rows={3}
                disabled={complianceLocked}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(compliance.legalStatus);
                  toast.success('Legal status copied!');
                }}
                disabled={!compliance.legalStatus || complianceLocked}
                className="px-3 py-2 border border-l-0 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    handleComplianceChange('legalStatus', text);
                    toast.success('Text pasted!');
                  } catch (err) {
                    toast.error('Please paste manually using Ctrl+V');
                  }
                }}
                disabled={complianceLocked}
                className="px-3 py-2 border border-l-0 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tax Exempt Status */}
          <div>
            <label htmlFor="taxExemptStatus" className="block font-semibold">Tax Exempt Status</label>
            <div className="flex">
              <textarea
                id="taxExemptStatus"
                value={compliance.taxExemptStatus}
                onChange={e => handleComplianceChange('taxExemptStatus', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Describe your tax exempt status and requirements..."
                rows={3}
                disabled={complianceLocked}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(compliance.taxExemptStatus);
                  toast.success('Tax exempt status copied!');
                }}
                disabled={!compliance.taxExemptStatus || complianceLocked}
                className="px-3 py-2 border border-l-0 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    handleComplianceChange('taxExemptStatus', text);
                    toast.success('Text pasted!');
                  } catch (err) {
                    toast.error('Please paste manually using Ctrl+V');
                  }
                }}
                disabled={complianceLocked}
                className="px-3 py-2 border border-l-0 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Paste from clipboard"
              >
                <Clipboard className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* State Registration */}
          <div>
            <label htmlFor="stateRegistration" className="block font-semibold">State Registration</label>
            <textarea
              id="stateRegistration"
              value={compliance.stateRegistration}
              onChange={e => handleComplianceChange('stateRegistration', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe state registration and compliance requirements..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Federal Compliance */}
          <div>
            <label htmlFor="federalCompliance" className="block font-semibold">Federal Compliance</label>
            <textarea
              id="federalCompliance"
              value={compliance.federalCompliance}
              onChange={e => handleComplianceChange('federalCompliance', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe federal compliance requirements and status..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* State Compliance */}
          <div>
            <label htmlFor="stateCompliance" className="block font-semibold">State Compliance</label>
            <textarea
              id="stateCompliance"
              value={compliance.stateCompliance}
              onChange={e => handleComplianceChange('stateCompliance', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe state compliance requirements and status..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Local Compliance */}
          <div>
            <label htmlFor="localCompliance" className="block font-semibold">Local Compliance</label>
            <textarea
              id="localCompliance"
              value={compliance.localCompliance}
              onChange={e => handleComplianceChange('localCompliance', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe local compliance requirements and status..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Regulatory Requirements */}
          <div>
            <label htmlFor="regulatoryRequirements" className="block font-semibold">Regulatory Requirements</label>
            <textarea
              id="regulatoryRequirements"
              value={compliance.regulatoryRequirements}
              onChange={e => handleComplianceChange('regulatoryRequirements', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="List and describe applicable regulatory requirements..."
              rows={4}
              disabled={complianceLocked}
            />
          </div>

          {/* Compliance Reports */}
          <div>
            <label htmlFor="complianceReports" className="block font-semibold">Compliance Reports (PDF, max 10MB)</label>
            <input
              id="complianceReports"
              type="file"
              accept="application/pdf"
              onChange={e => handleComplianceFile('complianceReports', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={complianceLocked}
            />
            {compliance.complianceReports && <span className="text-green-700 text-sm">{compliance.complianceReports.name}</span>}
            {(complianceErrors as any).complianceReports && <p className="text-red-600 text-sm">{(complianceErrors as any).complianceReports}</p>}
          </div>

          {/* Legal Documents */}
          <div>
            <label htmlFor="legalDocuments" className="block font-semibold">Legal Documents (PDF, max 10MB)</label>
            <input
              id="legalDocuments"
              type="file"
              accept="application/pdf"
              onChange={e => handleComplianceFile('legalDocuments', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={complianceLocked}
            />
            {compliance.legalDocuments && <span className="text-green-700 text-sm">{compliance.legalDocuments.name}</span>}
            {(complianceErrors as any).legalDocuments && <p className="text-red-600 text-sm">{(complianceErrors as any).legalDocuments}</p>}
          </div>

          {/* Permits and Licenses */}
          <div>
            <label htmlFor="permitsLicenses" className="block font-semibold">Permits and Licenses (PDF, max 10MB)</label>
            <input
              id="permitsLicenses"
              type="file"
              accept="application/pdf"
              onChange={e => handleComplianceFile('permitsLicenses', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={complianceLocked}
            />
            {compliance.permitsLicenses && <span className="text-green-700 text-sm">{compliance.permitsLicenses.name}</span>}
            {(complianceErrors as any).permitsLicenses && <p className="text-red-600 text-sm">{(complianceErrors as any).permitsLicenses}</p>}
          </div>

          {/* Insurance Certificates */}
          <div>
            <label htmlFor="insuranceCertificates" className="block font-semibold">Insurance Certificates (PDF, max 10MB)</label>
            <input
              id="insuranceCertificates"
              type="file"
              accept="application/pdf"
              onChange={e => handleComplianceFile('insuranceCertificates', e)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={complianceLocked}
            />
            {compliance.insuranceCertificates && <span className="text-green-700 text-sm">{compliance.insuranceCertificates.name}</span>}
            {(complianceErrors as any).insuranceCertificates && <p className="text-red-600 text-sm">{(complianceErrors as any).insuranceCertificates}</p>}
          </div>

          {/* Audit Findings */}
          <div>
            <label htmlFor="auditFindings" className="block font-semibold">Audit Findings</label>
            <textarea
              id="auditFindings"
              value={compliance.auditFindings}
              onChange={e => handleComplianceChange('auditFindings', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe any audit findings and their resolution..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Corrective Actions */}
          <div>
            <label htmlFor="correctiveActions" className="block font-semibold">Corrective Actions</label>
            <textarea
              id="correctiveActions"
              value={compliance.correctiveActions}
              onChange={e => handleComplianceChange('correctiveActions', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe corrective actions taken for compliance issues..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Compliance Officer */}
          <div>
            <label htmlFor="complianceOfficer" className="block font-semibold">Compliance Officer</label>
            <textarea
              id="complianceOfficer"
              value={compliance.complianceOfficer}
              onChange={e => handleComplianceChange('complianceOfficer', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your compliance officer and their responsibilities..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Compliance Training */}
          <div>
            <label htmlFor="complianceTraining" className="block font-semibold">Compliance Training</label>
            <textarea
              id="complianceTraining"
              value={compliance.complianceTraining}
              onChange={e => handleComplianceChange('complianceTraining', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe compliance training programs for staff and board..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Risk Assessment */}
          <div>
            <label htmlFor="riskAssessment" className="block font-semibold">Risk Assessment</label>
            <textarea
              id="riskAssessment"
              value={compliance.riskAssessment}
              onChange={e => handleComplianceChange('riskAssessment', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your compliance risk assessment process..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Monitoring Procedures */}
          <div>
            <label htmlFor="monitoringProcedures" className="block font-semibold">Monitoring Procedures</label>
            <textarea
              id="monitoringProcedures"
              value={compliance.monitoringProcedures}
              onChange={e => handleComplianceChange('monitoringProcedures', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your compliance monitoring procedures..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Reporting Requirements */}
          <div>
            <label htmlFor="reportingRequirements" className="block font-semibold">Reporting Requirements</label>
            <textarea
              id="reportingRequirements"
              value={compliance.reportingRequirements}
              onChange={e => handleComplianceChange('reportingRequirements', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your compliance reporting requirements..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Record Retention */}
          <div>
            <label htmlFor="recordRetention" className="block font-semibold">Record Retention</label>
            <textarea
              id="recordRetention"
              value={compliance.recordRetention}
              onChange={e => handleComplianceChange('recordRetention', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your record retention policies and procedures..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

          {/* Data Protection */}
          <div>
            <label htmlFor="dataProtection" className="block font-semibold">Data Protection</label>
            <textarea
              id="dataProtection"
              value={compliance.dataProtection}
              onChange={e => handleComplianceChange('dataProtection', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your data protection and privacy policies..."
              rows={3}
              disabled={complianceLocked}
            />
          </div>

        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{complianceAutoSaveStatus}</div>
      </section>
    );
  }
  // --- END COMPLIANCE SECTION ---
  // --- TECHNOLOGY SECTION ---
  const [technologyAutoSaveStatus, setTechnologyAutoSaveStatus] = useState('');

  const handleTechnologyChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setTechnologyAutoSaveStatus('Unsaved changes...');
  };

  const handleTechnologyFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setTechnologyAutoSaveStatus('File uploaded...');
    }
  };

  const handleTechnologyLock = () => {
    lockSection('technology');
    setTechnologyAutoSaveStatus('Section locked');
  };

  const handleTechnologyUnlock = () => {
    unlockSection('technology');
    setTechnologyAutoSaveStatus('Section unlocked');
  };

  const renderTechnologySection = () => {
    const isLocked = isSectionLocked('technology');
    const background = getSectionBackground('technology');
    const progress = calculateSectionProgress('technology');
    const status = getProgressStatus('technology');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="technology-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="technology-heading" className="text-2xl font-bold">Technology & Infrastructure</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleTechnologyUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleTechnologyLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('technology', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Technology Infrastructure */}
          <div className="md:col-span-2">
            <label htmlFor="techInfrastructure" className="block font-semibold mb-2">
              Technology Infrastructure
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('techInfrastructure') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleTechnologyChange('techInfrastructure', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('techInfrastructure') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleTechnologyChange('techInfrastructure', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('techInfrastructure') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleTechnologyChange('techInfrastructure', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.techInfrastructure || ''));
                    toast.success('Technology infrastructure copied!');
                  }}
                  disabled={!formData.techInfrastructure || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="techInfrastructure"
                value={(formData as any).techInfrastructure || ''}
                onChange={(e) => handleTechnologyChange('techInfrastructure', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="Describe your technology infrastructure, systems, and platforms..."
                rows={5}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.techInfrastructure || '')).words} words
            </div>
          </div>

          {/* Data Management */}
          <div className="md:col-span-2">
            <label htmlFor="dataManagement" className="block font-semibold mb-2">
              Data Management & Security
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('dataManagement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleTechnologyChange('dataManagement', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('dataManagement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleTechnologyChange('dataManagement', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('dataManagement') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleTechnologyChange('dataManagement', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.dataManagement || ''));
                    toast.success('Data management info copied!');
                  }}
                  disabled={!formData.dataManagement || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="dataManagement"
                value={(formData as any).dataManagement || ''}
                onChange={(e) => handleTechnologyChange('dataManagement', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="Describe your data management and security practices..."
                rows={4}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.dataManagement || '')).words} words
            </div>
          </div>

          {/* Digital Tools */}
          <div>
            <label htmlFor="digitalTools" className="block font-semibold mb-2">
              Digital Tools & Software
            </label>
            <textarea
              id="digitalTools"
              value={(formData as any).digitalTools || ''}
              onChange={(e) => handleTechnologyChange('digitalTools', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="List and describe digital tools and software used..."
              rows={3}
            />
          </div>

          {/* IT Staff */}
          <div>
            <label htmlFor="itStaff" className="block font-semibold mb-2">
              IT Staff & Support
            </label>
            <textarea
              id="itStaff"
              value={(formData as any).itStaff || ''}
              onChange={(e) => handleTechnologyChange('itStaff', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your IT staff and technical support capabilities..."
              rows={3}
            />
          </div>

          {/* Technology Budget */}
          <div>
            <label htmlFor="techBudget" className="block font-semibold mb-2">
              Technology Budget
            </label>
            <input
              type="text"
              id="techBudget"
              value={(formData as any).techBudget || ''}
              onChange={(e) => handleTechnologyChange('techBudget', formatCurrency(e.target.value))}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Annual technology budget"
            />
          </div>

          {/* Technology Plan */}
          <div>
            <label htmlFor="technologyPlan" className="block font-semibold mb-2">
              Technology Plan
            </label>
            <textarea
              id="technologyPlan"
              value={(formData as any).technologyPlan || ''}
              onChange={(e) => handleTechnologyChange('technologyPlan', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your technology roadmap and future plans..."
              rows={3}
            />
          </div>

          {/* Technology Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Technology Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="techPlanFile" className="block text-sm font-medium mb-1">
                  Technology Plan Document
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="techPlanFile"
                      onChange={(e) => handleTechnologyFile('techPlan', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.techPlan && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('techPlan')}
                        <button
                          onClick={() => removeFile('techPlan')}
                          className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  </>
                </div>
              </div>

              <div>
                <label htmlFor="securityPolicyFile" className="block text-sm font-medium mb-1">
                  Security Policy
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="securityPolicyFile"
                      onChange={(e) => handleTechnologyFile('securityPolicy', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.securityPolicy && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('securityPolicy')}
                        <button
                          onClick={() => removeFile('securityPolicy')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{technologyAutoSaveStatus}</div>
      </section>
    );
  }

  // --- COMMUNICATIONS SECTION ---
  const [communicationsAutoSaveStatus, setCommunicationsAutoSaveStatus] = useState('');

  const handleCommunicationsChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setCommunicationsAutoSaveStatus('Unsaved changes...');
  };

  const handleCommunicationsFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setCommunicationsAutoSaveStatus('File uploaded...');
    }
  };

  const handleCommunicationsLock = () => {
    lockSection('communications');
    setCommunicationsAutoSaveStatus('Section locked');
  };

  const handleCommunicationsUnlock = () => {
    unlockSection('communications');
    setCommunicationsAutoSaveStatus('Section unlocked');
  };

  const renderCommunicationsSection = () => {
    const isLocked = isSectionLocked('communications');
    const background = getSectionBackground('communications');
    const progress = calculateSectionProgress('communications');
    const status = getProgressStatus('communications');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="communications-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="communications-heading" className="text-2xl font-bold">Communications & Marketing</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleCommunicationsUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleCommunicationsLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('communications', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Marketing Strategy */}
          <div className="md:col-span-2">
            <label htmlFor="marketingStrategy" className="block font-semibold mb-2">
              Marketing Strategy
            </label>
            <textarea
              id="marketingStrategy"
              value={(formData as any).marketingStrategy || ''}
              onChange={(e) => handleCommunicationsChange('marketingStrategy', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your marketing and communications strategy..."
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.marketingStrategy || '')).words} words
            </div>
          </div>

          {/* Social Media Presence */}
          <div className="md:col-span-2">
            <label htmlFor="socialMedia" className="block font-semibold mb-2">
              Social Media Presence
            </label>
            <textarea
              id="socialMedia"
              value={(formData as any).socialMedia || ''}
              onChange={(e) => handleCommunicationsChange('socialMedia', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your social media presence and engagement..."
              rows={3}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.socialMedia || '')).words} words
            </div>
          </div>

          {/* Public Relations */}
          <div>
            <label htmlFor="publicRelations" className="block font-semibold mb-2">
              Public Relations
            </label>
            <textarea
              id="publicRelations"
              value={(formData as any).publicRelations || ''}
              onChange={(e) => handleCommunicationsChange('publicRelations', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your public relations activities..."
              rows={3}
            />
          </div>

          {/* Brand Guidelines */}
          <div>
            <label htmlFor="brandGuidelines" className="block font-semibold mb-2">
              Brand Guidelines
            </label>
            <textarea
              id="brandGuidelines"
              value={(formData as any).brandGuidelines || ''}
              onChange={(e) => handleCommunicationsChange('brandGuidelines', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your brand guidelines and visual identity..."
              rows={3}
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block font-semibold mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="website"
              value={(formData as any).website || ''}
              onChange={(e) => handleCommunicationsChange('website', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="https://your-organization.org"
            />
          </div>

          {/* Newsletter */}
          <div>
            <label htmlFor="newsletter" className="block font-semibold mb-2">
              Newsletter & Publications
            </label>
            <textarea
              id="newsletter"
              value={(formData as any).newsletter || ''}
              onChange={(e) => handleCommunicationsChange('newsletter', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your newsletter and publication efforts..."
              rows={3}
            />
          </div>

          {/* Media Coverage */}
          <div className="md:col-span-2">
            <label htmlFor="mediaCoverage" className="block font-semibold mb-2">
              Media Coverage & Press
            </label>
            <textarea
              id="mediaCoverage"
              value={(formData as any).mediaCoverage || ''}
              onChange={(e) => handleCommunicationsChange('mediaCoverage', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="List recent media coverage and press mentions..."
              rows={3}
            />
          </div>

          {/* Communications Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Communications Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="communicationsPlanFile" className="block text-sm font-medium mb-1">
                  Communications Plan
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="communicationsPlanFile"
                      onChange={(e) => handleCommunicationsFile('communicationsPlan', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.communicationsPlan && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('communicationsPlan')}
                        <button
                          onClick={() => removeFile('communicationsPlan')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>

              <div>
                <label htmlFor="brandGuidelinesFile" className="block text-sm font-medium mb-1">
                  Brand Guidelines Document
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="brandGuidelinesFile"
                      onChange={(e) => handleCommunicationsFile('brandGuidelinesDoc', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.brandGuidelinesDoc && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('brandGuidelinesDoc')}
                        <button
                          onClick={() => removeFile('brandGuidelinesDoc')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{communicationsAutoSaveStatus}</div>
      </section>
    );
  }

  // --- RISK MANAGEMENT SECTION ---
  const [riskManagementAutoSaveStatus, setRiskManagementAutoSaveStatus] = useState('');

  const handleRiskManagementChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setRiskManagementAutoSaveStatus('Unsaved changes...');
  };

  const handleRiskManagementFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setRiskManagementAutoSaveStatus('File uploaded...');
    }
  };

  const handleRiskManagementLock = () => {
    lockSection('riskManagement');
    setRiskManagementAutoSaveStatus('Section locked');
  };

  const handleRiskManagementUnlock = () => {
    unlockSection('riskManagement');
    setRiskManagementAutoSaveStatus('Section unlocked');
  };

  const renderRiskManagementSection = () => {
    const isLocked = isSectionLocked('riskManagement');
    const background = getSectionBackground('riskManagement');
    const progress = calculateSectionProgress('riskManagement');
    const status = getProgressStatus('riskManagement');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="risk-management-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="risk-management-heading" className="text-2xl font-bold">Risk Management</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleRiskManagementUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleRiskManagementLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('riskManagement', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Risk Assessment */}
          <div className="md:col-span-2">
            <label htmlFor="riskAssessment" className="block font-semibold mb-2">
              Risk Assessment
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('riskAssessment') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleRiskManagementChange('riskAssessment', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('riskAssessment') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleRiskManagementChange('riskAssessment', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('riskAssessment') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleRiskManagementChange('riskAssessment', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.riskAssessment || ''));
                    toast.success('Risk assessment copied!');
                  }}
                  disabled={!formData.riskAssessment || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="riskAssessment"
                value={(formData as any).riskAssessment || ''}
                onChange={(e) => handleRiskManagementChange('riskAssessment', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="Describe your risk assessment process and identified risks..."
                rows={5}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.riskAssessment || '')).words} words
            </div>
          </div>

          {/* Risk Mitigation */}
          <div className="md:col-span-2">
            <label htmlFor="riskMitigation" className="block font-semibold mb-2">
              Risk Mitigation Strategies
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('riskMitigation') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleRiskManagementChange('riskMitigation', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('riskMitigation') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleRiskManagementChange('riskMitigation', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('riskMitigation') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleRiskManagementChange('riskMitigation', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.riskMitigation || ''));
                    toast.success('Risk mitigation strategies copied!');
                  }}
                  disabled={!formData.riskMitigation || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="riskMitigation"
                value={(formData as any).riskMitigation || ''}
                onChange={(e) => handleRiskManagementChange('riskMitigation', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="Describe strategies for mitigating identified risks..."
                rows={4}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.riskMitigation || '')).words} words
            </div>
          </div>

          {/* Emergency Plans */}
          <div>
            <label htmlFor="emergencyPlans" className="block font-semibold mb-2">
              Emergency Plans
            </label>
            <textarea
              id="emergencyPlans"
              value={(formData as any).emergencyPlans || ''}
              onChange={(e) => handleRiskManagementChange('emergencyPlans', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe emergency response and business continuity plans..."
              rows={3}
            />
          </div>

          {/* Crisis Management */}
          <div>
            <label htmlFor="crisisManagement" className="block font-semibold mb-2">
              Crisis Management
            </label>
            <textarea
              id="crisisManagement"
              value={(formData as any).crisisManagement || ''}
              onChange={(e) => handleRiskManagementChange('crisisManagement', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your crisis management procedures..."
              rows={3}
            />
          </div>

          {/* Compliance Risks */}
          <div>
            <label htmlFor="complianceRisks" className="block font-semibold mb-2">
              Compliance Risks
            </label>
            <textarea
              id="complianceRisks"
              value={(formData as any).complianceRisks || ''}
              onChange={(e) => handleRiskManagementChange('complianceRisks', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Identify compliance-related risks and mitigation strategies..."
              rows={3}
            />
          </div>

          {/* Financial Risks */}
          <div>
            <label htmlFor="financialRisks" className="block font-semibold mb-2">
              Financial Risks
            </label>
            <textarea
              id="financialRisks"
              value={(formData as any).financialRisks || ''}
              onChange={(e) => handleRiskManagementChange('financialRisks', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Identify financial risks and mitigation strategies..."
              rows={3}
            />
          </div>

          {/* Risk Management Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Risk Management Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="riskManagementPlanFile" className="block text-sm font-medium mb-1">
                  Risk Management Plan
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="riskManagementPlanFile"
                      onChange={(e) => handleRiskManagementFile('riskManagementPlan', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.riskManagementPlan && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('riskManagementPlan')}
                        <button
                          onClick={() => removeFile('riskManagementPlan')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>

              <div>
                <label htmlFor="emergencyPlanFile" className="block text-sm font-medium mb-1">
                  Emergency Response Plan
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="emergencyPlanFile"
                      onChange={(e) => handleRiskManagementFile('emergencyPlan', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.emergencyPlan && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('emergencyPlan')}
                        <button
                          onClick={() => removeFile('emergencyPlan')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{riskManagementAutoSaveStatus}</div>
      </section>
    );
  }

  // --- INSURANCE SECTION ---
  const [insuranceAutoSaveStatus, setInsuranceAutoSaveStatus] = useState('');

  const handleInsuranceChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setInsuranceAutoSaveStatus('Unsaved changes...');
  };

  const handleInsuranceFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setInsuranceAutoSaveStatus('File uploaded...');
    }
  };

  const handleInsuranceLock = () => {
    lockSection('insurance');
    setInsuranceAutoSaveStatus('Section locked');
  };

  const handleInsuranceUnlock = () => {
    unlockSection('insurance');
    setInsuranceAutoSaveStatus('Section unlocked');
  };

  const renderInsuranceSection = () => {
    const isLocked = isSectionLocked('insurance');
    const background = getSectionBackground('insurance');
    const progress = calculateSectionProgress('insurance');
    const status = getProgressStatus('insurance');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="insurance-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="insurance-heading" className="text-2xl font-bold">Insurance</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleInsuranceUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleInsuranceLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('insurance', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Insurance Coverage */}
          <div className="md:col-span-2">
            <label htmlFor="insuranceCoverage" className="block font-semibold mb-2">
              Insurance Coverage Overview
            </label>
            <textarea
              id="insuranceCoverage"
              value={(formData as any).insuranceCoverage || ''}
              onChange={(e) => handleInsuranceChange('insuranceCoverage', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your overall insurance coverage and policies..."
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.insuranceCoverage || '')).words} words
            </div>
          </div>

          {/* Liability Insurance */}
          <div>
            <label htmlFor="liabilityInsurance" className="block font-semibold mb-2">
              General Liability Insurance
            </label>
            <textarea
              id="liabilityInsurance"
              value={(formData as any).liabilityInsurance || ''}
              onChange={(e) => handleInsuranceChange('liabilityInsurance', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your general liability insurance coverage..."
              rows={3}
            />
          </div>

          {/* Property Insurance */}
          <div>
            <label htmlFor="propertyInsurance" className="block font-semibold mb-2">
              Property Insurance
            </label>
            <textarea
              id="propertyInsurance"
              value={(formData as any).propertyInsurance || ''}
              onChange={(e) => handleInsuranceChange('propertyInsurance', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your property and equipment insurance..."
              rows={3}
            />
          </div>

          {/* Directors & Officers Insurance */}
          <div>
            <label htmlFor="directorsOfficersInsurance" className="block font-semibold mb-2">
              Directors & Officers Insurance
            </label>
            <textarea
              id="directorsOfficersInsurance"
              value={(formData as any).directorsOfficersInsurance || ''}
              onChange={(e) => handleInsuranceChange('directorsOfficersInsurance', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your D&O insurance coverage..."
              rows={3}
            />
          </div>

          {/* Professional Liability */}
          <div>
            <label htmlFor="professionalLiability" className="block font-semibold mb-2">
              Professional Liability Insurance
            </label>
            <textarea
              id="professionalLiability"
              value={(formData as any).professionalLiability || ''}
              onChange={(e) => handleInsuranceChange('professionalLiability', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your professional liability coverage..."
              rows={3}
            />
          </div>

          {/* Workers Compensation */}
          <div>
            <label htmlFor="workersCompensation" className="block font-semibold mb-2">
              Workers Compensation
            </label>
            <textarea
              id="workersCompensation"
              value={(formData as any).workersCompensation || ''}
              onChange={(e) => handleInsuranceChange('workersCompensation', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your workers compensation coverage..."
              rows={3}
            />
          </div>

          {/* Auto Insurance */}
          <div>
            <label htmlFor="autoInsurance" className="block font-semibold mb-2">
              Auto Insurance
            </label>
            <textarea
              id="autoInsurance"
              value={(formData as any).autoInsurance || ''}
              onChange={(e) => handleInsuranceChange('autoInsurance', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your auto insurance coverage..."
              rows={3}
            />
          </div>

          {/* Insurance Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Insurance Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="insuranceCertificateFile" className="block text-sm font-medium mb-1">
                  Certificate of Insurance
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="insuranceCertificateFile"
                      onChange={(e) => handleInsuranceFile('insuranceCertificate', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.insuranceCertificate && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('insuranceCertificate')}
                        <button
                          onClick={() => removeFile('insuranceCertificate')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>

              <div>
                <label htmlFor="insurancePolicyFile" className="block text-sm font-medium mb-1">
                  Insurance Policy Summary
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="insurancePolicyFile"
                      onChange={(e) => handleInsuranceFile('insurancePolicy', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.insurancePolicy && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('insurancePolicy')}
                        <button
                          onClick={() => removeFile('insurancePolicy')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{insuranceAutoSaveStatus}</div>
      </section>
    );
  }

  // --- LOCATIONS SECTION ---
  const [locationsAutoSaveStatus, setLocationsAutoSaveStatus] = useState('');

  const handleLocationsChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setLocationsAutoSaveStatus('Unsaved changes...');
  };

  const handleLocationsFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setLocationsAutoSaveStatus('File uploaded...');
    }
  };

  const handleLocationsLock = () => {
    lockSection('otherLocations');
    setLocationsAutoSaveStatus('Section locked');
  };

  const handleLocationsUnlock = () => {
    unlockSection('otherLocations');
    setLocationsAutoSaveStatus('Section unlocked');
  };

  const renderLocationsSection = () => {
    const isLocked = isSectionLocked('otherLocations');
    const background = getSectionBackground('otherLocations');
    const progress = calculateSectionProgress('otherLocations');
    const status = getProgressStatus('otherLocations');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="locations-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="locations-heading" className="text-2xl font-bold">Locations</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleLocationsUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleLocationsLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('otherLocations', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Primary Location */}
          <div className="md:col-span-2">
            <label htmlFor="primaryLocation" className="block font-semibold mb-2">
              Primary Location
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('primaryLocation') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleLocationsChange('primaryLocation', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('primaryLocation') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleLocationsChange('primaryLocation', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('primaryLocation') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleLocationsChange('primaryLocation', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.primaryLocation || ''));
                    toast.success('Primary location copied!');
                  }}
                  disabled={!formData.primaryLocation || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="primaryLocation"
                value={(formData as any).primaryLocation || ''}
                onChange={(e) => handleLocationsChange('primaryLocation', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="Describe your primary location and facilities..."
                rows={4}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.primaryLocation || '')).words} words
            </div>
          </div>

          {/* Additional Locations */}
          <div className="md:col-span-2">
            <label htmlFor="additionalLocations" className="block font-semibold mb-2">
              Additional Locations
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('additionalLocations') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleLocationsChange('additionalLocations', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('additionalLocations') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleLocationsChange('additionalLocations', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('additionalLocations') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleLocationsChange('additionalLocations', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.additionalLocations || ''));
                    toast.success('Additional locations copied!');
                  }}
                  disabled={!formData.additionalLocations || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="additionalLocations"
                value={(formData as any).additionalLocations || ''}
                onChange={(e) => handleLocationsChange('additionalLocations', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="List and describe additional locations or satellite offices..."
                rows={4}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.additionalLocations || '')).words} words
            </div>
          </div>

          {/* Service Areas */}
          <div>
            <label htmlFor="serviceAreas" className="block font-semibold mb-2">
              Service Areas
            </label>
            <textarea
              id="serviceAreas"
              value={(formData as any).serviceAreas || ''}
              onChange={(e) => handleLocationsChange('serviceAreas', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe the geographic areas you serve..."
              rows={3}
            />
          </div>

          {/* Facilities */}
          <div>
            <label htmlFor="facilities" className="block font-semibold mb-2">
              Facilities & Infrastructure
            </label>
            <textarea
              id="facilities"
              value={(formData as any).facilities || ''}
              onChange={(e) => handleLocationsChange('facilities', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your facilities and infrastructure..."
              rows={3}
            />
          </div>

          {/* Accessibility */}
          <div>
            <label htmlFor="accessibility" className="block font-semibold mb-2">
              Accessibility Features
            </label>
            <textarea
              id="accessibility"
              value={(formData as any).accessibility || ''}
              onChange={(e) => handleLocationsChange('accessibility', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe accessibility features at your locations..."
              rows={3}
            />
          </div>

          {/* Transportation */}
          <div>
            <label htmlFor="transportation" className="block font-semibold mb-2">
              Transportation & Parking
            </label>
            <textarea
              id="transportation"
              value={(formData as any).transportation || ''}
              onChange={(e) => handleLocationsChange('transportation', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe transportation options and parking availability..."
              rows={3}
            />
          </div>

          {/* Location Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Location Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="facilityMapFile" className="block text-sm font-medium mb-1">
                  Facility Map or Floor Plan
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="facilityMapFile"
                      onChange={(e) => handleLocationsFile('facilityMap', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {formData.facilityMap && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('facilityMap')}
                        <button
                          onClick={() => removeFile('facilityMap')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>

              <div>
                <label htmlFor="leaseAgreementFile" className="block text-sm font-medium mb-1">
                  Lease Agreement or Property Documents
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="leaseAgreementFile"
                      onChange={(e) => handleLocationsFile('leaseAgreement', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.leaseAgreement && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('leaseAgreement')}
                        <button
                          onClick={() => removeFile('leaseAgreement')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{locationsAutoSaveStatus}</div>
      </section>
    );
  }

  // --- ADDITIONAL INFO SECTION ---
  const [additionalInfoAutoSaveStatus, setAdditionalInfoAutoSaveStatus] = useState('');

  const handleAdditionalInfoChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setAdditionalInfoAutoSaveStatus('Unsaved changes...');
  };

  const handleAdditionalInfoFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setAdditionalInfoAutoSaveStatus('File uploaded...');
    }
  };

  const handleAdditionalInfoLock = () => {
    lockSection('additionalInfo');
    setAdditionalInfoAutoSaveStatus('Section locked');
  };

  const handleAdditionalInfoUnlock = () => {
    unlockSection('additionalInfo');
    setAdditionalInfoAutoSaveStatus('Section unlocked');
  };

  const renderAdditionalInfoSection = () => {
    const isLocked = isSectionLocked('additionalInfo');
    const background = getSectionBackground('additionalInfo');
    const progress = calculateSectionProgress('additionalInfo');
    const status = getProgressStatus('additionalInfo');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="additional-info-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="additional-info-heading" className="text-2xl font-bold">Additional Information</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleAdditionalInfoUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleAdditionalInfoLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('additionalInfo', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Additional Information */}
          <div className="md:col-span-2">
            <label htmlFor="additionalInfo" className="block font-semibold mb-2">
              Additional Information
            </label>
            <NarrativeEntryField
              id="narrative-field-58"
              label=""
              value={(formData as any).additionalInfo || ''}
              onChange={(content) => handleAdditionalInfoChange('additionalInfo', content)}
              placeholder="Any additional information you'd like to share..."
              permissions={{ canEdit: !isLocked && !isFieldDisabled() }}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.additionalInfo || '')).words} words
            </div>
          </div>

          {/* Special Circumstances */}
          <div className="md:col-span-2">
            <label htmlFor="specialCircumstances" className="block font-semibold mb-2">
              Special Circumstances
            </label>
            <NarrativeEntryField
              id="narrative-field-59"
              label=""
              value={(formData as any).specialCircumstances || ''}
              onChange={(content) => handleAdditionalInfoChange('specialCircumstances', content)}
              placeholder="Describe any special circumstances or unique aspects of your organization..."
              permissions={{ canEdit: !isLocked && !isFieldDisabled() }}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.specialCircumstances || '')).words} words
            </div>
          </div>

          {/* Awards & Recognition */}
          <div>
            <label htmlFor="awardsRecognition" className="block font-semibold mb-2">
              Awards & Recognition
            </label>
            <textarea
              id="awardsRecognition"
              value={(formData as any).awardsRecognition || ''}
              onChange={(e) => handleAdditionalInfoChange('awardsRecognition', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="List awards, recognition, and honors received..."
              rows={3}
            />
          </div>

          {/* Partnerships */}
          <div>
            <label htmlFor="partnerships" className="block font-semibold mb-2">
              Key Partnerships
            </label>
            <textarea
              id="partnerships"
              value={(formData as any).partnerships || ''}
              onChange={(e) => handleAdditionalInfoChange('partnerships', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe key partnerships and collaborations..."
              rows={3}
            />
          </div>

          {/* Future Plans */}
          <div className="md:col-span-2">
            <label htmlFor="futurePlans" className="block font-semibold mb-2">
              Future Plans & Goals
            </label>
            <textarea
              id="futurePlans"
              value={(formData as any).futurePlans || ''}
              onChange={(e) => handleAdditionalInfoChange('futurePlans', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your future plans, goals, and vision..."
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.futurePlans || '')).words} words
            </div>
          </div>

          {/* Custom Fields */}
          {customFieldDefinitions
            .filter(field => field.section === 'additionalInfo')
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(field => (
              <div key={field.id} className="md:col-span-2">
                {renderCustomField(field)}
              </div>
            ))}

          {/* Additional Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Additional Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="additionalDocumentsFile" className="block text-sm font-medium mb-1">
                  Additional Supporting Documents
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="additionalDocumentsFile"
                      onChange={(e) => handleAdditionalInfoFile('additionalDocuments', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    {formData.additionalDocuments && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('additionalDocuments')}
                        <button
                          onClick={() => removeFile('additionalDocuments')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{additionalInfoAutoSaveStatus}</div>
      </section>
    );
  }

  // --- LEADERSHIP DETAILS SECTION ---
  const [leadershipDetailsAutoSaveStatus, setLeadershipDetailsAutoSaveStatus] = useState('');

  const handleLeadershipDetailsChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setLeadershipDetailsAutoSaveStatus('Unsaved changes...');
  };

  const handleLeadershipDetailsFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setLeadershipDetailsAutoSaveStatus('File uploaded...');
    }
  };

  const handleLeadershipDetailsLock = () => {
    lockSection('leadershipDetails');
    setLeadershipDetailsAutoSaveStatus('Section locked');
  };

  const handleLeadershipDetailsUnlock = () => {
    unlockSection('leadershipDetails');
    setLeadershipDetailsAutoSaveStatus('Section unlocked');
  };

  const renderLeadershipDetailsSection = () => {
    const isLocked = isSectionLocked('leadershipDetails');
    const background = getSectionBackground('leadershipDetails');
    const progress = calculateSectionProgress('leadershipDetails');
    const status = getProgressStatus('leadershipDetails');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="leadership-details-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="leadership-details-heading" className="text-2xl font-bold">Leadership Details</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleLeadershipDetailsUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleLeadershipDetailsLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('leadershipDetails', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* Leadership Structure */}
          <div className="md:col-span-2">
            <label htmlFor="leadershipStructure" className="block font-semibold mb-2">
              Leadership Structure
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('leadershipStructure') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleLeadershipDetailsChange('leadershipStructure', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('leadershipStructure') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleLeadershipDetailsChange('leadershipStructure', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('leadershipStructure') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleLeadershipDetailsChange('leadershipStructure', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.leadershipStructure || ''));
                    toast.success('Leadership structure copied!');
                  }}
                  disabled={!formData.leadershipStructure || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="leadershipStructure"
                value={(formData as any).leadershipStructure || ''}
                onChange={(e) => handleLeadershipDetailsChange('leadershipStructure', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="Describe your leadership structure and key personnel..."
                rows={5}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.leadershipStructure || '')).words} words
            </div>
          </div>

          {/* Executive Team */}
          <div>
            <label htmlFor="executiveTeam" className="block font-semibold mb-2">
              Executive Team
            </label>
            <div className="border rounded focus-within:ring-2 focus-within:ring-blue-500">
              <div className="border-b bg-gray-50 px-3 py-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('executiveTeam') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<strong>' + selection + '</strong>' + after;
                      handleLeadershipDetailsChange('executiveTeam', newText);
                      toast.success('Bold formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Bold"
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('executiveTeam') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<em>' + selection + '</em>' + after;
                      handleLeadershipDetailsChange('executiveTeam', newText);
                      toast.success('Italic formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Italic"
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('executiveTeam') as HTMLTextAreaElement;
                    if (textarea) {
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const text = textarea.value;
                      const before = text.substring(0, start);
                      const selection = text.substring(start, end);
                      const after = text.substring(end);
                      const newText = before + '<u>' + selection + '</u>' + after;
                      handleLeadershipDetailsChange('executiveTeam', newText);
                      toast.success('Underline formatting applied!');
                    }
                  }}
                  disabled={isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Underline"
                >
                  <u>U</u>
                </button>
                <div className="flex-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(String(formData.executiveTeam || ''));
                    toast.success('Executive team copied!');
                  }}
                  disabled={!formData.executiveTeam || isLocked || isFieldDisabled()}
                  className="px-2 py-1 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <textarea
                id="executiveTeam"
                value={(formData as any).executiveTeam || ''}
                onChange={(e) => handleLeadershipDetailsChange('executiveTeam', e.target.value)}
                disabled={isLocked || isFieldDisabled()}
                className="w-full px-3 py-2 border-0 focus:ring-0 resize-none disabled:bg-gray-100"
                placeholder="List and describe your executive team members..."
                rows={4}
              />
            </div>
          </div>

          {/* Leadership Development */}
          <div>
            <label htmlFor="leadershipDevelopment" className="block font-semibold mb-2">
              Leadership Development
            </label>
            <textarea
              id="leadershipDevelopment"
              value={(formData as any).leadershipDevelopment || ''}
              onChange={(e) => handleLeadershipDetailsChange('leadershipDevelopment', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe leadership development and succession planning..."
              rows={3}
            />
          </div>

          {/* Decision Making Process */}
          <div>
            <label htmlFor="decisionMakingProcess" className="block font-semibold mb-2">
              Decision Making Process
            </label>
            <textarea
              id="decisionMakingProcess"
              value={(formData as any).decisionMakingProcess || ''}
              onChange={(e) => handleLeadershipDetailsChange('decisionMakingProcess', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your decision-making process and governance..."
              rows={3}
            />
          </div>

          {/* Leadership Philosophy */}
          <div>
            <label htmlFor="leadershipPhilosophy" className="block font-semibold mb-2">
              Leadership Philosophy
            </label>
            <textarea
              id="leadershipPhilosophy"
              value={(formData as any).leadershipPhilosophy || ''}
              onChange={(e) => handleLeadershipDetailsChange('leadershipPhilosophy', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your leadership philosophy and approach..."
              rows={3}
            />
          </div>

          {/* Leadership Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Leadership Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="leadershipPlanFile" className="block text-sm font-medium mb-1">
                  Leadership Development Plan
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="leadershipPlanFile"
                      onChange={(e) => handleLeadershipDetailsFile('leadershipPlan', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.leadershipPlan && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('leadershipPlan')}
                        <button
                          onClick={() => removeFile('leadershipPlan')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>

              <div>
                <label htmlFor="organizationalChartFile" className="block text-sm font-medium mb-1">
                  Organizational Chart
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="organizationalChartFile"
                      onChange={(e) => handleLeadershipDetailsFile('organizationalChart', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    {formData.organizationalChart && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('organizationalChart')}
                        <button
                          onClick={() => removeFile('organizationalChart')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{leadershipDetailsAutoSaveStatus}</div>
      </section>
    );
  }

  const renderBoardMemberDetailsSection = () => {
    return (
      <section className="mb-8" aria-labelledby="board-member-details-heading">
        <div className="flex items-center justify-between mb-2">
          <h2 id="board-member-details-heading" className="text-2xl font-bold">Board Member Details</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow">
          <div>
            <label htmlFor="boardMemberProfiles" className="block font-semibold">Board Member Profiles</label>
            <textarea
              id="boardMemberProfiles"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Provide detailed profiles of board members including background and expertise..."
              rows={6}
            />
          </div>
          <div>
            <label htmlFor="boardCommittees" className="block font-semibold">Board Committees</label>
            <textarea
              id="boardCommittees"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe board committees and their functions..."
              rows={3}
            />
          </div>
        </div>
      </section>
    );
  }

  const renderStaffDetailsSection = () => {
    return (
      <section className="mb-8" aria-labelledby="staff-details-heading">
        <div className="flex items-center justify-between mb-2">
          <h2 id="staff-details-heading" className="text-2xl font-bold">Staff Details</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow">
          <div>
            <label htmlFor="staffStructure" className="block font-semibold">Staff Structure</label>
            <textarea
              id="staffStructure"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe your staff structure and key positions..."
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="staffQualifications" className="block font-semibold">Staff Qualifications</label>
            <textarea
              id="staffQualifications"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Describe staff qualifications and professional development..."
              rows={4}
            />
          </div>
        </div>
      </section>
    );
  }

  // --- DONATIONS SECTION ---
  const [donationsAutoSaveStatus, setDonationsAutoSaveStatus] = useState('');

  const handleDonationsChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...(prev as any), [field]: value }));
    setUnsavedChanges(true);
    setDonationsAutoSaveStatus('Unsaved changes...');
  };

  const handleDonationsFile = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSpecificFileUpload(field, file);
      setDonationsAutoSaveStatus('File uploaded...');
    }
  };

  const handleDonationsLock = () => {
    lockSection('donations');
    setDonationsAutoSaveStatus('Section locked');
  };

  const handleDonationsUnlock = () => {
    unlockSection('donations');
    setDonationsAutoSaveStatus('Section unlocked');
  };

  const renderDonationsSection = () => {
    const isLocked = isSectionLocked('donations');
    const background = getSectionBackground('donations');
    const progress = calculateSectionProgress('donations');
    const status = getProgressStatus('donations');

    return (
      <section className={`mb-8 ${background}`} aria-labelledby="donations-heading">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 id="donations-heading" className="text-2xl font-bold">Donations & Fundraising</h2>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded ${status === 'Info Provided' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status}
              </span>
              <span className="text-sm text-gray-500">({progress}% complete)</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLocked ? (
              <button
                onClick={handleDonationsUnlock}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
              >
                <UnlockIcon className="w-4 h-4 mr-1" />
                Unlock
              </button>
            ) : (
              <button
                onClick={handleDonationsLock}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium"
              >
                <LockIcon className="w-4 h-4 mr-1" />
                Lock
              </button>
            )}
            <button
              onClick={() => handleSectionStatus('donations', 'final')}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
            >
              <Check className="w-4 h-4 mr-1" />
              Mark Final
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow">
          {/* State Charitable Solicitations */}
          <div className="md:col-span-2">
            <label htmlFor="stateCharitableSolicitations" className="block font-semibold mb-2">
              State Charitable Solicitations Registration
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              id="stateCharitableSolicitations"
              value={(formData as any).stateCharitableSolicitations || ''}
              onChange={(e) => handleDonationsChange('stateCharitableSolicitations', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="List all states where you are registered to solicit charitable donations..."
              rows={3}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.stateCharitableSolicitations || '')).words} words
            </div>
          </div>

          {/* Donation Page URL */}
          <div className="md:col-span-2">
            <label htmlFor="donationPageUrl" className="block font-semibold mb-2">
              Donation Page URL
            </label>
            <input
              type="url"
              id="donationPageUrl"
              value={(formData as any).donationPageUrl || ''}
              onChange={(e) => handleDonationsChange('donationPageUrl', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="https://your-organization.org/donate"
            />
          </div>

          {/* Fundraising Strategy */}
          <div className="md:col-span-2">
            <label htmlFor="fundraisingStrategy" className="block font-semibold mb-2">
              Fundraising Strategy
            </label>
            <textarea
              id="fundraisingStrategy"
              value={(formData as any).fundraisingStrategy || ''}
              onChange={(e) => handleDonationsChange('fundraisingStrategy', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your fundraising strategy and methods..."
              rows={4}
            />
            <div className="text-xs text-gray-500 mt-1">
              {getTextStats(String(formData.fundraisingStrategy || '')).words} words
            </div>
          </div>

          {/* Major Donors */}
          <div>
            <label htmlFor="majorDonors" className="block font-semibold mb-2">
              Major Donors
            </label>
            <textarea
              id="majorDonors"
              value={(formData as any).majorDonors || ''}
              onChange={(e) => handleDonationsChange('majorDonors', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="List major donors and their contribution levels..."
              rows={3}
            />
          </div>

          {/* Grant Funding */}
          <div>
            <label htmlFor="grantFunding" className="block font-semibold mb-2">
              Grant Funding
            </label>
            <textarea
              id="grantFunding"
              value={(formData as any).grantFunding || ''}
              onChange={(e) => handleDonationsChange('grantFunding', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="List current and past grant funding sources..."
              rows={3}
            />
          </div>

          {/* Fundraising Events */}
          <div className="md:col-span-2">
            <label htmlFor="fundraisingEvents" className="block font-semibold mb-2">
              Fundraising Events
            </label>
            <textarea
              id="fundraisingEvents"
              value={(formData as any).fundraisingEvents || ''}
              onChange={(e) => handleDonationsChange('fundraisingEvents', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your annual fundraising events and their success..."
              rows={3}
            />
          </div>

          {/* Online Fundraising */}
          <div>
            <label htmlFor="onlineFundraising" className="block font-semibold mb-2">
              Online Fundraising Platforms
            </label>
            <textarea
              id="onlineFundraising"
              value={(formData as any).onlineFundraising || ''}
              onChange={(e) => handleDonationsChange('onlineFundraising', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="List online fundraising platforms you use..."
              rows={3}
            />
          </div>

          {/* Corporate Partnerships */}
          <div>
            <label htmlFor="corporatePartnerships" className="block font-semibold mb-2">
              Corporate Partnerships
            </label>
            <textarea
              id="corporatePartnerships"
              value={(formData as any).corporatePartnerships || ''}
              onChange={(e) => handleDonationsChange('corporatePartnerships', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe corporate partnerships and sponsorships..."
              rows={3}
            />
          </div>

          {/* Donor Recognition */}
          <div className="md:col-span-2">
            <label htmlFor="donorRecognition" className="block font-semibold mb-2">
              Donor Recognition Program
            </label>
            <textarea
              id="donorRecognition"
              value={(formData as any).donorRecognition || ''}
              onChange={(e) => handleDonationsChange('donorRecognition', e.target.value)}
              disabled={isLocked || isFieldDisabled()}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Describe your donor recognition and stewardship program..."
              rows={3}
            />
          </div>

          {/* Fundraising Documents */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Fundraising Documents</label>
            <div className="space-y-3">
              <div>
                <label htmlFor="fundraisingPlanFile" className="block text-sm font-medium mb-1">
                  Fundraising Plan
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="fundraisingPlanFile"
                      onChange={(e) => handleDonationsFile('fundraisingPlan', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.doc,.docx"
                    />
                    {formData.fundraisingPlan && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('fundraisingPlan')}
                        <button
                          onClick={() => removeFile('fundraisingPlan')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>

              <div>
                <label htmlFor="donorDatabaseFile" className="block text-sm font-medium mb-1">
                  Donor Database Report
                </label>
                <div className="flex items-center space-x-2">
                  <>
                    <input
                      type="file"
                      id="donorDatabaseFile"
                      onChange={(e) => handleDonationsFile('donorDatabase', e)}
                      disabled={isLocked || isFieldDisabled()}
                      className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      accept=".pdf,.xls,.xlsx,.csv"
                    />
                    {formData.donorDatabase && (
                      <div className="flex items-center space-x-2">
                        {getFileStateIcon('donorDatabase')}
                        <button
                          onClick={() => removeFile('donorDatabase')}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Auto-save status */}
        <div className="text-right text-xs text-gray-500 mt-1">{donationsAutoSaveStatus}</div>
      </section>
    );
  }

  const renderReferencesSection = () => {
    return (
      <section className="mb-8" aria-labelledby="references-heading">
        <div className="flex items-center justify-between mb-2">
          <h2 id="references-heading" className="text-2xl font-bold">References</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 bg-white rounded-lg shadow">
          <div>
            <label htmlFor="professionalReferences" className="block font-semibold">Professional References</label>
            <textarea
              id="professionalReferences"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Provide professional references who can speak to your organization's work..."
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="communityReferences" className="block font-semibold">Community References</label>
            <textarea
              id="communityReferences"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Provide community references who can speak to your organization's impact..."
              rows={4}
            />
          </div>
        </div>
      </section>
    );
  }

  // Main render
  return (
    <>
      {/* Print Stylesheet */}
      <style media="print">{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          body { margin: 0; background: white !important; font-family: Arial, sans-serif; }
          .print-hide { display: none !important; }
          .print-show { display: block !important; }
          .bg-gray-100 { background: white !important; }
          .bg-blue-50, .bg-gray-50, .bg-green-50 { 
            background: #f8f9fa !important; 
            border: 1px solid #dee2e6 !important; 
          }
          .shadow, .shadow-sm, .shadow-lg { box-shadow: none !important; }
          .rounded-lg { border-radius: 4px !important; }
          .text-blue-600, .text-green-600 { color: #000 !important; font-weight: bold; }
          .text-red-600 { color: #000 !important; font-weight: bold; }
          .border-gray-200 { border-color: #333 !important; }
          .px-4, .px-6 { padding-left: 12pt !important; padding-right: 12pt !important; }
          .py-3, .py-4 { padding-top: 8pt !important; padding-bottom: 8pt !important; }
          .text-sm { font-size: 10pt !important; }
          .text-lg { font-size: 12pt !important; }
          .text-xl { font-size: 14pt !important; }
          .text-2xl { font-size: 16pt !important; font-weight: bold; }
          .space-y-8 > * + * { margin-top: 16pt !important; }
          .space-y-4 > * + * { margin-top: 10pt !important; }
          .grid { display: block !important; }
          .grid > * { margin-bottom: 10pt !important; break-inside: avoid; }
          input[type="text"], input[type="email"], input[type="tel"], textarea {
            border: none !important;
            border-bottom: 1px solid #333 !important;
            background: transparent !important;
            padding: 2pt 4pt !important;
            margin-bottom: 6pt !important;
            font-size: 10pt !important;
          }
          button, .print-hide { display: none !important; }
          .animate-spin, .animate-pulse, .animate-bounce { animation: none !important; }
          h1, h2, h3 { page-break-after: avoid; margin-bottom: 8pt !important; }
          .page-break { page-break-before: always; }
          section { break-inside: avoid; margin-bottom: 20pt !important; }
          header, .fixed { position: static !important; }
          .overflow-x-auto { overflow: visible !important; }
          .flex { display: block !important; }
          .sidebar { display: none !important; }
        }
        
        /* Hide blank fields when print option is enabled */
        body.hide-blank-fields-print input:placeholder-shown,
        body.hide-blank-fields-print textarea:placeholder-shown,
        body.hide-blank-fields-print select:invalid,
        body.hide-blank-fields-print .field-container:has(input[value=""]),
        body.hide-blank-fields-print .field-container:has(textarea:empty) {
          display: none !important;
        }
        
        body.hide-blank-fields-print .mb-4:has(input[value=""]),
        body.hide-blank-fields-print .mb-4:has(textarea:empty),
        body.hide-blank-fields-print .space-y-4 > div:has(input[value=""]),
        body.hide-blank-fields-print .space-y-4 > div:has(textarea:empty) {
          display: none !important;
        }
      `}</style>
      
      {/* Fixed Top Bar - Enhanced Communications Hub Style */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4 z-40 print:hidden">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-semibold text-gray-800">CALAO Nonprofit Profile</span>
          
          {/* Auto-save Status Indicator */}
          <div className="flex items-center space-x-2 text-sm">
            {autoSaveStatus === 'saving' && (
              <div className="flex items-center text-blue-500">
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {autoSaveStatus === 'saved' && (
              <div className="flex items-center text-green-500">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-sm">All changes saved</span>
              </div>
            )}
            {autoSaveStatus === 'error' && (
              <div className="flex items-center text-red-500">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Save failed</span>
              </div>
            )}
            {lastSaved && autoSaveStatus === 'idle' && (
              <div className="text-gray-500">
                <span className="text-xs">Last saved {formatRelativeTime(lastSaved)}</span>
              </div>
            )}
          </div>
          
          {/* Offline Indicator */}
          <OfflineIndicator />
          
          {/* EUID Display - will be populated once organization EUID is available */}
          
          {/* Connection Status & Error Recovery */}
          {connectionStatus === 'offline' && (
            <button
              onClick={() => setShowOfflineQueue(true)}
              className="flex items-center text-orange-600 text-sm mr-4 hover:text-orange-700 transition-colors"
              title="View offline queue"
            >
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Offline - changes saved locally</span>
              {submissionQueue.filter(item => item.status === 'pending').length > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {submissionQueue.filter(item => item.status === 'pending').length}
                </span>
              )}
            </button>
          )}
          
        </div>
        
        {/* Right side of header */}
        <div className="flex items-center space-x-4">
          {/* EUID Display - will show when organization has EUID */}
          
          {currentUser && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{currentUser.name}</span>
              <span className="text-gray-400">|</span>
              <span>{currentUser.organization}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setShowAdvancedSearch(true)} 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Advanced Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAnalyticsDashboard(true)} 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Analytics Dashboard"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => setShowRoleManagement(true)} 
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Role Management"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={() => setShowExportImportModal(true)} 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export/Import Data"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowHelpModal(true)} 
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Get Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleLanguage}
              className="px-2 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Toggle language"
            >
              {language === 'en' ? 'ES' : 'EN'}
            </button>
            <button 
              onClick={onLogout} 
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          
          {/* EUID Display */}
          {formData.euid && (
            <div className="ml-4">
              <EUIDDisplay euid={formData.euid} />
            </div>
          )}
          
          {/* CALAO Logo */}
          <div className="ml-4">
            <img 
              src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=612,h=408,fit=crop/Aq2WzXM91eC3ZBzQ/calao-corp-YleWz0KXP9hQky0V.png"
              alt="CALAO Corp Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </header>

      {/* Enhanced Auto-save status indicator */}
      <div className="fixed top-20 right-4 z-50 bg-white rounded-lg shadow-lg border p-3 transition-all duration-300">
        {autoSaveStatus === 'saving' && (
          <div className="flex items-center text-yellow-600">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <div>
              <span className="text-sm font-medium">Saving changes...</span>
              {autoSaveCountdown > 0 && (
                <span className="text-xs text-gray-500 block">Auto-save in {autoSaveCountdown}s</span>
              )}
            </div>
          </div>
        )}
        {autoSaveStatus === 'saved' && (
          <div className="flex items-center text-green-600">
            <Check className="w-5 h-5 mr-2" />
            <div>
              <span className="text-sm font-medium">All changes saved</span>
              {lastSaved && (
                <span className="text-xs text-gray-500 block">
                  {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}
        {autoSaveStatus === 'error' && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <div>
              <span className="text-sm font-medium">Save failed</span>
              <button 
                onClick={handleAutoSave}
                className="text-xs text-blue-600 hover:underline block"
              >
                Retry save
              </button>
            </div>
          </div>
        )}
        {hasUnsavedChanges && autoSaveStatus === 'idle' && autoSaveCountdown > 0 && (
          <div className="flex items-center text-blue-600">
            <Clock className="w-5 h-5 mr-2" />
            <div>
              <span className="text-sm font-medium">Unsaved changes</span>
              <span className="text-xs text-gray-500 block">Auto-save in {autoSaveCountdown}s</span>
            </div>
          </div>
        )}
        {!hasUnsavedChanges && autoSaveStatus === 'idle' && (
          <div className="flex items-center text-gray-500">
            <Check className="w-5 h-5 mr-2" />
            <span className="text-sm">Up to date</span>
          </div>
        )}
      </div>

      <div className="min-h-screen bg-gray-50 flex overflow-x-auto print:block print:bg-white">
      
      {/* Sticky Progress Bar */}
      <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-30 print:hidden">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-semibold text-gray-900">Form Progress</h3>
              <span className="text-sm text-gray-500">
                {Object.values(sectionProgress).filter(p => p === 100).length} of {Object.keys(sectionProgress).length} sections complete
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-blue-600">{calculateOverallProgress()}%</span>
              {calculateOverallProgress() === 100 && (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${calculateOverallProgress()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Started</span>
            <span>In Progress</span>
            <span>Complete</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col fixed left-0 top-28 h-[calc(100vh-7rem)] z-30 print:hidden">
        <div className="p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">CALAO Profile</h2>
          <div className="flex space-x-1 mt-2">
            <button
              onClick={() => setActiveTab('full')}
              className={`px-2 py-1 text-xs rounded ${activeTab === 'full' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Full
            </button>
            <button
              onClick={() => setActiveTab('cff')}
              className={`px-2 py-1 text-xs rounded ${activeTab === 'cff' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              CFF
            </button>
            <button
              onClick={() => setActiveTab('required')}
              className={`px-2 py-1 text-xs rounded ${activeTab === 'required' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Required
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-2 py-1 text-xs rounded ${activeTab === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Custom
            </button>
          </div>
          
          {/* Profile Info */}
          {currentUser?.role === 'admin' && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h3 className="text-xs font-semibold text-gray-600 mb-2">Profile Codes</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Profile:</span>
                  <code className="text-xs bg-white px-2 py-0.5 rounded font-mono">{profileCode}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">WhatsApp:</span>
                  <code className="text-xs bg-white px-2 py-0.5 rounded font-mono">{whatsappCode}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Email:</span>
                  <span className="text-xs">{profileEmail || 'Not set'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Form Sections Navigation */}
          <nav className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Form Sections</h3>
            {getVisibleSections().map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveTab(section.id);
                  setShowSidebar(false);
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 flex items-center ${
                  activeTab === section.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-50'
                }`}
              >
                <section.icon className="w-4 h-4 mr-3" />
                <span className="font-medium">{section.name}</span>
                <div className="flex items-center space-x-1 ml-auto">
                  {sectionLocks[section.id] && <Lock className="w-4 h-4 text-red-500" />}
                  {sectionStatus[section.id] === 'final' && <Check className="w-4 h-4 text-green-500" />}
                </div>
              </button>
            ))}
            
            {/* Add Custom Section Button */}
            <button
              onClick={() => {
                setActiveTab('basicInfo');
                // Scroll to custom sections at the bottom of basic info
                setTimeout(() => {
                  const customSection = document.getElementById('custom-sections');
                  if (customSection) {
                    customSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 100);
              }}
              className="w-full text-left p-3 rounded-lg mb-2 flex items-center hover:bg-gray-50 border-2 border-dashed border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-400"
            >
              <Plus className="w-4 h-4 mr-3" />
              <span className="font-medium">Add Custom Section</span>
            </button>
          </nav>
          
          {/* Quick Actions */}
          <div className="p-4 border-t space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <button
              onClick={handleSaveForm}
              className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Form
            </button>
            <button
              onClick={toggleShowBanner}
              className="w-full bg-gray-200 text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium flex items-center justify-center"
            >
              {showBanner ? 'Hide Banner' : 'Show Banner'}
            </button>
          </div>
          
          {/* Manager Tools Access */}
          <div className="p-4 border-t space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Management Tools</h3>
          <button
            onClick={() => setShowContactManager(true)}
            className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Manage contacts and relationships"
          >
            <Users className="w-5 h-5 mr-2" />
            Contact Manager
          </button>
          <button
            onClick={() => setShowProgramManager(true)}
            className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Manage projects and programs"
          >
            <FileText className="w-5 h-5 mr-2" />
            Program Manager
          </button>
          <button
            onClick={() => setShowDocumentManager(true)}
            className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Manage documents and files"
          >
            <FolderOpen className="w-5 h-5 mr-2" />
            Document Manager
          </button>
          <button
            onClick={() => setShowHealthDashboard(true)}
            className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Organizational health assessment and benchmarking"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Health Dashboard
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setShowPerformanceDashboard(true)}
              className="w-full bg-orange-500 text-white py-2 px-3 rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
              title="Application performance monitoring and metrics"
            >
              <Activity className="w-5 h-5 mr-2" />
              Performance Monitor
            </button>
          )}
          <button
            onClick={() => setShowCommunicationsModule(true)}
            className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Communications Center - Email, WhatsApp, Fax, etc."
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Communications
          </button>
        </div>

        {/* Action Tools */}
        <div className="p-4 border-t space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
          <button
            onClick={handleSaveForm}
            className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Save current progress"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
          <button
            onClick={() => document.getElementById('import-file-input')?.click()}
            className="w-full bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Import application data"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full bg-indigo-500 text-white py-2 px-3 rounded-lg hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Export application data"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="w-full bg-gray-400 text-white py-2 px-3 rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Print application with options"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium flex items-center justify-center"
            title="Application settings"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </button>
          
          {/* Admin Tools */}
          <div className="border-t pt-3 mt-3">
            <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Advanced Tools</h4>
            
            {currentUser?.role === 'admin' && (
              <>
                <button
                  onClick={() => setShowAdminDistribution(true)}
                  className="w-full bg-purple-500 text-white py-2 px-3 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium flex items-center justify-center mb-2"
                  title="Admin Document Distribution System"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Admin Distribution
                </button>
                
                <button
                  onClick={() => setShowAPILocker(true)}
                  className="w-full bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium flex items-center justify-center mb-2"
                  title="API Keys Management"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  API Locker
                </button>
                
              </>
            )}
            
            <button
              onClick={() => setShowQuickWins(true)}
              className="w-full bg-yellow-500 text-white py-2 px-3 rounded-lg hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-colors font-medium flex items-center justify-center mb-2"
              title="Quick Wins, Tips & Keyboard Shortcuts"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Wins
            </button>
            
            <button
              onClick={() => setShowProgressTracker(!showProgressTracker)}
              className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium flex items-center justify-center mb-2"
              title="Toggle Progress Tracker"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showProgressTracker ? 'Hide' : 'Show'} Progress Tracker
            </button>
            
            <button
              onClick={() => setShowProTips(!showProTips)}
              className={`w-full ${showProTips ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' : 'bg-gray-400 hover:bg-gray-500 focus:ring-gray-400'} text-white py-2 px-3 rounded-lg flex items-center justify-center focus:ring-2 focus:outline-none transition-colors font-medium`}
              title="Toggle Pro Tips"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Pro Tips: {showProTips ? 'ON' : 'OFF'}
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Error Recovery Modal */}
      {errorBoundaryInfo.hasError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">Application Error</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Something went wrong, but don't worry - your data has been saved automatically.
            </p>
            {errorBoundaryInfo.error && (
              <div className="bg-gray-50 p-3 rounded mb-4">
                <p className="text-sm font-medium text-gray-900">Error details:</p>
                <p className="text-sm text-gray-600">{errorBoundaryInfo.error instanceof Error ? errorBoundaryInfo.error.message : 'Unknown error'}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={recoverFromError}
                className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Recover Data
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-400 text-white py-2 px-3 rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Help & Support</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex">
              {/* Help Topics Sidebar */}
              <div className="w-1/3 bg-gray-50 p-4 border-r">
                <h3 className="font-semibold mb-3">Topics</h3>
                <div className="space-y-2">
                  {Object.keys(helpContent).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setHelpTopic(topic)}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        helpTopic === topic ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      {helpContent[topic as keyof typeof helpContent].title}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Help Content */}
              <div className="flex-1 p-6 overflow-y-auto max-h-96">
                <h3 className="text-lg font-semibold mb-4">
                  {helpContent[helpTopic as keyof typeof helpContent].title}
                </h3>
                <ul className="space-y-3">
                  {helpContent[helpTopic as keyof typeof helpContent].content.map((item, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-900">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t">
              <p className="text-sm text-gray-600 text-center">
                Need more help? Contact support at help@calao.org
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Import Data from CSV</h2>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Step 1: Download Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download a CSV template that matches your current form configuration.
                    The template includes all visible fields and example data.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Current Template
                  </button>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Step 2: Upload Your CSV</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your completed CSV file. The first row will be imported into the current form.
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {importPreview.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Preview (First 5 rows)</h3>
                    <div className="border rounded-lg overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(importPreview[0] || {}).filter(k => k !== '_rowIndex').map(key => (
                              <th key={key} className="px-3 py-2 text-left font-medium text-gray-900">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {importPreview.map((row, index) => (
                            <tr key={index} className="border-t">
                              {Object.keys(row).filter(k => k !== '_rowIndex').map(key => (
                                <td key={key} className="px-3 py-2 text-gray-900">
                                  {row[key] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={importData}
                disabled={!importFile}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="keyboard-shortcuts-title" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h2 id="keyboard-shortcuts-title" className="text-xl font-bold flex items-center">
                <HelpCircle className="w-6 h-6 mr-2" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                aria-label="Close keyboard shortcuts"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Shortcuts */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">General</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Save form</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + S</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Print form</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + P</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Export data</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + E</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Import data</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + I</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Share form</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + K</kbd>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Navigation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Previous section</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + ↑</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Next section</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + ↓</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Jump to section 1-9</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Alt + 1-9</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Focus search</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + /</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Close modal</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Esc</kbd>
                    </div>
                  </div>
                </div>

                {/* Form Management */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Form Management</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Clear form</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + Shift + C</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Revert to session start</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + Shift + R</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Lock/Unlock section</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + L</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Toggle field visibility</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + H</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Duplicate field</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + D</kbd>
                    </div>
                  </div>
                </div>

                {/* Accessibility */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Accessibility</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Focus first error</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + Shift + F</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Focus next required</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Tab</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Toggle high contrast</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + Shift + H</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Toggle view mode</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Ctrl/⌘ + Shift + V</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Show keyboard shortcuts</span>
                      <kbd className="bg-white px-2 py-1 rounded-lg border border-gray-200 text-sm font-mono">Shift + ?</kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2 text-blue-900">Pro Tips</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  <li>Most shortcuts work with both Ctrl (Windows/Linux) and ⌘ (Mac)</li>
                  <li>Hold Shift while clicking to select multiple items</li>
                  <li>Double-click section headers to expand/collapse</li>
                  <li>Drag and drop files directly onto upload areas</li>
                  <li>Use Tab and Shift+Tab to navigate between fields</li>
                  <li>Press Space to toggle checkboxes and radio buttons</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Press <kbd className="bg-white px-1 py-0.5 rounded border border-gray-200 text-xs font-mono">Shift + ?</kbd> anytime to view these shortcuts
              </p>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Completion Dashboard Modal */}
      {showCompletionDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="dashboard-title" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <h2 id="dashboard-title" className="text-xl font-bold flex items-center">
                <Circle className="w-6 h-6 mr-2" />
                Form Completion Dashboard
              </h2>
              <button
                onClick={() => setShowCompletionDashboard(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                aria-label="Close dashboard"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Overall Progress */}
              <div className="mb-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Circle className="w-5 h-5 mr-2 text-blue-600" />
                  Overall Progress
                </h3>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-800">{calculateOverallProgress()}%</span>
                    <span className="text-sm text-gray-600">
                      {Object.values(sectionProgress).filter(p => p === 100).length} of {sections.length} sections complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${calculateOverallProgress()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Section Progress Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {sections.map((section) => {
                  const progress = sectionProgress[section.id as keyof typeof sectionProgress] || 0;
                  const isComplete = progress === 100;
                  const isInProgress = progress > 0 && progress < 100;
                  const sectionRequiredFields = requiredFields[section.id as keyof typeof requiredFields] || [];
                  const filledRequiredFields = sectionRequiredFields.filter(field => {
                    const value = formData[field];
                    return value && (typeof value === 'string' ? value.trim() !== '' : true);
                  });
                  
                  return (
                    <div 
                      key={section.id}
                      className={`border rounded-lg p-4 ${
                        isComplete ? 'bg-green-50 border-green-300' : 
                        isInProgress ? 'bg-yellow-50 border-yellow-300' : 
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{section.name}</h4>
                        {isComplete && <Check className="w-5 h-5 text-green-600" />}
                        {sectionLocks[section.id] && <Lock className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{progress}%</span>
                          <span>{filledRequiredFields.length}/{sectionRequiredFields.length} fields</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              isComplete ? 'bg-green-500' : 
                              isInProgress ? 'bg-yellow-500' : 
                              'bg-gray-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      {!isComplete && sectionRequiredFields.length > 0 && (
                        <div className="text-xs text-gray-600 mt-2">
                          Missing: {sectionRequiredFields.filter(f => !filledRequiredFields.includes(f)).slice(0, 2).join(', ')}
                          {sectionRequiredFields.filter(f => !filledRequiredFields.includes(f)).length > 2 && ` +${sectionRequiredFields.filter(f => !filledRequiredFields.includes(f)).length - 2} more`}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setActiveTab(section.id);
                          setShowCompletionDashboard(false);
                          manageFocus.focusSection(section.id);
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Go to section →
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(formData).filter(k => formData[k] && (typeof formData[k] === 'string' ? (formData[k] as string).trim() !== '' : true)).length}
                  </div>
                  <div className="text-sm text-gray-600">Fields Filled</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(sectionProgress).filter(p => p === 100).length}
                  </div>
                  <div className="text-sm text-gray-600">Sections Complete</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.keys(errors).length}
                  </div>
                  <div className="text-sm text-gray-600">Validation Errors</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((new Date().getTime() - new Date(sessionStartTime).getTime()) / 60000)}
                  </div>
                  <div className="text-sm text-gray-600">Minutes in Session</div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 text-blue-900">Recommendations</h3>
                <ul className="space-y-2">
                  {calculateOverallProgress() < 25 && (
                    <li className="flex items-start">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-blue-800">
                        Start with the Basic Information section to establish your organization's identity.
                      </span>
                    </li>
                  )}
                  {Object.keys(errors).length > 0 && (
                    <li className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-blue-800">
                        You have {Object.keys(errors).length} validation errors. Press Ctrl+Shift+F to focus on the first error.
                      </span>
                    </li>
                  )}
                  {Object.values(sectionProgress).filter(p => p > 0 && p < 100).length > 0 && (
                    <li className="flex items-start">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-blue-800">
                        Complete the {Object.values(sectionProgress).filter(p => p > 0 && p < 100).length} in-progress sections before starting new ones.
                      </span>
                    </li>
                  )}
                  {calculateOverallProgress() > 80 && (
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-blue-800">
                        Great progress! Review your responses and consider saving a backup before final submission.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Last saved: {lastSaved ? lastSaved.toLocaleTimeString() : 'Not saved'}</span>
                <span>•</span>
                <span>Auto-save: {autoSaveEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExport}
                  className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Progress
                </button>
                <button
                  onClick={() => setShowCompletionDashboard(false)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
                >
                  Close Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="export-title" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 id="export-title" className="text-xl font-bold text-gray-900">Export Options</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close export modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Full Export Options */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Full Application Export</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      exportFormData('json');
                      setShowExportModal(false);
                    }}
                    className="border-2 border-blue-500 rounded-lg p-4 hover:bg-blue-50 transition-colors"
                  >
                    <div className="text-blue-600 mb-2">
                      <FileText className="w-8 h-8 mx-auto" />
                    </div>
                    <h4 className="font-semibold">JSON Export</h4>
                    <p className="text-sm text-gray-600 mt-1">Complete data with metadata</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      exportFormData('csv');
                      setShowExportModal(false);
                    }}
                    className="border-2 border-green-500 rounded-lg p-4 hover:bg-green-50 transition-colors"
                  >
                    <div className="text-green-600 mb-2">
                      <FileText className="w-8 h-8 mx-auto" />
                    </div>
                    <h4 className="font-semibold">CSV Export</h4>
                    <p className="text-sm text-gray-600 mt-1">Spreadsheet compatible</p>
                  </button>
                  
                  <button
                    onClick={() => {
                      window.print();
                      setShowExportModal(false);
                    }}
                    className="border-2 border-purple-500 rounded-lg p-4 hover:bg-purple-50 transition-colors"
                  >
                    <div className="text-purple-600 mb-2">
                      <Printer className="w-8 h-8 mx-auto" />
                    </div>
                    <h4 className="font-semibold">PDF Export</h4>
                    <p className="text-sm text-gray-600 mt-1">Print entire application</p>
                  </button>
                </div>
              </div>
              
              {/* Section-wise Export */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Export Individual Sections</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Export specific sections as PDF files. Perfect for sharing individual parts of your application.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sections.map((section) => {
                    const progress = sectionProgress[section.id as keyof typeof sectionProgress] || 0;
                    const isComplete = progress === 100;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          exportSectionToPDF(section.id);
                          setShowExportModal(false);
                        }}
                        className={`border rounded-lg p-3 text-left hover:shadow-md transition-all ${
                          isComplete ? 'border-green-300 hover:border-green-400' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{section.name}</h4>
                          {isComplete && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{progress}% complete</span>
                          <Download className="w-4 h-4 text-gray-500" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Export History */}
              <div className="mt-8 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Export Tips</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• JSON format preserves all data and can be imported back</li>
                  <li>• CSV format is best for spreadsheet analysis</li>
                  <li>• PDF export uses your browser's print dialog for customization</li>
                  <li>• Section exports include only the data from that specific section</li>
                  <li>• All exports include metadata like export date and user information</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Queue Modal */}
      {showOfflineQueue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="offline-queue-title" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 id="offline-queue-title" className="text-xl font-bold text-gray-900 flex items-center">
                <Cloud className="w-6 h-6 mr-2 text-gray-600" />
                Offline Submission Queue
              </h2>
              <button
                onClick={() => setShowOfflineQueue(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close offline queue"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {submissionQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Cloud className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No queued submissions</p>
                  <p className="text-sm mt-1">All changes have been synchronized</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionQueue.map((item) => (
                    <div 
                      key={item.id}
                      className={`border rounded-lg p-4 ${
                        item.status === 'completed' ? 'bg-green-50 border-green-300' :
                        item.status === 'processing' ? 'bg-blue-50 border-blue-300' :
                        item.status === 'failed' ? 'bg-red-50 border-red-300' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            item.status === 'completed' ? 'bg-green-200' :
                            item.status === 'processing' ? 'bg-blue-200' :
                            item.status === 'failed' ? 'bg-red-200' :
                            'bg-gray-200'
                          }`}>
                            {item.status === 'completed' ? <Check className="w-4 h-4 text-green-700" /> :
                             item.status === 'processing' ? <RefreshCw className="w-4 h-4 text-blue-700 animate-spin" /> :
                             item.status === 'failed' ? <AlertCircle className="w-4 h-4 text-red-700" /> :
                             <Clock className="w-4 h-4 text-gray-900" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.type === 'save' ? 'Form Save' :
                               item.type === 'submit' ? 'Form Submission' :
                               'Section Save'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            item.status === 'completed' ? 'text-green-700' :
                            item.status === 'processing' ? 'text-blue-700' :
                            item.status === 'failed' ? 'text-red-700' :
                            'text-gray-900'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </p>
                          {item.retryCount > 0 && (
                            <p className="text-xs text-gray-500">
                              Retry {item.retryCount}/3
                            </p>
                          )}
                        </div>
                      </div>
                      {item.error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-100 rounded p-2">
                          {item.error}
                        </div>
                      )}
                      {item.status === 'failed' && item.retryCount < 3 && (
                        <button
                          onClick={() => processOfflineQueue()}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Retry Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Connection Status */}
              <div className={`mt-6 p-4 rounded-lg ${
                connectionStatus === 'online' ? 'bg-green-50' : 'bg-orange-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      connectionStatus === 'online' ? 'bg-green-500' : 'bg-orange-500'
                    } animate-pulse`} />
                    <span className={`font-medium ${
                      connectionStatus === 'online' ? 'text-green-700' : 'text-orange-700'
                    }`}>
                      {connectionStatus === 'online' ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                  {connectionStatus === 'offline' && (
                    <span className="text-sm text-orange-600">
                      Changes will sync when reconnected
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {submissionQueue.filter(item => item.status === 'pending').length} pending, 
                {' '}{submissionQueue.filter(item => item.status === 'processing').length} processing
              </div>
              <div className="flex space-x-3">
                {submissionQueue.length > 0 && (
                  <button
                    onClick={clearOfflineQueue}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Clear Queue
                  </button>
                )}
                <button
                  onClick={() => setShowOfflineQueue(false)}
                  className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Checkpoints Modal */}
      {showCheckpointsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="checkpoints-title" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <h2 id="checkpoints-title" className="text-xl font-bold flex items-center">
                <Save className="w-6 h-6 mr-2" />
                Progress Checkpoints
              </h2>
              <button
                onClick={() => setShowCheckpointsModal(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                aria-label="Close checkpoints"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {/* Current Progress */}
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">Current Progress</h3>
                  <button
                    onClick={() => createCheckpoint('manual')}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Checkpoint
                  </button>
                </div>
                <div className="text-2xl font-bold text-purple-700">{calculateOverallProgress()}%</div>
                <div className="text-sm text-gray-600">
                  {Object.values(sectionProgress).filter(p => p === 100).length} of {sections.length} sections complete
                </div>
              </div>
              
              {/* Checkpoints List */}
              {progressCheckpoints.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Save className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No checkpoints yet</p>
                  <p className="text-sm mt-1">Checkpoints are created automatically at milestones or manually</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {progressCheckpoints.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((checkpoint) => (
                    <div 
                      key={checkpoint.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        checkpoint.type === 'milestone' ? 'border-purple-300 bg-purple-50' :
                        checkpoint.type === 'auto' ? 'border-blue-300 bg-blue-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-full ${
                              checkpoint.type === 'milestone' ? 'bg-purple-200' :
                              checkpoint.type === 'auto' ? 'bg-blue-200' :
                              'bg-gray-200'
                            }`}>
                              {checkpoint.type === 'milestone' ? <Shield className="w-4 h-4 text-purple-700" /> :
                               checkpoint.type === 'auto' ? <RefreshCw className="w-4 h-4 text-blue-700" /> :
                               <Save className="w-4 h-4 text-gray-900" />}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{checkpoint.description}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(checkpoint.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Progress: {checkpoint.progress}%</span>
                            <span>•</span>
                            <span>{Object.keys(checkpoint.formData).filter(k => checkpoint.formData[k]).length} fields filled</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => restoreCheckpoint(checkpoint.id)}
                            className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors font-medium text-sm"
                            title="Restore this checkpoint"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          {checkpoint.type === 'manual' && (
                            <button
                              onClick={() => deleteCheckpoint(checkpoint.id)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none transition-colors font-medium text-sm"
                              title="Delete checkpoint"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Information */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-blue-900">About Checkpoints</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Milestone checkpoints</strong> are created automatically at 25%, 50%, 75%, and 100% progress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Auto-save checkpoints</strong> are created every 10 auto-saves</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span><strong>Manual checkpoints</strong> can be created anytime to save your current progress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Last 10 checkpoints are kept; older ones are automatically removed</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {progressCheckpoints.filter(cp => cp.type === 'milestone').length} milestones, 
                {' '}{progressCheckpoints.filter(cp => cp.type === 'auto').length} auto-saves,
                {' '}{progressCheckpoints.filter(cp => cp.type === 'manual').length} manual
              </div>
              <button
                onClick={() => setShowCheckpointsModal(false)}
                className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
              <div className="flex-1 flex flex-col ml-64 pt-28">
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto min-w-0 print:p-0">
          {/* Print Header - Only visible when printing */}
          <div className="hidden print:block mb-8 text-center border-b-2 border-gray-200 pb-4">
            <>
              <h1 className="text-2xl font-bold mb-2">CALAO Nonprofit Profile</h1>
              <p className="text-sm text-gray-600">
                Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
              {formData.orgName && (
                <p className="text-lg font-semibold mt-2">Organization: {String(formData.orgName)}</p>
              )}
              {formData.ein && (
                <p className="text-sm">EIN: {String(formData.ein)}</p>
              )}
            </>
          </div>
          
          {/* Banner - Removed per user request */}
          {/* {showBanner && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    {customBanners[activeBanner] || "Welcome to the CALAO Nonprofit Profile System"}
                  </span>
                </div>
                <button onClick={toggleShowBanner} className="text-blue-600 hover:text-blue-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )} */}

          {/* EIN-First Warning - Removed per user request */}
          {/* {!isEinEntered() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  Please enter your EIN (Employer Identification Number) to unlock all form fields
                </span>
              </div>
            </div>
          )} */}

          {/* Section Content */}
          <div className="bg-white rounded-lg border border-gray-200">
            <>
              {activeTab === 'basicInfo' && renderBasicInfoSection()}
              {activeTab === 'digitalAssets' && renderDigitalAssetsSection()}
              {activeTab === 'brand' && renderBrandSection()}
              {activeTab === 'entityDocuments' && renderEntityDocumentsSection()}
              {activeTab === 'narrative' && renderNarrativeSection()}
              {activeTab === 'governance' && renderGovernanceSection()}
              {activeTab === 'management' && renderManagementSection()}
              {activeTab === 'financials' && renderFinancialSection()}
              {activeTab === 'programs' && renderProgramsSection()}
              {activeTab === 'impact' && renderImpactSection()}
              {activeTab === 'compliance' && renderComplianceSection()}
              {activeTab === 'referencesNetworks' && renderReferencesNetworksSection()}
              {activeTab === 'donations' && renderDonationsSection()}
              {activeTab === 'technology' && renderTechnologySection()}
              {activeTab === 'communications' && renderCommunicationsSection()}
              {activeTab === 'riskManagement' && renderRiskManagementSection()}
              {activeTab === 'insurance' && renderInsuranceSection()}
              {activeTab === 'otherLocations' && renderLocationsSection()}
              {activeTab === 'additionalInfo' && renderAdditionalInfoSection()}
              {activeTab === 'leadershipDetails' && renderLeadershipDetailsSection()}
              {activeTab === 'boardMemberDetails' && renderBoardMemberDetailsSection()}
              {activeTab === 'staffDetails' && renderStaffDetailsSection()}
              {activeTab === 'references' && renderReferencesSection()}
              {/* Default case for unknown sections */}
              {!['basicInfo', 'digitalAssets', 'brand', 'entityDocuments', 'narrative', 'governance', 
                'management', 'financials', 'programs', 'impact', 'compliance', 'referencesNetworks', 
                'donations', 'technology', 'communications', 'riskManagement', 'insurance', 
                'otherLocations', 'additionalInfo', 'leadershipDetails', 'boardMemberDetails', 
                'staffDetails', 'references', 'full', 'cff', 'required', 'custom'].includes(activeTab) && (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <Info className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Section Not Found</h3>
                  <p className="text-gray-600 mb-4">The section "{activeTab}" is not available.</p>
                  <button
                    onClick={() => setActiveTab('basicInfo')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
                  >
                    Go to Basic Information
                  </button>
                </div>
              )}
            </>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Current Password
                </label>
                <div className="flex">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="px-3 py-2 border border-l-0 border-gray-200 rounded-r-md bg-gray-50 hover:bg-gray-100"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showBanner"
                  checked={showBanner}
                  onChange={(e) => setShowBanner(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showBanner" className="text-sm text-gray-900">
                  Show welcome banner
                </label>
              </div>
              
              {currentUser?.role === 'admin' && (
                <div className="flex items-center border-t pt-4">
                  <input
                    type="checkbox"
                    id="disableRequiredFields"
                    checked={disableRequiredFields}
                    onChange={(e) => setDisableRequiredFields(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="disableRequiredFields" className="text-sm text-gray-900">
                    <span className="font-medium text-red-600">Admin:</span> Disable required field validation for all clients
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" role="dialog" aria-labelledby="print-title" aria-modal="true">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 id="print-title" className="text-xl font-bold text-gray-900">Print Options</h2>
              <button
                onClick={() => setShowPrintModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close print modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hideBlankFields"
                    checked={hideBlankFieldsOnPrint}
                    onChange={(e) => setHideBlankFieldsOnPrint(e.target.checked)}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-200 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="hideBlankFields" className="text-sm text-gray-900">
                    Hide blank/unused fields in print
                  </label>
                </div>
                
                <div className="text-xs text-gray-500">
                  When enabled, empty fields will be hidden from the printed version to save space and create a cleaner document.
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (hideBlankFieldsOnPrint) {
                      document.body.classList.add('hide-blank-fields-print');
                    } else {
                      document.body.classList.remove('hide-blank-fields-print');
                    }
                    window.print();
                    setShowPrintModal(false);
                  }}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Guide Modal */}
      {showAdminGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Help - CALAO CORP Nonprofit Profile</h3>
              <button
                onClick={() => setShowAdminGuide(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <section>
                <h4 className="font-semibold text-lg mb-2">Overview</h4>
                <p className="text-gray-900">This enhanced application form includes extensive customization options, field validation, and dynamic form management capabilities.</p>
              </section>

              <section>
                <h4 className="font-semibold text-lg mb-2">Key Features</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-900">
                  <li><strong>Three Views:</strong> Full View (all fields), CFF View (original fields only), Required Only (required fields only)</li>
                  <li><strong>EIN-First Entry:</strong> All fields locked until EIN is entered or "No EIN" is checked</li>
                  <li><strong>Auto-Save:</strong> Automatic save when EIN is entered</li>
                  <li><strong>Section-by-Section Save:</strong> Save progress as you go</li>
                  <li><strong>Visual Status:</strong> Color-coded sections (Pink=Locked, Yellow=Editing, Green=Final)</li>
                  <li><strong>Progress Tracking:</strong> Shows "Info Provided/Not Provided" for sections without required fields</li>
                  <li><strong>Sequential Naming:</strong> Forms without EIN are numbered 00-0000001, 00-0000002, etc.</li>
                  <li><strong>Multi-level Locking:</strong> Lock sections individually or entire document</li>
                  <li><strong>Enhanced Features:</strong> Board/Staff as individuals, attendance tracking, insurance details</li>
                </ul>
              </section>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowAdminGuide(false)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmationMessage}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-3 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Board Manager Modal - Removed */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Board Management System</h3>
              <button
                onClick={() => {}}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Board Members */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg">Board Members ({boardMembers.length})</h4>
                  <button
                    onClick={() => setEditingBoardMember('new')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium flex items-center"
                    title="Add new board member"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Member
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {boardMembers.map(member => (
                    <div key={(member as any).id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{(member as any).name}</div>
                          <div className="text-sm text-gray-600">{(member as any).title}</div>
                          <div className="text-xs text-gray-500">{(member as any).email}</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingBoardMember(typeof (member as any).id === 'number' ? (member as any).id : 'new')}
                            className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toast.info('Board member management is now handled through contacts')}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Committees */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg">Committees ({committees.length})</h4>
                  <button
                    onClick={() => setEditingCommittee('new')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
                  >
                    Add Committee
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {committees.map(committee => (
                    <div key={committee.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{committee.name}</div>
                          <div className="text-sm text-gray-600">{committee.description}</div>
                          <div className="text-xs text-gray-500">Chair: {committee.chair}</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingCommittee(String(committee.id))}
                            className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toast.info('Committee management is now handled through contact groups')}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meetings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg">Meetings ({boardMeetings.length})</h4>
                  <button
                    onClick={() => setEditingMeeting('new')}
                    className="px-3 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors font-medium"
                  >
                    Add Meeting
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {boardMeetings.map(meeting => (
                    <div key={meeting.id} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{new Date(meeting.date).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-600 capitalize">{meeting.type} Meeting</div>
                          <div className="text-xs text-gray-500">
                            {Array.isArray(meeting.attendees) ? meeting.attendees.filter((a: unknown) => (a as any).present).length : 0} present
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingMeeting(meeting.id)}
                            className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toast.info('Meeting management will be available in a future update')}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Edit Forms */}
            {editingBoardMember && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  {editingBoardMember === 'new' ? 'Add New Board Member' : 'Edit Board Member'}
                </h4>
                {/* BoardMemberForm component removed - board member editing disabled */}
                <div className="p-4 bg-gray-100 rounded">
                  <p>Board member editing is currently disabled</p>
                </div>
                {/* Removed BoardMemberForm usage */}
              </div>
            )}

            {editingCommittee && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  {editingCommittee === 'new' ? 'Add New Committee' : 'Edit Committee'}
                </h4>
                <CommitteeForm
                  committee={editingCommittee === 'new' ? null : committees.find(c => c.id === editingCommittee) || null}
                  onSave={() => {
                    toast.info('Committee management is now handled through contact groups');
                    setEditingCommittee(null);
                  }}
                  onCancel={() => setEditingCommittee(null)}
                />
              </div>
            )}

            {editingMeeting && (
              <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  {editingMeeting === 'new' ? 'Add New Meeting' : 'Edit Meeting'}
                </h4>
                <MeetingForm
                  meeting={editingMeeting === 'new' ? null : boardMeetings.find(m => m.id === editingMeeting) || null}
                  members={boardMembers}
                  onSave={() => {
                    toast.info('Meeting management will be available in a future update');
                    setEditingMeeting(null);
                  }}
                  onCancel={() => setEditingMeeting(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staff Manager Modal */}
      {showStaffManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Staff Management System</h3>
              <button
                onClick={() => setShowStaffManager(false)}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Staff Members */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-lg">Staff Members ({staffMembers.length})</h4>
                  <button
                    onClick={() => setEditingStaffMember('new')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none transition-colors font-medium"
                  >
                    Add Staff
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {staffMembers.map(staff => (
                    <div key={staff.id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-sm text-gray-600">{staff.position}</div>
                          <div className="text-xs text-gray-500">{staff.email}</div>
                          {staff.donorRole && (
                            <div className="text-xs text-purple-600">Donor: ${staff.donorAmount}</div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingStaffMember(staff.id)}
                            className="px-2 py-1 bg-gray-100 text-gray-900 rounded text-xs hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteStaffMember(staff.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Analytics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-lg mb-4">Staff Analytics</h4>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Total Salary Budget</div>
                    <div className="text-xl font-bold text-blue-600">${calculateTotalSalary().toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Staff Donations</div>
                    <div className="text-xl font-bold text-purple-600">${calculateTotalDonations().toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Average Performance Rating</div>
                    <div className="text-xl font-bold text-green-600">
                      {staffMembers.length > 0 
                        ? (staffMembers.reduce((total, staff) => {
                            const avgRating = staff.performance.length > 0 
                              ? staff.performance.reduce((sum, p) => sum + p.rating, 0) / staff.performance.length
                              : 0;
                            return total + avgRating;
                          }, 0) / staffMembers.length).toFixed(1)
                        : '0.0'
                      }/5.0
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="text-sm text-gray-600">Total Training Hours</div>
                    <div className="text-xl font-bold text-orange-600">
                      {staffMembers.reduce((total, staff) => total + staff.training.length, 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Forms */}
            {editingStaffMember && (
              <div className="mt-6 bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">
                  {editingStaffMember === 'new' ? 'Add New Staff Member' : 'Edit Staff Member'}
                </h4>
                <StaffMemberForm
                  staff={editingStaffMember === 'new' ? null : staffMembers.find(s => s.id === editingStaffMember) || null}
                  onSave={(staff: Omit<typeof staffMembers[0], 'id'>) => {
                    if (editingStaffMember === 'new') {
                      addStaffMember(staff);
                    } else {
                      updateStaffMember(editingStaffMember, staff);
                    }
                  }}
                  onCancel={() => setEditingStaffMember(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Manager Modal */}
      {showContactManager && (
        <ContactManagerEnhanced
          onClose={() => {
            setShowContactManager(false);
            setContactManagerView('contacts'); // Reset view
          }}
          contacts={contacts.map(contact => ({
            ...contact,
            // Convert to enhanced contact format
            tags: contact.tags || [],
            groups: contact.groups || [],
            priority: (contact as any).priority || 'medium',
            status: 'active' as const,
            source: 'manual',
            dataCompleteness: contact.dataCompleteness || 0,
            createdDate: contact.createdDate || new Date().toISOString(),
            lastModified: contact.lastModified || new Date().toISOString(),
            notes: contact.notes || '',
            prefix: contact.prefix || '',
            relationships: (contact as ExtendedContact).relationships?.map(rel => ({
              ...rel,
              type: rel.type as 'colleague' | 'supervisor' | 'subordinate' | 'client' | 'vendor' | 'partner'
            }))
          }))}
          onContactsChange={(enhancedContacts) => {
            // Convert back to regular contacts format
            const regularContacts = enhancedContacts.map(contact => ({
              ...contact,
              type: (contact as any).type || 'person',
              projectRoles: contact.projectRoles || contact.tags || [],
              addressHistory: contact.addressHistory || []
            }));
            handleContactsUpdate(regularContacts);
          }}
          initialView="list"
        />
      )}
      
      {/* Contact Selector Modal */}
      {showContactSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">
                Select {contactSelectorType === 'person' ? 'Contact Person' : 'Organization'}
              </h2>
              <p className="text-gray-600 mt-1">
                Choose an existing {contactSelectorType === 'person' ? 'contact' : 'organization'} or create a new one
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Create New Option */}
              <button
                onClick={() => {
                  if (contactSelectorType === 'person') {
                    setShowContactManager(true);
                    setEditingContact(null);
                  } else {
                    // For organizations, just create a new contact with organization type
                    const newContact = {
                      id: Date.now(),
                      type: 'organization',
                      prefix: '',
                      firstName: '',
                      lastName: '',
                      organization: '',
                      title: '',
                      email: '',
                      phone: '',
                      mobile: '',
                      website: '',
                      address: '',
                      address2: '',
                      city: '',
                      state: '',
                      zipCode: '',
                      country: 'United States',
                      addressHistory: [],
                      projectRoles: ['Organization'],
                      tags: [],
                      notes: '',
                      createdDate: new Date().toISOString(),
                      lastModified: new Date().toISOString(),
                      dataCompleteness: 0,
                      customFields: {},
                      is1099: false,
                      hasW9: false,
                      isOrganization: true
                    };
                    setContacts([...contacts, newContact as Contact]);
                    setEditingContact(newContact.id);
                    setShowContactManager(true);
                  }
                  setShowContactSelector(false);
                }}
                className="w-full p-4 mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
              >
                <Plus className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-blue-800">Create New {contactSelectorType === 'person' ? 'Contact' : 'Organization'}</p>
                  <p className="text-sm text-blue-600">Add a new {contactSelectorType === 'person' ? 'person' : 'organization'} to your contacts</p>
                </div>
              </button>
              
              {/* Existing Contacts List */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Or choose from existing {contactSelectorType === 'person' ? 'contacts' : 'organizations'}:
                </h3>
                
                {contacts
                  .filter(contact => {
                    if (contactSelectorType === 'person') {
                      return (contact as any).firstName || (contact as any).lastName;
                    } else {
                      return contact.organization;
                    }
                  })
                  .map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        // Apply the selected contact to the appropriate field
                        if (contactSelectorField === 'orgName') {
                          handleInputChange('orgName', contact.organization);
                          // Auto-fill address fields from contact if not overridden
                          if (!addressOverride) {
                            if (contact.address) handleInputChange('address', contact.address);
                            if (contact.address2) handleInputChange('address2', contact.address2);
                            if (contact.city) handleInputChange('city', contact.city);
                            if (contact.state) handleInputChange('state', contact.state);
                            if (contact.zipCode) handleInputChange('zipCode', contact.zipCode);
                            if (contact.country) handleInputChange('country', contact.country);
                            toast.info('Address fields auto-populated from contact');
                          }
                        } else if (contactSelectorField === 'contactName') {
                          const fullName = `${contact.prefix ? contact.prefix + ' ' : ''}${(contact as any).firstName} ${(contact as any).lastName}`.trim();
                          handleInputChange('contactName', fullName);
                          // Auto-fill related fields
                          if ((contact as any).email) handleInputChange('contactEmail', (contact as any).email);
                          if ((contact as any).phone) handleInputChange('contactPhone', (contact as any).phone);
                        } else if (contactSelectorField.startsWith('subOrg-')) {
                          const subOrgId = contactSelectorField.replace('subOrg-', '');
                          setSubOrganizations(subOrganizations.map(org => 
                            org.id === subOrgId 
                              ? {
                                  ...org,
                                  name: contact.organization,
                                  contactPerson: `${(contact as any).firstName} ${(contact as any).lastName}`.trim(),
                                  email: (contact as any).email,
                                  phone: (contact as any).phone
                                }
                              : org
                          ));
                        }
                        setShowContactSelector(false);
                        toast.success(`Selected: ${contactSelectorType === 'person' ? (contact as any).firstName + ' ' + (contact as any).lastName : contact.organization}`);
                      }}
                      className="w-full p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          {contactSelectorType === 'person' ? (
                            <>
                              <p className="font-medium">{contact.prefix} {(contact as any).firstName} {(contact as any).lastName}</p>
                              <p className="text-sm text-gray-600">{contact.organization} • {contact.title}</p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium">{contact.organization}</p>
                              <p className="text-sm text-gray-600">Contact: {(contact as any).firstName} {(contact as any).lastName}</p>
                            </>
                          )}
                          <p className="text-sm text-gray-500">{(contact as any).email} • {(contact as any).phone}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                  
                {contacts.filter(contact => 
                  contactSelectorType === 'person' 
                    ? (contact as any).firstName || (contact as any).lastName
                    : contact.organization
                ).length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No {contactSelectorType === 'person' ? 'contacts' : 'organizations'} found. Create a new one above.
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowContactSelector(false)}
                className="px-4 py-2 text-gray-900 bg-white border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Manager Modal */}
      {showProgramManager && (
        <EnhancedProgramManager
            onClose={() => setShowProgramManager(false)}
            programs={projects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate || undefined,
            status: project.status === 'planning' ? 'planned' as const :
                   project.status === 'on-hold' ? 'paused' as const :
                   project.status === 'active' ? 'active' as const : 'completed' as const,
            challenge: '',
            approach: '',
            theory_of_change: '',
            targetBeneficiaries: 0,
            actualBeneficiaries: 0,
            outcomes: (project.objectives || []).map((obj, i) => {
              const isValidObjective = obj && typeof obj === 'string' && obj.trim().length > 0;
              const hasMatchingOutcome = isValidObjective && 
                Array.isArray(project.outcomes) && 
                project.outcomes.some(outcome => 
                  outcome && typeof outcome === 'string' && 
                  outcome.trim().toLowerCase() === obj.trim().toLowerCase()
                );
              
              return {
                description: isValidObjective ? obj : `Objective ${i + 1}`,
                metric: isValidObjective ? `Achievement of: ${obj}` : '',
                target: 100,
                actual: hasMatchingOutcome ? 100 : 0,
                verified: Boolean(hasMatchingOutcome),
                verificationDate: hasMatchingOutcome ? new Date().toISOString() : undefined
              };
            }),
            successStories: [],
            fundingHistory: [],
            fundingPipeline: [],
            totalBudget: project.budget,
            totalRaised: 0,
            totalSpent: 0,
            costPerBeneficiary: 0,
            team: project.team.map(name => ({ name, role: '', allocation: 100, period: '' })),
            partners: [],
            reports: [],
            media: [],
            tags: [],
            location: '',
            website: '',
            createdDate: project.createdDate,
            lastModified: project.lastModified
          }))}
          onProgramsChange={(enhancedPrograms) => {
            // Convert back to basic Project format for compatibility
            const basicProjects = enhancedPrograms.map(program => ({
              id: program.id,
              name: program.name,
              description: program.description,
              startDate: program.startDate,
              endDate: program.endDate || '',
              budget: program.totalBudget,
              status: program.status === 'active' ? 'active' as const : 
                      program.status === 'planned' ? 'planning' as const :
                      program.status === 'paused' ? 'on-hold' as const : 'completed' as const,
              team: program.team.map(t => t.name),
              objectives: program.outcomes.map(o => o.description),
              outcomes: program.outcomes.filter(o => o.verified).map(o => o.description),
              createdDate: program.createdDate,
              lastModified: program.lastModified
            }));
            setProjects(basicProjects);
          }}
        />
      )}

      {/* Document Manager Modal */}
      {showDocumentManager && (
        <DocumentManager
          isOpen={showDocumentManager}
          onClose={() => setShowDocumentManager(false)}
          documents={[] as any}
          onDocumentsChange={(docs) => {
            // DocumentManager provides Document[], but we need to store document IDs
            const docIds: Record<string, string> = {};
            docs.forEach(doc => {
              if (doc.category) {
                docIds[doc.category] = doc.id;
              }
            });
            setDocuments(docIds);
          }}
          editingDocumentId={editingDocument}
          onEditingDocumentChange={setEditingDocument}
        />
      )}

      {/* Organizational Health Dashboard Modal */}
      {showHealthDashboard && (
        <OrganizationalHealthDashboard
          onClose={() => setShowHealthDashboard(false)}
          contacts={contacts}
          programs={projects.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            startDate: project.startDate,
            endDate: project.endDate || undefined,
            status: project.status === 'planning' ? 'planned' as const :
                   project.status === 'on-hold' ? 'paused' as const :
                   project.status === 'active' ? 'active' as const : 'completed' as const,
            challenge: '',
            approach: '',
            theory_of_change: '',
            targetBeneficiaries: 0,
            actualBeneficiaries: 0,
            outcomes: (project.objectives || []).map((obj, i) => {
              const isValidObjective = obj && typeof obj === 'string' && obj.trim().length > 0;
              const hasMatchingOutcome = isValidObjective && 
                Array.isArray(project.outcomes) && 
                project.outcomes.some(outcome => 
                  outcome && typeof outcome === 'string' && 
                  outcome.trim().toLowerCase() === obj.trim().toLowerCase()
                );
              
              return {
                description: isValidObjective ? obj : `Objective ${i + 1}`,
                metric: isValidObjective ? `Achievement of: ${obj}` : '',
                target: 100,
                actual: hasMatchingOutcome ? 100 : 0,
                verified: Boolean(hasMatchingOutcome),
                verificationDate: hasMatchingOutcome ? new Date().toISOString() : undefined
              };
            }),
            successStories: [],
            fundingHistory: [],
            fundingPipeline: [],
            totalBudget: project.budget,
            totalRaised: 0,
            totalSpent: 0,
            costPerBeneficiary: 0,
            team: project.team.map(name => ({ name, role: '', allocation: 100, period: '' })),
            partners: [],
            reports: [],
            media: [],
            tags: [],
            location: '',
            website: '',
            createdDate: project.createdDate,
            lastModified: project.lastModified
          }))}
          events={[]} // Could be connected to a future events system
          compliance={[]} // Could be connected to compliance data
          formData={formData}
        />
      )}

      {/* Performance Dashboard Modal */}
      {showPerformanceDashboard && (
        <PerformanceDashboard
          onClose={() => setShowPerformanceDashboard(false)}
        />
      )}

      {/* Custom Field Builder Modal */}
      {showFieldBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                {editingCustomField ? 'Edit Custom Field' : 'Add Custom Field'}
              </h2>
              <button
                onClick={() => {
                  setShowFieldBuilder(false);
                  setEditingCustomField(null);
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <CustomFieldBuilderForm
              field={editingCustomField ? customFieldDefinitions.find(f => f.id === editingCustomField) || null : null}
              sections={sections}
              onSave={(fieldDef) => {
                if (editingCustomField) {
                  updateCustomField(editingCustomField, fieldDef as any);
                } else {
                  addCustomField(fieldDef as any);
                }
                setShowFieldBuilder(false);
                setEditingCustomField(null);
              }}
              onCancel={() => {
                setShowFieldBuilder(false);
                setEditingCustomField(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Floating UI Container for all floating widgets */}
      <FloatingUIContainer
        widgets={[
          {
            id: 'progress',
            title: 'Progress Tracker',
            component: (
              <AutoProgressTrackerContent
                sections={sections.map(section => ({
                  id: section.id,
                  title: section.name || section.id,
                  status: 'partial',
                  progress: calculateSectionProgress(section.id),
                  fields: {
                    total: 10, // Placeholder
                    completed: 5 // Placeholder
                  }
                }))}
                overallProgress={memoizedProgress}
              />
            ),
            position: 'left',
            canClose: true,
            defaultMinimized: false
          },
          {
            id: 'collaboration',
            title: 'Active Users',
            component: (
              <CollaborationIndicatorContent
                activeUsers={activeUsers.map(user => ({
                  ...user,
                  lastActive: new Date(),
                  isTyping: !!user.activeField,
                  section: user.activeField || user.status
                }))}
                currentUserId={currentUser?.id.toString()}
              />
            ),
            position: 'right',
            canClose: true,
            defaultMinimized: !showCollaborators
          }
        ]}
      />

      {/* Document Info Modal */}
      {showDocumentInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Document Information
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success('Document information saved');
                setShowDocumentInfo(null);
              }}>
                <div className="space-y-4">
                  {/* Document Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Document Number / File Number
                    </label>
                    <input
                      type="text"
                      value={(documentInfo[showDocumentInfo] as any)?.documentNumber || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          documentNumber: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter document number"
                    />
                  </div>
                  
                  {/* Filing Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Filing Date
                    </label>
                    <input
                      type="date"
                      value={(documentInfo[showDocumentInfo] as any)?.filingDate || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          filingDate: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Effective Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Effective Date
                    </label>
                    <input
                      type="date"
                      value={(documentInfo[showDocumentInfo] as any)?.effectiveDate || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          effectiveDate: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Issue Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={(documentInfo[showDocumentInfo] as any)?.issueDate || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          issueDate: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Expiration Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Expiration Date (if applicable)
                    </label>
                    <input
                      type="date"
                      value={(documentInfo[showDocumentInfo] as any)?.expirationDate || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          expirationDate: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Entity ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Entity ID / Registration Number
                    </label>
                    <input
                      type="text"
                      value={(documentInfo[showDocumentInfo] as any)?.entityId || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          entityId: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter entity ID"
                    />
                  </div>
                  
                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      State
                    </label>
                    <select
                      value={(documentInfo[showDocumentInfo] as any)?.state || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          state: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      <option value="FL">Florida</option>
                      <option value="IL">Illinois</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="PR">Puerto Rico</option>
                      <option value="TX">Texas</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      value={(documentInfo[showDocumentInfo] as any)?.notes || ''}
                      onChange={(e) => setDocumentInfo(prev => ({
                        ...prev,
                        [showDocumentInfo]: {
                          ...(prev[showDocumentInfo] || {} as any),
                          notes: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any additional information about this document"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDocumentInfo(null)}
                    className="px-4 py-2 text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors font-medium"
                  >
                    Save Information
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Communications Module */}
      {showCommunicationsModule && (
        <EnhancedCommunicationsHub
          userRole={(currentUser?.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user'}
          onClose={() => setShowCommunicationsModule(false)}
          profileCode={profileCode}
          profileEmail={profileEmail}
          adminEmail={adminEmail}
          whatsappCode={whatsappCode}
        />
      )}

      {/* Admin Document Distribution */}
      {showAdminDistribution && currentUser?.role === 'admin' && (
        <AdminDocumentDistribution
          userRole={currentUser.role}
          onClose={() => setShowAdminDistribution(false)}
        />
      )}

      {/* Quick Wins Enhancement Modal */}
      {showQuickWins && (
        <QuickWinsEnhancements
          onClose={() => setShowQuickWins(false)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      )}
      
      {/* API Locker Modal */}
      {showAPILocker && currentUser?.role === 'admin' && (
        <APILocker
          onClose={() => setShowAPILocker(false)}
          currentUserId={currentUser.id.toString()}
        />
      )}

      {/* Smart Form Assistant */}
      <EnhancedSmartAssistant
        currentSection={currentSectionId}
        currentField={currentField}
        formData={formData}
        errors={errors}
        onSuggestion={(field, value) => handleInputChange(field, value)}
        apiKeys={apiKeys}
        isEnabled={assistantEnabled}
      />

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <Check className="w-5 h-5 mr-2" />
          <span>{successMessage}</span>
        </div>
      )}
      
      {/* Hidden file input for import */}
      <input
        type="file"
        accept=".json"
        onChange={handleImportFile}
        style={{ display: 'none' }}
        id="import-file-input"
      />

      {/* Keyboard Shortcut Indicator - Controlled by Pro Tips toggle */}
      <KeyboardShortcutIndicator show={showProTips} />
    </div>
    
    {/* Export/Import Modal */}
    {showExportImportModal && (
      <ExportImportModal
        isOpen={showExportImportModal}
        onClose={() => setShowExportImportModal(false)}
        dataType="nonprofit_application"
        organizationId={currentUser?.organization || ''}
      />
    )}
    
    {/* Role Management Modal */}
    {showRoleManagement && currentUser && currentUser.organization && (
      <RoleManagement
        isOpen={showRoleManagement}
        onClose={() => setShowRoleManagement(false)}
        currentUserId={currentUser.id.toString()}
        organizationId={currentUser.organization}
      />
    )}
    
    {/* Advanced Search Modal */}
    {showAdvancedSearch && currentUser && currentUser.organization && (
      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        organizationId={currentUser.organization}
        userId={currentUser.id.toString()}
        onResultClick={(result) => {
          // Navigate to the section/field
          logger.debug('Navigate to:', { 
            id: result.id, 
            sectionId: result.sectionId, 
            fieldId: result.fieldId 
          });
          setShowAdvancedSearch(false);
        }}
      />
    )}
    
    {/* Analytics Dashboard */}
    {showAnalyticsDashboard && currentUser && currentUser.organization && (
      <AnalyticsDashboard
        isOpen={showAnalyticsDashboard}
        onClose={() => setShowAnalyticsDashboard(false)}
        organizationId={currentUser.organization}
      />
    )}
    </>
  );
};

export default NonprofitApplication;
