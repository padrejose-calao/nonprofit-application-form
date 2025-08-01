import { 
  Home, Users, Building2, DollarSign, FileText, Shield, 
  Heart, Target, BarChart3, Network, Award, FolderOpen,
  MapPin, Phone, AlertTriangle, Briefcase, GraduationCap,
  Globe, HelpCircle, Settings, Database, UserPlus, Building,
  Receipt, ShieldCheck, TrendingUp
} from 'lucide-react';

// Configuration for all module headers
export const moduleHeaderConfigs = {
  'basic-info': {
    title: 'Basic Information',
    subtitle: 'Organization identification and contact details',
    icon: Home,
    iconColor: 'text-blue-600',
    sectionId: 'basic-info'
  },
  'organization': {
    title: 'Organization Details',
    subtitle: 'Mission, vision, and organizational structure',
    icon: Building2,
    iconColor: 'text-indigo-600',
    sectionId: 'organization'
  },
  'governance': {
    title: 'Governance',
    subtitle: 'Board members, committees, and meetings',
    icon: Shield,
    iconColor: 'text-purple-600',
    sectionId: 'governance'
  },
  'financial': {
    title: 'Financial Information',
    subtitle: 'Budget, revenue, and financial management',
    icon: DollarSign,
    iconColor: 'text-green-600',
    sectionId: 'financial'
  },
  'programs': {
    title: 'Programs & Services',
    subtitle: 'Your organization\'s programs and initiatives',
    icon: Heart,
    iconColor: 'text-red-600',
    sectionId: 'programs'
  },
  'impact': {
    title: 'Impact & Outcomes',
    subtitle: 'Measurement and reporting of your impact',
    icon: Target,
    iconColor: 'text-orange-600',
    sectionId: 'impact'
  },
  'management': {
    title: 'Management & Operations',
    subtitle: 'Operational structure and management',
    icon: Briefcase,
    iconColor: 'text-gray-600',
    sectionId: 'management'
  },
  'compliance': {
    title: 'Compliance & Legal',
    subtitle: 'Legal compliance and regulatory requirements',
    icon: ShieldCheck,
    iconColor: 'text-red-600',
    sectionId: 'compliance'
  },
  'documents': {
    title: 'Documents',
    subtitle: 'Required documents and attachments',
    icon: FolderOpen,
    iconColor: 'text-yellow-600',
    sectionId: 'documents'
  },
  'references': {
    title: 'References & Networks',
    subtitle: 'Professional references and network affiliations',
    icon: Network,
    iconColor: 'text-teal-600',
    sectionId: 'references'
  },
  'communications': {
    title: 'Communications',
    subtitle: 'Marketing and communication strategies',
    icon: Globe,
    iconColor: 'text-blue-600',
    sectionId: 'communications'
  },
  'technology': {
    title: 'Technology',
    subtitle: 'Technology infrastructure and digital tools',
    icon: Database,
    iconColor: 'text-cyan-600',
    sectionId: 'technology'
  },
  'risk-management': {
    title: 'Risk Management',
    subtitle: 'Risk assessment and mitigation strategies',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    sectionId: 'risk-management'
  },
  'donations': {
    title: 'Donations & Fundraising',
    subtitle: 'Donation management and fundraising activities',
    icon: Receipt,
    iconColor: 'text-green-600',
    sectionId: 'donations'
  },
  'staff-details': {
    title: 'Staff Details',
    subtitle: 'Employee information and organizational chart',
    icon: UserPlus,
    iconColor: 'text-indigo-600',
    sectionId: 'staff-details'
  },
  'board-details': {
    title: 'Board Member Details',
    subtitle: 'Detailed information about board members',
    icon: Users,
    iconColor: 'text-purple-600',
    sectionId: 'board-details'
  },
  'leadership-details': {
    title: 'Leadership Details',
    subtitle: 'Executive leadership and key personnel',
    icon: Award,
    iconColor: 'text-yellow-600',
    sectionId: 'leadership-details'
  },
  'insurance': {
    title: 'Insurance',
    subtitle: 'Insurance policies and coverage',
    icon: ShieldCheck,
    iconColor: 'text-blue-600',
    sectionId: 'insurance'
  },
  'contact': {
    title: 'Contact Information',
    subtitle: 'Primary and additional contact details',
    icon: Phone,
    iconColor: 'text-green-600',
    sectionId: 'contact'
  },
  'other-locations': {
    title: 'Other Locations',
    subtitle: 'Additional office and service locations',
    icon: MapPin,
    iconColor: 'text-red-600',
    sectionId: 'other-locations'
  },
  'narrative': {
    title: 'Narrative Sections',
    subtitle: 'Detailed narrative responses',
    icon: FileText,
    iconColor: 'text-indigo-600',
    sectionId: 'narrative'
  },
  'digital-assets': {
    title: 'Digital Assets',
    subtitle: 'Website, social media, and digital presence',
    icon: Globe,
    iconColor: 'text-cyan-600',
    sectionId: 'digital-assets'
  },
  'additional-info': {
    title: 'Additional Information',
    subtitle: 'Supplementary information and notes',
    icon: HelpCircle,
    iconColor: 'text-gray-600',
    sectionId: 'additional-info'
  }
};

export type ModuleId = keyof typeof moduleHeaderConfigs;