import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ChevronDown, ChevronUp, Check, X, 
  Info, Book, Tag, Filter, Download, Upload,
  RefreshCw, AlertCircle, CheckCircle, Globe,
  FileText, ExternalLink, HelpCircle, Star
} from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

// NTEE Code Structure
interface NTEECode {
  code: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  examples?: string[];
  url?: string;
}

// Activity Code Structure
interface ActivityCode {
  code: string;
  title: string;
  description: string;
  category: string;
}

interface NTEECodeSelectorProps {
  label: string;
  value: {
    nteeCode?: NTEECode;
    activityCode?: ActivityCode;
  };
  onChange: (value: {
    nteeCode?: NTEECode;
    activityCode?: ActivityCode;
  }) => void;
  required?: boolean;
  className?: string;
  showActivityCode?: boolean;
  showDescription?: boolean;
  allowCustom?: boolean;
  onDocumentUpload?: (file: File) => void;
}

const NTEECodeSelector: React.FC<NTEECodeSelectorProps> = ({
  label,
  value,
  onChange,
  required = false,
  className = '',
  showActivityCode = true,
  showDescription = true,
  allowCustom = false,
  onDocumentUpload
}) => {
  const [nteeSearchTerm, setNteeSearchTerm] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [showNteeDropdown, setShowNteeDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nteeCodes, setNteeCodes] = useState<NTEECode[]>([]);
  const [activityCodes, setActivityCodes] = useState<ActivityCode[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [customNteeCode, setCustomNteeCode] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const nteeDropdownRef = useRef<HTMLDivElement>(null);
  const activityDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load NTEE codes from the provided URL structure
  useEffect(() => {
    loadNTEECodes();
    loadActivityCodes();
  }, []);

  const loadNTEECodes = async () => {
    setLoading(true);
    try {
      // Mock NTEE codes based on the 501c3lookup.org structure
      const mockNTEECodes: NTEECode[] = [
        // Arts, Culture & Humanities
        {
          code: 'A01',
          title: 'Alliances & Advocacy',
          description: 'Organizations that bring together individuals or organizations with a common professional or vocational interest within the Arts, Culture, and Humanities major group area.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Alliance/Advocacy Organizations',
          examples: ['Arts advocacy groups', 'Cultural coalitions'],
          url: 'https://501c3lookup.org/arts-culture-humanities/'
        },
        {
          code: 'A02',
          title: 'Management & Technical Assistance',
          description: 'Organizations that provide consulting, training, and other forms of management assistance services to nonprofit organizations within the Arts, Culture, and Humanities major group area.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Management & Technical Assistance',
          examples: ['Arts management consultants', 'Technical assistance for museums']
        },
        {
          code: 'A03',
          title: 'Professional Societies & Associations',
          description: 'Organizations that bring together individuals or organizations with a common professional or vocational interest within the Arts, Culture, and Humanities major group area.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Professional Societies',
          examples: ['Professional arts associations', 'Museum professionals']
        },
        {
          code: 'A05',
          title: 'Research Institutes & Public Policy Analysis',
          description: 'Organizations that conduct research and/or public policy analysis within the Arts, Culture, and Humanities major group area.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Research Institutes',
          examples: ['Cultural research institutes', 'Arts policy analysis']
        },
        {
          code: 'A11',
          title: 'Single Organization Support',
          description: 'Organizations that raise and distribute funds for a single institution within the Arts, Culture, and Humanities major group area.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Single Organization Support',
          examples: ['Friends of the museum', 'Theatre support groups']
        },
        {
          code: 'A12',
          title: 'Fund Raising & Fund Distribution',
          description: 'Organizations that raise and distribute funds for multiple institutions within the Arts, Culture, and Humanities major group area.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Fund Raising & Distribution',
          examples: ['Arts foundations', 'Cultural funding organizations']
        },
        {
          code: 'A19',
          title: 'Nonmonetary Support N.E.C.',
          description: 'Organizations that provide all forms of support except for financial assistance or fund raising for other organizations within the Arts, Culture, and Humanities major group area.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Nonmonetary Support',
          examples: ['Volunteer services for arts', 'In-kind support organizations']
        },
        {
          code: 'A20',
          title: 'Arts, Cultural Organizations - Multipurpose',
          description: 'Organizations that promote artistic expression within a variety of art forms including folk art, heritage preservation, and contemporary arts.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Multipurpose Arts Organizations',
          examples: ['Community arts centers', 'Multi-disciplinary arts organizations']
        },
        {
          code: 'A23',
          title: 'Cultural & Ethnic Awareness',
          description: 'Organizations that promote awareness of and appreciation for the arts, culture, and heritage of a particular ethnic group or groups.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Cultural & Ethnic Awareness',
          examples: ['Cultural heritage organizations', 'Ethnic arts groups']
        },
        {
          code: 'A24',
          title: 'Folk Arts',
          description: 'Organizations that promote, produce or provide access to a variety of arts experiences encompassing the traditional/folk arts and crafts of a particular cultural group.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Folk Arts',
          examples: ['Traditional crafts organizations', 'Folk art preservation groups']
        },
        {
          code: 'A25',
          title: 'Arts Education',
          description: 'Organizations that provide instruction in the arts, music, dance, drama, and other creative and performing arts disciplines.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Arts Education',
          examples: ['Arts schools', 'Music education programs']
        },
        {
          code: 'A26',
          title: 'Arts Council/Agency',
          description: 'Government agencies that regulate, supervise, or provide services or assistance to the arts community.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Arts Council/Agency',
          examples: ['State arts councils', 'Municipal arts agencies']
        },
        {
          code: 'A27',
          title: 'Community Celebrations',
          description: 'Organizations that plan, organize, and conduct festivals, parades, and other similar community celebrations.',
          category: 'Arts, Culture & Humanities',
          subcategory: 'Community Celebrations',
          examples: ['Festival organizations', 'Community parade groups']
        },
        // Education
        {
          code: 'B01',
          title: 'Alliances & Advocacy',
          description: 'Organizations that bring together individuals or organizations with a common professional or vocational interest within the Education major group area.',
          category: 'Education',
          subcategory: 'Alliance/Advocacy Organizations',
          examples: ['Education advocacy groups', 'School reform coalitions']
        },
        {
          code: 'B02',
          title: 'Management & Technical Assistance',
          description: 'Organizations that provide consulting, training, and other forms of management assistance services to nonprofit organizations within the Education major group area.',
          category: 'Education',
          subcategory: 'Management & Technical Assistance',
          examples: ['School management consultants', 'Educational technology assistance']
        },
        {
          code: 'B03',
          title: 'Professional Societies & Associations',
          description: 'Organizations that bring together individuals or organizations with a common professional or vocational interest within the Education major group area.',
          category: 'Education',
          subcategory: 'Professional Societies',
          examples: ['Teachers associations', 'Educational administrators']
        },
        {
          code: 'B05',
          title: 'Research Institutes & Public Policy Analysis',
          description: 'Organizations that conduct research and/or public policy analysis within the Education major group area.',
          category: 'Education',
          subcategory: 'Research Institutes',
          examples: ['Educational research institutes', 'Education policy analysis']
        },
        {
          code: 'B11',
          title: 'Single Organization Support',
          description: 'Organizations that raise and distribute funds for a single institution within the Education major group area.',
          category: 'Education',
          subcategory: 'Single Organization Support',
          examples: ['School foundations', 'University support groups']
        },
        {
          code: 'B12',
          title: 'Fund Raising & Fund Distribution',
          description: 'Organizations that raise and distribute funds for multiple institutions within the Education major group area.',
          category: 'Education',
          subcategory: 'Fund Raising & Distribution',
          examples: ['Education foundations', 'Scholarship funds']
        },
        {
          code: 'B20',
          title: 'Elementary & Secondary Schools',
          description: 'Organizations that provide formal instruction for children and adolescents in kindergarten or elementary and secondary schools.',
          category: 'Education',
          subcategory: 'Elementary & Secondary Schools',
          examples: ['Private schools', 'Charter schools']
        },
        {
          code: 'B21',
          title: 'Kindergarten, Elementary, Middle, Secondary Schools',
          description: 'Organizations that provide formal instruction for children in kindergarten through grade 12.',
          category: 'Education',
          subcategory: 'K-12 Schools',
          examples: ['K-12 private schools', 'Alternative schools']
        },
        {
          code: 'B24',
          title: 'Primary & Elementary Schools',
          description: 'Organizations that provide formal instruction for children at the preschool, elementary, and middle school levels.',
          category: 'Education',
          subcategory: 'Primary & Elementary Schools',
          examples: ['Elementary schools', 'Primary education centers']
        },
        {
          code: 'B25',
          title: 'Secondary & High Schools',
          description: 'Organizations that provide formal instruction for students in grades 9-12.',
          category: 'Education',
          subcategory: 'Secondary & High Schools',
          examples: ['High schools', 'Secondary education institutions']
        },
        // Religion
        {
          code: 'X01',
          title: 'Alliances & Advocacy',
          description: 'Organizations that bring together individuals or organizations with a common professional or vocational interest within the Religion Related, Spiritual Development major group area.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Alliance/Advocacy Organizations',
          examples: ['Religious advocacy groups', 'Interfaith coalitions']
        },
        {
          code: 'X02',
          title: 'Management & Technical Assistance',
          description: 'Organizations that provide consulting, training, and other forms of management assistance services to nonprofit organizations within the Religion Related, Spiritual Development major group area.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Management & Technical Assistance',
          examples: ['Religious organization consultants', 'Church management assistance']
        },
        {
          code: 'X03',
          title: 'Professional Societies & Associations',
          description: 'Organizations that bring together individuals or organizations with a common professional or vocational interest within the Religion Related, Spiritual Development major group area.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Professional Societies',
          examples: ['Clergy associations', 'Religious professionals']
        },
        {
          code: 'X20',
          title: 'Christian',
          description: 'Organizations that promote and provide services related to the Christian faith.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Christian',
          examples: ['Christian churches', 'Christian ministry organizations']
        },
        {
          code: 'X21',
          title: 'Protestant',
          description: 'Organizations that promote and provide services related to Protestant denominations.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Protestant',
          examples: ['Protestant churches', 'Protestant ministry organizations']
        },
        {
          code: 'X22',
          title: 'Roman Catholic',
          description: 'Organizations that promote and provide services related to the Roman Catholic faith.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Roman Catholic',
          examples: ['Catholic churches', 'Catholic ministry organizations']
        },
        {
          code: 'X30',
          title: 'Jewish',
          description: 'Organizations that promote and provide services related to the Jewish faith.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Jewish',
          examples: ['Synagogues', 'Jewish organizations']
        },
        {
          code: 'X40',
          title: 'Islamic',
          description: 'Organizations that promote and provide services related to the Islamic faith.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Islamic',
          examples: ['Mosques', 'Islamic organizations']
        },
        {
          code: 'X50',
          title: 'Buddhist',
          description: 'Organizations that promote and provide services related to Buddhism.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Buddhist',
          examples: ['Buddhist temples', 'Buddhist organizations']
        },
        {
          code: 'X70',
          title: 'Hindu',
          description: 'Organizations that promote and provide services related to Hinduism.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Hindu',
          examples: ['Hindu temples', 'Hindu organizations']
        },
        {
          code: 'X80',
          title: 'Religious Media & Communications',
          description: 'Organizations that produce and distribute religious media content.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Religious Media',
          examples: ['Religious broadcasting', 'Religious publications']
        },
        {
          code: 'X81',
          title: 'Religious Film & Video',
          description: 'Organizations that produce religious films and videos.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Religious Film & Video',
          examples: ['Religious film production', 'Religious video ministries']
        },
        {
          code: 'X82',
          title: 'Religious Television',
          description: 'Organizations that produce and broadcast religious television programming.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Religious Television',
          examples: ['Religious TV networks', 'Religious broadcasting']
        },
        {
          code: 'X83',
          title: 'Religious Radio',
          description: 'Organizations that produce and broadcast religious radio programming.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Religious Radio',
          examples: ['Religious radio stations', 'Religious radio ministries']
        },
        {
          code: 'X84',
          title: 'Religious Publishing',
          description: 'Organizations that publish religious books, magazines, and other materials.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Religious Publishing',
          examples: ['Religious book publishers', 'Religious magazines']
        },
        {
          code: 'X90',
          title: 'Interfaith Issues',
          description: 'Organizations that promote understanding and cooperation between different religious faiths.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Interfaith Issues',
          examples: ['Interfaith councils', 'Interfaith dialogue organizations']
        },
        {
          code: 'X99',
          title: 'Religion Related, Spiritual Development N.E.C.',
          description: 'Organizations that promote and provide services related to religion and spiritual development that are not classified elsewhere.',
          category: 'Religion Related, Spiritual Development',
          subcategory: 'Other Religious',
          examples: ['Other religious organizations', 'Spiritual development groups']
        }
      ];

      setNteeCodes(mockNTEECodes);
    } catch (error) {
      toast.error('Failed to load NTEE codes');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityCodes = async () => {
    try {
      // Mock activity codes based on the structure mentioned
      const mockActivityCodes: ActivityCode[] = [
        {
          code: '001',
          title: 'Church, synagogue, etc',
          description: 'Religious worship organizations including churches, synagogues, mosques, and other places of worship.',
          category: 'Religious Organizations'
        },
        {
          code: '002',
          title: 'Association or convention of churches',
          description: 'Organizations that bring together multiple churches or religious organizations.',
          category: 'Religious Organizations'
        },
        {
          code: '003',
          title: 'Religious order',
          description: 'Organizations of individuals who have committed to religious life under vows.',
          category: 'Religious Organizations'
        },
        {
          code: '004',
          title: 'Church auxiliary',
          description: 'Support organizations that assist churches and religious organizations.',
          category: 'Religious Organizations'
        },
        {
          code: '005',
          title: 'Mission society',
          description: 'Organizations that support missionary work and religious outreach.',
          category: 'Religious Organizations'
        },
        {
          code: '006',
          title: 'Missionary activities',
          description: 'Organizations engaged in missionary work and religious evangelism.',
          category: 'Religious Organizations'
        },
        {
          code: '007',
          title: 'Religious publishing activities',
          description: 'Organizations that publish religious materials and literature.',
          category: 'Religious Organizations'
        },
        {
          code: '008',
          title: 'Religious broadcasting',
          description: 'Organizations that broadcast religious programming on radio or television.',
          category: 'Religious Organizations'
        },
        {
          code: '009',
          title: 'Religious education',
          description: 'Organizations that provide religious education and instruction.',
          category: 'Religious Organizations'
        },
        {
          code: '010',
          title: 'Religious youth organization',
          description: 'Organizations that provide religious programming for youth.',
          category: 'Religious Organizations'
        },
        {
          code: '011',
          title: 'Religious seminary or training institution',
          description: 'Educational institutions that train religious clergy and leaders.',
          category: 'Religious Organizations'
        },
        {
          code: '012',
          title: 'Religious retreat',
          description: 'Organizations that provide religious retreat facilities and programs.',
          category: 'Religious Organizations'
        },
        {
          code: '013',
          title: 'Cemetery or burial services',
          description: 'Organizations that provide cemetery and burial services.',
          category: 'Religious Organizations'
        },
        {
          code: '014',
          title: 'Religious counseling service',
          description: 'Organizations that provide counseling services with a religious focus.',
          category: 'Religious Organizations'
        },
        {
          code: '015',
          title: 'Church construction fund',
          description: 'Organizations that raise funds for church construction and renovation.',
          category: 'Religious Organizations'
        },
        {
          code: '016',
          title: 'Religious organization support',
          description: 'Organizations that provide support to religious organizations.',
          category: 'Religious Organizations'
        },
        {
          code: '017',
          title: 'Religious conferences and conventions',
          description: 'Organizations that organize religious conferences and conventions.',
          category: 'Religious Organizations'
        },
        {
          code: '018',
          title: 'Religious community development',
          description: 'Organizations that engage in community development with a religious focus.',
          category: 'Religious Organizations'
        },
        {
          code: '019',
          title: 'Other religious activities',
          description: 'Religious activities not classified elsewhere.',
          category: 'Religious Organizations'
        }
      ];

      setActivityCodes(mockActivityCodes);
    } catch (error) {
      toast.error('Failed to load activity codes');
    }
  };

  // Filter NTEE codes based on search term and category
  const filteredNteeCodes = nteeCodes.filter(code => {
    const matchesSearch = (code.code || '').toLowerCase().includes(nteeSearchTerm.toLowerCase()) ||
                         (code.title || '').toLowerCase().includes(nteeSearchTerm.toLowerCase()) ||
                         (code.description || '').toLowerCase().includes(nteeSearchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter activity codes based on search term
  const filteredActivityCodes = activityCodes.filter(code =>
    (code.code || '').toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
    (code.title || '').toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
    (code.description || '').toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  // Get unique categories
  const categories = Array.from(new Set(nteeCodes.map(code => code.category)));

  // Handle NTEE code selection
  const handleNteeSelect = (code: NTEECode) => {
    onChange({
      ...value,
      nteeCode: code
    });
    setShowNteeDropdown(false);
    setNteeSearchTerm('');
  };

  // Handle activity code selection
  const handleActivitySelect = (code: ActivityCode) => {
    onChange({
      ...value,
      activityCode: code
    });
    setShowActivityDropdown(false);
    setActivitySearchTerm('');
  };

  // Handle custom NTEE code
  const handleCustomNteeCode = () => {
    if (customNteeCode && customDescription) {
      const customCode: NTEECode = {
        code: customNteeCode,
        title: customDescription,
        description: customDescription,
        category: 'Custom'
      };
      
      onChange({
        ...value,
        nteeCode: customCode
      });
      
      setShowCustomInput(false);
      setCustomNteeCode('');
      setCustomDescription('');
    }
  };

  // Handle document upload
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onDocumentUpload) {
      onDocumentUpload(file);
    }
  };

  return (
    <div className={`ntee-code-selector ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Information about NTEE codes"
          >
            <Info className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="Upload supporting document"
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <a
            href="https://501c3lookup.org/list-of-501c3-ntee-codes/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
            title="View full NTEE code list"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* NTEE Code Section */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          501(c) NTEE Code List
        </h3>
        
        {/* Category Filter */}
        <div className="mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* NTEE Search/Select */}
        <div className="relative" ref={nteeDropdownRef}>
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={value.nteeCode ? `${value.nteeCode.code} - ${value.nteeCode.title}` : nteeSearchTerm}
                onChange={(e) => {
                  setNteeSearchTerm(e.target.value);
                  if (value.nteeCode) {
                    onChange({ ...value, nteeCode: undefined });
                  }
                }}
                onFocus={() => setShowNteeDropdown(true)}
                placeholder="Search NTEE codes..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowNteeDropdown(!showNteeDropdown)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showNteeDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            
            {allowCustom && (
              <button
                onClick={() => setShowCustomInput(true)}
                className="ml-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Custom
              </button>
            )}
          </div>

          {/* NTEE Dropdown */}
          {showNteeDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filteredNteeCodes.length > 0 ? (
                <div className="p-2">
                  {filteredNteeCodes.map((code) => (
                    <button
                      key={code.code}
                      onClick={() => handleNteeSelect(code)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-blue-600">{code.code}</span>
                            <span className="text-sm text-gray-900">{code.title}</span>
                          </div>
                          {showDescription && (
                            <p className="text-xs text-gray-600 mt-1">{code.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {code.category}
                            </span>
                            {code.subcategory && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {code.subcategory}
                              </span>
                            )}
                          </div>
                        </div>
                        {value.nteeCode?.code === code.code && (
                          <Check className="w-4 h-4 text-green-500 mt-1" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No NTEE codes found</p>
                  <p className="text-sm">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Activity Code Section */}
      {showActivityCode && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Find by Activity Code
          </h3>
          
          <div className="relative" ref={activityDropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={value.activityCode ? `${value.activityCode.code} - ${value.activityCode.title}` : activitySearchTerm}
                onChange={(e) => {
                  setActivitySearchTerm(e.target.value);
                  if (value.activityCode) {
                    onChange({ ...value, activityCode: undefined });
                  }
                }}
                onFocus={() => setShowActivityDropdown(true)}
                placeholder="Search activity codes..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showActivityDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Activity Dropdown */}
            {showActivityDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {filteredActivityCodes.length > 0 ? (
                  <div className="p-2">
                    {filteredActivityCodes.map((code) => (
                      <button
                        key={code.code}
                        onClick={() => handleActivitySelect(code)}
                        className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-green-600">{code.code}</span>
                              <span className="text-sm text-gray-900">{code.title}</span>
                            </div>
                            {showDescription && (
                              <p className="text-xs text-gray-600 mt-1">{code.description}</p>
                            )}
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded mt-2 inline-block">
                              {code.category}
                            </span>
                          </div>
                          {value.activityCode?.code === code.code && (
                            <Check className="w-4 h-4 text-green-500 mt-1" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No activity codes found</p>
                    <p className="text-sm">Try adjusting your search term</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Values Display */}
      {(value.nteeCode || value.activityCode) && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Codes</h4>
          
          {value.nteeCode && (
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-blue-600">
                    NTEE: {value.nteeCode.code}
                  </span>
                  <span className="text-sm text-gray-700 ml-2">
                    {value.nteeCode.title}
                  </span>
                </div>
                <button
                  onClick={() => onChange({ ...value, nteeCode: undefined })}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Remove NTEE code"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {value.activityCode && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-green-600">
                    Activity: {value.activityCode.code}
                  </span>
                  <span className="text-sm text-gray-700 ml-2">
                    {value.activityCode.title}
                  </span>
                </div>
                <button
                  onClick={() => onChange({ ...value, activityCode: undefined })}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Remove activity code"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Input Modal */}
      {showCustomInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Custom NTEE Code</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NTEE Code
                </label>
                <input
                  type="text"
                  value={customNteeCode}
                  onChange={(e) => setCustomNteeCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., A25"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe your organization's activities..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCustomInput(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomNteeCode}
                disabled={!customNteeCode || !customDescription}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">About NTEE Codes</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600">
              <p>
                The National Taxonomy of Exempt Entities (NTEE) system is used by the IRS and 
                National Center for Charitable Statistics to classify nonprofit organizations.
              </p>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">How NTEE Codes Work:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>First letter indicates the major group (e.g., A = Arts, B = Education, X = Religion)</li>
                  <li>Numbers indicate the specific activity within that group</li>
                  <li>Each organization should have one primary NTEE code</li>
                  <li>Codes help classify organizations for research and statistical purposes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Activity Codes:</h4>
                <p>
                  Activity codes provide additional detail about what your organization does, 
                  particularly for religious organizations. These codes help further classify 
                  the specific activities and services your organization provides.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                <p>
                  If you're unsure about which code to select, consider your organization's 
                  primary activities and mission. You can also visit the official NTEE code 
                  database for more detailed information.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleDocumentUpload}
        className="hidden"
      />
    </div>
  );
};

export default NTEECodeSelector;