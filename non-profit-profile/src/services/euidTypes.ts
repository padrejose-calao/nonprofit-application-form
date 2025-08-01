/**
 * EUID System Type Definitions
 * Centralized location for all EUID-related types to avoid circular dependencies
 */

export enum EntityType {
  COMPANY = 'C',
  INDIVIDUAL = 'I',
  DOCUMENT = 'D',
  GOVERNMENT = 'G',  // Government entities (GFL, GGA, etc.)
  REPORT = 'R',
  NONPROFIT = 'N',
  PROJECT = 'P',
  TASK = 'T',
  EVENT = 'E',
  LOCATION = 'L',
  ASSET = 'A',
  BATCH = 'B',
  QUALITY = 'Q',
  MESSAGE = 'M',
  EXTERNAL = 'X',
  PUBLIC_SERVANT = 'PS',
  ELECTED_OFFICIAL = 'EO',
  QUASI_GOVERNMENT = 'QG',
  AI_ASSISTANT = 'AI',  // AI Assistant entities
  API = 'API',          // API entities
  JANE_DOE = 'JAD',     // Jane Doe for corrupted companies
  JOHN_DOE = 'JOD'      // John Doe for corrupted individuals
}

export enum EntityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  MERGED = 'merged',
  HISTORICAL = 'historical',
  CORRUPTED = 'corrupted',
  RETIRED = 'retired'
}

export enum AccessLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  VIP = 'vip'
}

export enum RelationshipType {
  // Organizational
  PARENT_ORG = 'parent_org',
  SUBSIDIARY = 'subsidiary',
  PARTNER = 'partner',
  AFFILIATE = 'affiliate',
  PARENT = 'parent',
  CHILD = 'child',
  
  // People
  CEO = 'ceo',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VOLUNTEER = 'volunteer',
  BOARD_MEMBER = 'board_member',
  BOARD = 'board',
  DONOR = 'donor',
  BENEFICIARY = 'beneficiary',
  
  // Documents
  CREATOR = 'creator',
  OWNER = 'owner',
  REVIEWER = 'reviewer',
  APPROVER = 'approver',
  
  // General
  RELATED_TO = 'related_to',
  REFERENCES = 'references',
  DEPENDS_ON = 'depends_on',
  REPLACES = 'replaces',
  
  // AI
  CREATED_BY_AI = 'created_by_ai',
  PROCESSED_BY_AI = 'processed_by_ai',
  REVIEWED_BY_AI = 'reviewed_by_ai',
  
  // API
  DATA_SOURCE = 'data_source',
  DATA_CONSUMER = 'data_consumer'
}

export enum GovernmentState {
  FED = 'FED',
  PR = 'PR',
  FL = 'FL',
  NY = 'NY',
  CA = 'CA',
  TX = 'TX',
  IL = 'IL',
  PA = 'PA',
  OH = 'OH',
  GA = 'GA',
  NC = 'NC',
  MI = 'MI'
}

export interface EUID {
  full: string;
  type: EntityType;
  number: string;
  relationships: Array<{
    targetEUID: string;
    type: RelationshipType;
    startDate?: string;
    endDate?: string;
  }>;
  status: EntityStatus;
  accessLevel?: AccessLevel;
  version?: number;
  metadata: {
    createdAt: string;
    createdBy: string;
    modifiedAt?: string;
    modifiedBy?: string;
    externalRef?: string;
  };
}

export interface EUIDValidation {
  isValid: boolean;
  errors: string[];
  parsed?: Partial<EUID>;
}