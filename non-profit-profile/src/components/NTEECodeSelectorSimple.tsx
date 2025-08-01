import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';

// NTEE Categories and Codes based on 501c3lookup.org
const NTEE_CATEGORIES = [
  { id: 'A', name: 'Arts, Culture & Humanities' },
  { id: 'B', name: 'Education' },
  { id: 'C', name: 'Environment' },
  { id: 'D', name: 'Animal-Related' },
  { id: 'E', name: 'Health Care' },
  { id: 'F', name: 'Mental Health & Crisis Intervention' },
  { id: 'G', name: 'Diseases, Disorders & Medical Disciplines' },
  { id: 'H', name: 'Medical Research' },
  { id: 'I', name: 'Crime & Legal-Related' },
  { id: 'J', name: 'Employment' },
  { id: 'K', name: 'Food, Agriculture & Nutrition' },
  { id: 'L', name: 'Housing & Shelter' },
  { id: 'M', name: 'Public Safety, Disaster Preparedness & Relief' },
  { id: 'N', name: 'Recreation & Sports' },
  { id: 'O', name: 'Youth Development' },
  { id: 'P', name: 'Human Services' },
  { id: 'Q', name: 'International, Foreign Affairs & National Security' },
  { id: 'R', name: 'Civil Rights, Social Action & Advocacy' },
  { id: 'S', name: 'Community Improvement & Capacity Building' },
  { id: 'T', name: 'Philanthropy, Voluntarism & Grantmaking Foundations' },
  { id: 'U', name: 'Science & Technology' },
  { id: 'V', name: 'Social Science' },
  { id: 'W', name: 'Public & Societal Benefit' },
  { id: 'X', name: 'Religion-Related' },
  { id: 'Y', name: 'Mutual & Membership Benefit' },
  { id: 'Z', name: 'Unknown' }
];

// Sample NTEE codes - in production, this would be a complete list
const NTEE_CODES = [
  // Arts
  { code: 'A01', category: 'A', name: 'Alliances & Advocacy', description: 'Organizations that promote, produce or provide access to a variety of arts experiences' },
  { code: 'A20', category: 'A', name: 'Arts & Culture', description: 'Multipurpose arts organizations' },
  { code: 'A25', category: 'A', name: 'Arts Education', description: 'Arts councils and arts education organizations' },
  
  // Education
  { code: 'B01', category: 'B', name: 'Educational Alliances & Advocacy', description: 'Organizations that support educational institutions' },
  { code: 'B20', category: 'B', name: 'Elementary & Secondary Schools', description: 'K-12 educational institutions' },
  { code: 'B40', category: 'B', name: 'Higher Education', description: 'Colleges and universities' },
  
  // Human Services
  { code: 'P20', category: 'P', name: 'Human Service Organizations', description: 'Multipurpose human service organizations' },
  { code: 'P30', category: 'P', name: 'Children & Youth Services', description: 'Organizations providing services to children and youth' },
  { code: 'P40', category: 'P', name: 'Family Services', description: 'Organizations providing services to families' },
  
  // Add more codes as needed...
];

// Activity codes
const ACTIVITY_CODES = [
  { code: '001', name: 'Church, synagogue, etc', description: 'Religious congregations and places of worship' },
  { code: '002', name: 'Association or convention of churches', description: 'Religious associations and conventions' },
  { code: '003', name: 'Religious order', description: 'Monastic and religious orders' },
  { code: '004', name: 'Church auxiliary', description: 'Supporting organizations for churches' },
  { code: '005', name: 'Mission', description: 'Religious missionary activities' },
  { code: '006', name: 'Missionary activities', description: 'Foreign and domestic missionary work' },
  { code: '007', name: 'Evangelism', description: 'Religious outreach and evangelism' },
  { code: '008', name: 'Religious publishing', description: 'Publishing of religious materials' }
];

interface NTEECodeSelectorSimpleProps {
  value?: {
    nteeCode?: string;
    activityCode?: string;
  };
  onChange: (value: { nteeCode?: string; activityCode?: string }) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const NTEECodeSelectorSimple: React.FC<NTEECodeSelectorSimpleProps> = ({
  value = {},
  onChange,
  error,
  required = false,
  disabled = false
}) => {
  const [showNTEEDropdown, setShowNTEEDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [nteeSearch, setNteeSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const nteeDropdownRef = useRef<HTMLDivElement>(null);
  const activityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nteeDropdownRef.current && !nteeDropdownRef.current.contains(event.target as Node)) {
        setShowNTEEDropdown(false);
      }
      if (activityDropdownRef.current && !activityDropdownRef.current.contains(event.target as Node)) {
        setShowActivityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter NTEE codes
  const filteredNTEECodes = NTEE_CODES.filter(code => {
    const matchesSearch = nteeSearch === '' || 
      code.code.toLowerCase().includes(nteeSearch.toLowerCase()) ||
      code.name.toLowerCase().includes(nteeSearch.toLowerCase()) ||
      code.description.toLowerCase().includes(nteeSearch.toLowerCase());
    
    const matchesCategory = !selectedCategory || code.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filter activity codes
  const filteredActivityCodes = ACTIVITY_CODES.filter(code => 
    activitySearch === '' || 
    code.code.includes(activitySearch) ||
    code.name.toLowerCase().includes(activitySearch.toLowerCase()) ||
    code.description.toLowerCase().includes(activitySearch.toLowerCase())
  );

  // Get selected code details
  const selectedNTEE = NTEE_CODES.find(c => c.code === value.nteeCode);
  const selectedActivity = ACTIVITY_CODES.find(c => c.code === value.activityCode);

  return (
    <div className="space-y-4">
      {/* NTEE Code Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          501(c) NTEE Code List {required && <span className="text-red-500">*</span>}
        </label>
        
        <div ref={nteeDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowNTEEDropdown(!showNTEEDropdown)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
          >
            <span className={selectedNTEE ? 'text-gray-900' : 'text-gray-500'}>
              {selectedNTEE ? `${selectedNTEE.code} - ${selectedNTEE.name}` : 'Select NTEE Code'}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showNTEEDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showNTEEDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search NTEE codes..."
                    value={nteeSearch}
                    onChange={(e) => setNteeSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="px-3 py-2 border-b bg-gray-50">
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-2 py-1 text-xs rounded ${
                      !selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {NTEE_CATEGORIES.slice(0, 8).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2 py-1 text-xs rounded ${
                        selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={cat.name}
                    >
                      {cat.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Codes list */}
              <div className="max-h-64 overflow-y-auto">
                {filteredNTEECodes.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No codes found
                  </div>
                ) : (
                  filteredNTEECodes.map(code => (
                    <button
                      key={code.code}
                      onClick={() => {
                        onChange({ ...value, nteeCode: code.code });
                        setShowNTEEDropdown(false);
                        setNteeSearch('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-start gap-3"
                    >
                      <span className="font-medium text-blue-600">{code.code}</span>
                      <div className="flex-1">
                        <div className="font-medium">{code.name}</div>
                        <div className="text-sm text-gray-600">{code.description}</div>
                      </div>
                      {value.nteeCode === code.code && (
                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
                <a 
                  href="https://501c3lookup.org/list-of-501c3-ntee-codes/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View complete NTEE code list →
                </a>
              </div>
            </div>
          )}
        </div>

        {selectedNTEE && (
          <p className="mt-1 text-sm text-gray-600">
            Category: {NTEE_CATEGORIES.find(c => c.id === selectedNTEE.category)?.name}
          </p>
        )}
      </div>

      {/* Activity Code Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Find by Activity Code
        </label>
        
        <div ref={activityDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowActivityDropdown(!showActivityDropdown)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between ${
              disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'
            }`}
          >
            <span className={selectedActivity ? 'text-gray-900' : 'text-gray-500'}>
              {selectedActivity ? `${selectedActivity.name} - ${selectedActivity.code}` : 'Select one...'}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showActivityDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showActivityDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b sticky top-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search activity codes..."
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Codes list */}
              <div className="max-h-48 overflow-y-auto">
                {filteredActivityCodes.map(code => (
                  <button
                    key={code.code}
                    onClick={() => {
                      onChange({ ...value, activityCode: code.code });
                      setShowActivityDropdown(false);
                      setActivitySearch('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{code.name}</div>
                      <div className="text-sm text-gray-600">{code.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-gray-500">{code.code}</span>
                      {value.activityCode === code.code && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Info message */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          These codes will appear in your organization's contact card and be available for auto-fill in the Basic Information section.
        </p>
      </div>
    </div>
  );
};

export default NTEECodeSelectorSimple;