import React, { useState, useMemo } from 'react';
import {
  FileText, Upload, Download, Eye, Check, Clock, AlertCircle,
  Building2, CircleDollarSign, Shield, Users, Briefcase,
  ClipboardList, Globe, Search, Filter, RefreshCw, Calendar,
  ChevronDown, ChevronRight, FolderOpen, File, ExternalLink
} from 'lucide-react';
// import DocumentUploadField from './DocumentUploadField';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

interface DocumentCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  documents: DocumentField[];
}

interface DocumentField {
  id: string;
  name: string;
  description?: string;
  required?: boolean;
  category: string;
  sectionId: string;
  uploadStatus?: 'uploaded' | 'pending' | 'not-uploaded';
  file?: {
    url: string;
    name: string;
    uploadDate: Date;
    size: number;
  };
}

interface OrganizationalDocumentsProps {
  documents: Record<string, unknown>;
  onDocumentUpload: (fieldId: string, file: File) => Promise<void>;
  onDocumentView: (fieldId: string) => void;
  onDocumentDownload: (fieldId: string) => void;
  onDocumentDelete: (fieldId: string) => void;
  className?: string;
}

const OrganizationalDocuments: React.FC<OrganizationalDocumentsProps> = ({
  documents,
  onDocumentUpload,
  onDocumentView,
  onDocumentDownload,
  onDocumentDelete,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'entity': true,
    'financial': false,
    'governance': false,
    'management': false,
    'policy': false,
    'program': false,
    'compliance': false,
    'communications': false,
    'digital': false
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'uploaded' | 'pending' | 'not-uploaded'>('all');
  const [loading, setLoading] = useState(false);

  // Document categories configuration
  const documentCategories: DocumentCategory[] = useMemo(() => [
    {
      id: 'entity',
      title: 'Entity Documents (Core Legal)',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Foundational legal documents for your organization',
      documents: [
        {
          id: 'irs501c3Letter',
          name: 'IRS 501(c)(3) Determination Letter',
          required: true,
          category: 'entity',
          sectionId: 'entity-documents'
        },
        {
          id: 'w9Form',
          name: 'W-9 Form',
          required: true,
          category: 'entity',
          sectionId: 'entity-documents'
        },
        {
          id: 'articlesOfIncorporation',
          name: 'Articles of Incorporation / Certificate of Formation',
          required: true,
          category: 'entity',
          sectionId: 'entity-documents'
        },
        {
          id: 'bylaws',
          name: 'Bylaws',
          required: true,
          category: 'entity',
          sectionId: 'entity-documents'
        },
        {
          id: 'goodStanding',
          name: 'Certificate of Good Standing / Status',
          required: false,
          category: 'entity',
          sectionId: 'entity-documents'
        },
        {
          id: 'annualReport',
          name: 'Annual Report (Latest)',
          required: false,
          category: 'entity',
          sectionId: 'entity-documents'
        },
        {
          id: 'charitableRegistration',
          name: 'State Charitable Registration',
          required: false,
          category: 'entity',
          sectionId: 'entity-documents'
        }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Documents',
      icon: <CircleDollarSign className="w-5 h-5" />,
      description: 'Financial statements, budgets, and tax documents',
      documents: [
        {
          id: 'form990',
          name: 'Form 990 (Last 3 Years)',
          required: true,
          category: 'financial',
          sectionId: 'financial'
        },
        {
          id: 'financialStatements',
          name: 'Audited Financial Statements',
          required: true,
          category: 'financial',
          sectionId: 'financial'
        },
        {
          id: 'annualBudget',
          name: 'Annual Budget',
          required: true,
          category: 'financial',
          sectionId: 'financial'
        },
        {
          id: 'auditReport',
          name: 'Audit Report',
          required: false,
          category: 'financial',
          sectionId: 'financial'
        },
        {
          id: 'taxReturns',
          name: 'Tax Returns',
          required: false,
          category: 'financial',
          sectionId: 'financial'
        },
        {
          id: 'grantReports',
          name: 'Grant Reports',
          required: false,
          category: 'financial',
          sectionId: 'financial'
        }
      ]
    },
    {
      id: 'governance',
      title: 'Governance Documents',
      icon: <Shield className="w-5 h-5" />,
      description: 'Board and committee documentation',
      documents: [
        {
          id: 'boardMeetingMinutes',
          name: 'Board Meeting Minutes',
          required: false,
          category: 'governance',
          sectionId: 'governance'
        },
        {
          id: 'committeeBylaws',
          name: 'Committee Bylaws/Policies',
          required: false,
          category: 'governance',
          sectionId: 'governance'
        },
        {
          id: 'boardCompensationPolicy',
          name: 'Board Compensation Policy',
          required: false,
          category: 'governance',
          sectionId: 'governance'
        },
        {
          id: 'boardElectionProcess',
          name: 'Board Election Process Documentation',
          required: false,
          category: 'governance',
          sectionId: 'governance'
        },
        {
          id: 'boardOrientationMaterials',
          name: 'Board Orientation Materials',
          required: false,
          category: 'governance',
          sectionId: 'governance'
        },
        {
          id: 'boardEvaluationForms',
          name: 'Board Evaluation Forms',
          required: false,
          category: 'governance',
          sectionId: 'governance'
        },
        {
          id: 'fundraiserAuthorization',
          name: 'Letter Authorizing Fundraisers',
          required: false,
          category: 'governance',
          sectionId: 'governance'
        }
      ]
    },
    {
      id: 'management',
      title: 'Management Documents',
      icon: <Users className="w-5 h-5" />,
      description: 'Organizational structure and staff documentation',
      documents: [
        {
          id: 'organizationalChart',
          name: 'Organizational Chart',
          required: false,
          category: 'management',
          sectionId: 'management'
        },
        {
          id: 'jobDescriptions',
          name: 'Job Descriptions',
          required: false,
          category: 'management',
          sectionId: 'management'
        },
        {
          id: 'employeeHandbook',
          name: 'Employee Handbook',
          required: false,
          category: 'management',
          sectionId: 'management'
        },
        {
          id: 'performanceEvaluationForms',
          name: 'Performance Evaluation Forms',
          required: false,
          category: 'management',
          sectionId: 'management'
        },
        {
          id: 'trainingProgramDocs',
          name: 'Training Program Documentation',
          required: false,
          category: 'management',
          sectionId: 'management'
        },
        {
          id: 'managementReport',
          name: 'Management Report',
          required: false,
          category: 'management',
          sectionId: 'management'
        }
      ]
    },
    {
      id: 'policy',
      title: 'Policy Documents',
      icon: <ClipboardList className="w-5 h-5" />,
      description: 'Organizational policies and procedures',
      documents: [
        {
          id: 'directorsOfficersPolicy',
          name: 'Directors and Officers Policy',
          required: true,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'nonDiscriminationPolicy',
          name: 'Non-Discrimination Policy',
          required: true,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'documentDestructionPolicy',
          name: 'Document Destruction Policy',
          required: true,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'whistleblowerPolicy',
          name: 'Whistleblower Policy',
          required: false,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'policyProceduresManual',
          name: 'Policy and Procedures Manual',
          required: false,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'compensationPolicy',
          name: 'Compensation Policy',
          required: false,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'benefitsPolicy',
          name: 'Benefits Policy',
          required: false,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'remoteWorkPolicy',
          name: 'Remote Work Policy',
          required: false,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'safetyPolicy',
          name: 'Safety Policy',
          required: false,
          category: 'policy',
          sectionId: 'management'
        },
        {
          id: 'emergencyProcedures',
          name: 'Emergency Procedures',
          required: false,
          category: 'policy',
          sectionId: 'management'
        }
      ]
    },
    {
      id: 'program',
      title: 'Program Documents',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Program reports and evaluations',
      documents: [
        {
          id: 'programReports',
          name: 'Program Reports',
          required: false,
          category: 'program',
          sectionId: 'programs'
        },
        {
          id: 'programEvaluationResults',
          name: 'Program Evaluation Results',
          required: false,
          category: 'program',
          sectionId: 'programs'
        },
        {
          id: 'impactReports',
          name: 'Impact Reports',
          required: false,
          category: 'program',
          sectionId: 'impact'
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance Documents',
      icon: <Shield className="w-5 h-5" />,
      description: 'Insurance, permits, and regulatory compliance',
      documents: [
        {
          id: 'insuranceCertificates',
          name: 'Insurance Certificates',
          required: true,
          category: 'compliance',
          sectionId: 'compliance'
        },
        {
          id: 'permitsLicenses',
          name: 'Permits and Licenses',
          required: false,
          category: 'compliance',
          sectionId: 'compliance'
        },
        {
          id: 'stateCharitableRegistrations',
          name: 'State Charitable Registration (by state)',
          required: false,
          category: 'compliance',
          sectionId: 'compliance'
        },
        {
          id: 'complianceReports',
          name: 'Compliance Reports',
          required: false,
          category: 'compliance',
          sectionId: 'compliance'
        }
      ]
    },
    {
      id: 'communications',
      title: 'Communications/Brand',
      icon: <Globe className="w-5 h-5" />,
      description: 'Marketing and brand materials',
      documents: [
        {
          id: 'communicationsPlan',
          name: 'Communications Plan',
          required: false,
          category: 'communications',
          sectionId: 'brand'
        },
        {
          id: 'brandGuidelines',
          name: 'Brand Guidelines Document',
          required: false,
          category: 'communications',
          sectionId: 'brand'
        },
        {
          id: 'marketingMaterials',
          name: 'Marketing Materials',
          required: false,
          category: 'communications',
          sectionId: 'brand'
        }
      ]
    },
    {
      id: 'digital',
      title: 'Digital Assets',
      icon: <Globe className="w-5 h-5" />,
      description: 'Logos, images, and media files',
      documents: [
        {
          id: 'organizationLogo',
          name: 'Organization Logo',
          required: false,
          category: 'digital',
          sectionId: 'digital-assets'
        },
        {
          id: 'bannerImages',
          name: 'Banner Images',
          required: false,
          category: 'digital',
          sectionId: 'digital-assets'
        },
        {
          id: 'videosMedia',
          name: 'Videos/Media',
          required: false,
          category: 'digital',
          sectionId: 'digital-assets'
        }
      ]
    }
  ], []);

  // Get document status
  const getDocumentStatus = (fieldId: string): 'uploaded' | 'pending' | 'not-uploaded' => {
    if ((documents[fieldId] as any)?.uploaded) return 'uploaded';
    if ((documents[fieldId] as any)?.pending) return 'pending';
    return 'not-uploaded';
  };

  // Filter documents based on search and status
  const filteredCategories = documentCategories.map(category => ({
    ...category,
    documents: category.documents.filter(doc => {
      const matchesSearch = (doc.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const status = getDocumentStatus(doc.id);
      const matchesStatus = filterStatus === 'all' || status === filterStatus;
      return matchesSearch && matchesStatus;
    })
  })).filter(category => category.documents.length > 0);

  // Calculate statistics
  const statistics = useMemo(() => {
    let total = 0;
    let uploaded = 0;
    let required = 0;
    let requiredUploaded = 0;

    documentCategories.forEach(category => {
      category.documents.forEach(doc => {
        total++;
        if (doc.required) required++;
        if (getDocumentStatus(doc.id) === 'uploaded') {
          uploaded++;
          if (doc.required) requiredUploaded++;
        }
      });
    });

    return {
      total,
      uploaded,
      required,
      requiredUploaded,
      completionPercentage: total > 0 ? Math.round((uploaded / total) * 100) : 0,
      requiredCompletionPercentage: required > 0 ? Math.round((requiredUploaded / required) * 100) : 0
    };
  }, [documentCategories, documents]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle document actions
  const handleUpload = async (fieldId: string, file: File) => {
    try {
      setLoading(true);
      await onDocumentUpload(fieldId, file);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  // Get status icon
  const getStatusIcon = (status: 'uploaded' | 'pending' | 'not-uploaded') => {
    switch (status) {
      case 'uploaded':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // Render document item
  const renderDocumentItem = (doc: DocumentField) => {
    const status = getDocumentStatus(doc.id);
    const documentData = documents[doc.id];

    return (
      <div key={doc.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex items-center">
            {getStatusIcon(status)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900">
                {doc.name}
                {doc.required && <span className="text-red-500 ml-1">*</span>}
              </h4>
              {status === 'uploaded' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Uploaded
                </span>
              )}
            </div>
            {doc.description && (
              <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
            )}
            {(documentData as any)?.uploadDate && (
              <p className="text-xs text-gray-400 mt-1">
                Uploaded {new Date((documentData as any).uploadDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status === 'uploaded' ? (
            <>
              <button
                onClick={() => onDocumentView(doc.id)}
                className="p-1 text-gray-500 hover:text-blue-600 rounded"
                title="View document"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDocumentDownload(doc.id)}
                className="p-1 text-gray-500 hover:text-green-600 rounded"
                title="Download document"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDocumentDelete(doc.id)}
                className="p-1 text-gray-500 hover:text-red-600 rounded"
                title="Delete document"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </>
          ) : (
            <label className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              Upload
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(doc.id, file);
                }}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`organizational-documents ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Organizational Documents</h2>
        <p className="text-gray-600">
          Central repository for all organizational documents. Upload once, access everywhere.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Uploaded</p>
              <p className="text-2xl font-bold text-green-600">{statistics.uploaded}</p>
            </div>
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Required Complete</p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.requiredUploaded}/{statistics.required}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-2xl font-bold text-purple-600">
                {statistics.completionPercentage}%
              </p>
            </div>
            <div className="w-16 h-16">
              <svg className="transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#9333ea"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${statistics.completionPercentage * 1.76} 176`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'uploaded' | 'pending' | 'not-uploaded')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Documents</option>
            <option value="uploaded">Uploaded</option>
            <option value="pending">Pending</option>
            <option value="not-uploaded">Not Uploaded</option>
          </select>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Document Categories */}
      <div className="space-y-4">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="text-gray-500">{category.icon}</div>
                <div className="text-left">
                  <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {category.documents.filter(d => getDocumentStatus(d.id) === 'uploaded').length}/
                  {category.documents.length} uploaded
                </div>
                {expandedCategories[category.id] ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
            
            {expandedCategories[category.id] && (
              <div className="border-t border-gray-200">
                <div className="p-4 space-y-2">
                  {category.documents.map(doc => renderDocumentItem(doc))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  );
};

export default OrganizationalDocuments;