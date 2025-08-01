import React, { useState, useEffect, useRef } from 'react';
import { logger } from '../utils/logger';
import { 
  Search, Filter, X, Tag, Save, ChevronDown, ChevronRight, Zap, 
  Star, Trash2, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { searchService, SearchOptions, SearchResult, SearchFilter } from '../services/searchService';
import { toast } from 'react-toastify';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
  organizationId: string;
  userId: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  isOpen,
  onClose,
  onResultClick,
  organizationId,
  userId
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedFieldTypes, setSelectedFieldTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [completionStatus, setCompletionStatus] = useState<'all' | 'complete' | 'incomplete' | 'partial'>('all');
  const [hasAttachments, setHasAttachments] = useState<boolean | null>(null);
  const [fuzzySearch, setFuzzySearch] = useState(true);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'section'>('relevance');

  const sections = [
    'basicInfo', 'narrative', 'governance', 'management',
    'financials', 'programs', 'impact', 'compliance',
    'technology', 'communications', 'riskManagement'
  ];

  const fieldTypes = [
    'text', 'number', 'date', 'email', 'phone', 'boolean', 'array', 'document'
  ];

  useEffect(() => {
    if (isOpen) {
      initializeSearch();
      searchInputRef.current?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const initializeSearch = async () => {
    await searchService.initialize(organizationId);
    const filters = await searchService.getSavedFilters();
    setSavedFilters(filters);
  };

  const handleSearch = async () => {
    if (!query.trim() && selectedSections.length === 0 && selectedFieldTypes.length === 0) {
      toast.warning('Please enter a search query or select filters');
      return;
    }

    setLoading(true);
    try {
      const options: SearchOptions = {
        query: query.trim(),
        sections: selectedSections.length > 0 ? selectedSections : undefined,
        fieldTypes: selectedFieldTypes.length > 0 ? selectedFieldTypes : undefined,
        dateRange: dateRange.start && dateRange.end ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        } : undefined,
        completionStatus: completionStatus !== 'all' ? completionStatus : undefined,
        hasAttachments: hasAttachments !== null ? hasAttachments : undefined,
        fuzzySearch,
        sortBy
      };

      const searchResults = await searchService.search(options);
      setResults(searchResults);
      setCurrentPage(1);
      
      if (searchResults.length === 0) {
        toast.info('No results found. Try adjusting your search criteria.');
      }
    } catch (error) {
      logger.error('Search failed:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleQueryChange = async (value: string) => {
    setQuery(value);
    
    if (value.length > 2) {
      const suggestions = await searchService.getSearchSuggestions(value);
      setSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSaveFilter = async () => {
    const filterName = prompt('Enter a name for this filter:');
    if (!filterName) return;

    try {
      const options: SearchOptions = {
        query: query.trim(),
        sections: selectedSections.length > 0 ? selectedSections : undefined,
        fieldTypes: selectedFieldTypes.length > 0 ? selectedFieldTypes : undefined,
        dateRange: dateRange.start && dateRange.end ? {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end)
        } : undefined,
        completionStatus: completionStatus !== 'all' ? completionStatus : undefined,
        hasAttachments: hasAttachments !== null ? hasAttachments : undefined
      };

      await searchService.saveFilter(filterName, options, userId);
      const filters = await searchService.getSavedFilters();
      setSavedFilters(filters);
      toast.success('Filter saved successfully');
    } catch (error) {
      logger.error('Failed to save filter:', error);
      toast.error('Failed to save filter');
    }
  };

  const handleApplySavedFilter = async (filterId: string) => {
    const options = await searchService.applySavedFilter(filterId);
    if (!options) return;

    setQuery(options.query);
    setSelectedSections(options.sections || []);
    setSelectedFieldTypes(options.fieldTypes || []);
    if (options.dateRange) {
      setDateRange({
        start: options.dateRange.start.toISOString().split('T')[0],
        end: options.dateRange.end.toISOString().split('T')[0]
      });
    }
    setCompletionStatus(options.completionStatus || 'all');
    setHasAttachments(options.hasAttachments ?? null);
    
    handleSearch();
  };

  const handleDeleteFilter = async (filterId: string) => {
    if (!window.confirm('Are you sure you want to delete this saved filter?')) return;

    try {
      await searchService.deleteSavedFilter(filterId);
      const filters = await searchService.getSavedFilters();
      setSavedFilters(filters);
      toast.success('Filter deleted');
    } catch (error) {
      logger.error('Failed to delete filter:', error);
      toast.error('Failed to delete filter');
    }
  };

  const applyQuickFilter = (quickFilter: { label: string; options: Partial<SearchOptions> }) => {
    if (quickFilter.options.completionStatus) {
      setCompletionStatus(quickFilter.options.completionStatus);
    }
    if (quickFilter.options.hasAttachments !== undefined) {
      setHasAttachments(quickFilter.options.hasAttachments);
    }
    if (quickFilter.options.sections) {
      setSelectedSections(quickFilter.options.sections);
    }
    if (quickFilter.options.fieldTypes) {
      setSelectedFieldTypes(quickFilter.options.fieldTypes);
    }
    if (quickFilter.options.dateRange) {
      setDateRange({
        start: quickFilter.options.dateRange.start.toISOString().split('T')[0],
        end: quickFilter.options.dateRange.end.toISOString().split('T')[0]
      });
    }
    
    handleSearch();
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedSections([]);
    setSelectedFieldTypes([]);
    setDateRange({ start: '', end: '' });
    setCompletionStatus('all');
    setHasAttachments(null);
    setResults([]);
  };

  // Pagination
  const totalPages = Math.ceil(results.length / resultsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Advanced Search</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar - Filters & Saved Searches */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            {/* Quick Filters */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Filters
              </h3>
              <div className="space-y-2">
                {searchService.getQuickFilters().map((filter, index) => (
                  <button
                    key={index}
                    onClick={() => applyQuickFilter(filter)}
                    className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-blue-50 transition-colors"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Saved Filters
                </h3>
                <div className="space-y-2">
                  {savedFilters.map(filter => (
                    <div key={filter.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleApplySavedFilter(filter.id)}
                        className="flex-1 text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-blue-50 transition-colors"
                      >
                        {filter.name}
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Advanced Filters */}
            <div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-3"
              >
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Advanced Filters
                </span>
                {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {showFilters && (
                <div className="space-y-4">
                  {/* Sections */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Sections</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {sections.map(section => (
                        <label key={section} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedSections.includes(section)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSections([...selectedSections, section]);
                              } else {
                                setSelectedSections(selectedSections.filter(s => s !== section));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700">
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Field Types */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Field Types</label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {fieldTypes.map(type => (
                        <label key={type} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedFieldTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFieldTypes([...selectedFieldTypes, type]);
                              } else {
                                setSelectedFieldTypes(selectedFieldTypes.filter(t => t !== type));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600"
                          />
                          <span className="text-gray-700 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Date Range</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full px-2 py-1 text-sm border rounded mb-1"
                      placeholder="Start date"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full px-2 py-1 text-sm border rounded"
                      placeholder="End date"
                    />
                  </div>

                  {/* Other Options */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Options</label>
                    <label className="flex items-center gap-2 text-sm mb-2">
                      <input
                        type="checkbox"
                        checked={fuzzySearch}
                        onChange={(e) => setFuzzySearch(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-gray-700">Fuzzy Search</span>
                    </label>
                    <select
                      value={hasAttachments === null ? '' : hasAttachments.toString()}
                      onChange={(e) => setHasAttachments(
                        e.target.value === '' ? null : e.target.value === 'true'
                      )}
                      className="w-full px-2 py-1 text-sm border rounded mb-2"
                    >
                      <option value="">All Documents</option>
                      <option value="true">With Attachments</option>
                      <option value="false">Without Attachments</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'section' | 'relevance')}
                      className="w-full px-2 py-1 text-sm border rounded"
                    >
                      <option value="relevance">Sort by Relevance</option>
                      <option value="date">Sort by Date</option>
                      <option value="section">Sort by Section</option>
                    </select>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full px-3 py-2 text-sm text-gray-700 bg-white border rounded-md hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Search & Results */}
          <div className="flex-1 flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search across all fields..."
                  className="w-full pl-10 pr-32 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <div className="absolute right-2 top-2 flex items-center gap-2">
                  <button
                    onClick={handleSaveFilter}
                    className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    title="Save current search"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {/* Suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(suggestion);
                          setShowSuggestions(false);
                          handleSearch();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Found {results.length} result{results.length !== 1 ? 's' : ''}
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                        >
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {paginatedResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => onResultClick?.(result)}
                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{result.fieldName}</h4>
                            <p className="text-sm text-gray-600">
                              {result.sectionName} • {result.fieldType}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            Score: {result.matchScore.toFixed(1)}
                          </span>
                        </div>
                        <div 
                          className="text-sm text-gray-700"
                          dangerouslySetInnerHTML={{ 
                            __html: result.context.replace(/\*\*(.*?)\*\*/g, '<mark class="bg-yellow-200">$1</mark>') 
                          }}
                        />
                        {result.tags && result.tags.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            {result.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No results found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;