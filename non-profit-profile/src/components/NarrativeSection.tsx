import React, { useState, useEffect } from 'react';
import { FileText, Upload, Trash2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';

interface NarrativeData {
  backgroundStatement: string;
  missionStatement: string;
  visionStatement: string;
  impactStatement: string;
  strategiesStatement: string;
  needsStatement: string;
  primaryAreasOfImpact: string;
  nteeCodes: string;
  populationServed: string;
  serviceAreas: string;
  serviceAreaDescription: string;
  searchKeywords: string;
  logoFile: File | null;
  bannerImage: File | null;
  socialMedia: string;
  externalAssessments: string;
  affiliations: string;
  videos: string;
  annualReport: File | null;
  strategicPlan: File | null;
  [key: string]: any;
}

interface NarrativeSectionProps {
  narrative: NarrativeData;
  errors: any;
  locked: boolean;
  onNarrativeChange: (field: string, value: any) => void;
  onFileUpload?: (field: string, file: File) => void;
  onFileRemove?: (field: string) => void;
}

const NarrativeSection: React.FC<NarrativeSectionProps> = ({
  narrative,
  errors,
  locked,
  onNarrativeChange,
  onFileUpload,
  onFileRemove
}) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  // Auto-save effect
  useEffect(() => {
    if (locked) return;
    const timeout = setTimeout(() => {
      setAutoSaveStatus('Saving...');
      setTimeout(() => setAutoSaveStatus('All changes saved.'), 500);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [narrative, locked]);

  const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(field, file);
      toast.success(`${field} uploaded successfully`);
    }
  };

  const narrativeFields = [
    {
      id: 'backgroundStatement',
      label: 'Background Statement',
      required: true,
      placeholder: 'Describe your organization\'s history and background...',
      height: 300
    },
    {
      id: 'missionStatement',
      label: 'Mission Statement',
      required: true,
      placeholder: 'What is your organization\'s mission?',
      height: 200
    },
    {
      id: 'visionStatement',
      label: 'Vision Statement',
      required: true,
      placeholder: 'What is your organization\'s vision for the future?',
      height: 200
    },
    {
      id: 'impactStatement',
      label: 'Impact Statement',
      required: true,
      placeholder: 'Describe the impact your organization makes...',
      height: 250
    },
    {
      id: 'strategiesStatement',
      label: 'Strategies Statement',
      required: true,
      placeholder: 'What strategies does your organization use to achieve its mission?',
      height: 250
    },
    {
      id: 'needsStatement',
      label: 'Needs Statement',
      required: true,
      placeholder: 'What needs does your organization address?',
      height: 250
    }
  ];

  return (
    <div className="space-y-6">
      {/* Core Narrative Statements */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Core Narrative Statements
        </h3>
        
        <div className="space-y-6">
          {narrativeFields.map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} className="block font-semibold mb-2">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <RichTextEditor
                value={narrative[field.id] || ''}
                onChange={(content) => onNarrativeChange(field.id, content)}
                placeholder={field.placeholder}
                disabled={locked}
                height={field.height}
                minHeight={200}
                maxHeight={800}
                resizable={true}
              />
              
              {/* Document Upload */}
              <div className="flex gap-2 mt-2 items-center">
                <label className="block text-sm font-medium text-gray-700 mb-0">
                  Upload Supporting Document
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(`${field.id}Docs`, e)}
                  className="block"
                  disabled={locked}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              
              {narrative[`${field.id}Docs`] && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 text-sm flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      Document uploaded
                    </span>
                    {onFileRemove && (
                      <button
                        onClick={() => onFileRemove(`${field.id}Docs`)}
                        className="text-red-600 hover:text-red-800"
                        disabled={locked}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {errors[field.id] && (
                <p className="text-red-600 text-sm mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Service Areas and Impact */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Service Areas and Impact
        </h3>
        
        {/* Primary Areas of Impact */}
        <div className="mb-6">
          <label htmlFor="primaryAreasOfImpact" className="block font-semibold mb-2">
            Primary Areas of Impact <span className="text-red-500">*</span>
          </label>
          <textarea
            id="primaryAreasOfImpact"
            value={narrative.primaryAreasOfImpact || ''}
            onChange={(e) => onNarrativeChange('primaryAreasOfImpact', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="List your primary areas of impact (e.g., Education, Health, Environment)"
            disabled={locked}
          />
          {errors.primaryAreasOfImpact && (
            <p className="text-red-600 text-sm mt-1">{errors.primaryAreasOfImpact}</p>
          )}
        </div>

        {/* NTEE Codes */}
        <div className="mb-6">
          <label htmlFor="nteeCodes" className="block font-semibold mb-2">
            NTEE Codes
          </label>
          <input
            type="text"
            id="nteeCodes"
            value={narrative.nteeCodes || ''}
            onChange={(e) => onNarrativeChange('nteeCodes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter NTEE codes (e.g., A20, B60)"
            disabled={locked}
          />
          <small className="text-gray-600 block mt-1">
            National Taxonomy of Exempt Entities classification codes
          </small>
        </div>

        {/* Population Served */}
        <div className="mb-6">
          <label htmlFor="populationServed" className="block font-semibold mb-2">
            Population Served <span className="text-red-500">*</span>
          </label>
          <textarea
            id="populationServed"
            value={narrative.populationServed || ''}
            onChange={(e) => onNarrativeChange('populationServed', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe the population your organization serves"
            disabled={locked}
          />
          {errors.populationServed && (
            <p className="text-red-600 text-sm mt-1">{errors.populationServed}</p>
          )}
        </div>

        {/* Service Areas */}
        <div className="mb-6">
          <label htmlFor="serviceAreas" className="block font-semibold mb-2">
            Service Areas (Geographic) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="serviceAreas"
            value={narrative.serviceAreas || ''}
            onChange={(e) => onNarrativeChange('serviceAreas', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="List geographic areas served (e.g., Chicago, Cook County, Illinois)"
            disabled={locked}
          />
          {errors.serviceAreas && (
            <p className="text-red-600 text-sm mt-1">{errors.serviceAreas}</p>
          )}
        </div>

        {/* Service Area Description */}
        <div>
          <label htmlFor="serviceAreaDescription" className="block font-semibold mb-2">
            Service Area Description
          </label>
          <textarea
            id="serviceAreaDescription"
            value={narrative.serviceAreaDescription || ''}
            onChange={(e) => onNarrativeChange('serviceAreaDescription', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Provide additional details about your service areas"
            disabled={locked}
          />
        </div>
      </div>

      {/* Digital Presence */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Digital Presence and Media
        </h3>

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Organization Logo</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={(e) => handleFileChange('logoFile', e)}
              accept="image/*"
              disabled={locked}
              className="block"
            />
            {narrative.logoFile && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">Logo uploaded</span>
              </div>
            )}
          </div>
          <small className="text-gray-600 block mt-1">
            Upload a high-resolution logo (PNG or JPG preferred)
          </small>
        </div>

        {/* Banner Image */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Banner Image</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={(e) => handleFileChange('bannerImage', e)}
              accept="image/*"
              disabled={locked}
              className="block"
            />
            {narrative.bannerImage && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">Banner uploaded</span>
              </div>
            )}
          </div>
          <small className="text-gray-600 block mt-1">
            Upload a banner image for your organization profile
          </small>
        </div>

        {/* Social Media */}
        <div className="mb-6">
          <label className="block font-semibold mb-4">
            Social Media Profiles
          </label>
          
          <div className="space-y-4">
            {/* Generate 5 social media fields */}
            {[0, 1, 2, 3, 4].map((index) => {
              const platforms = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok', 'Other'];
              const selectedPlatform = narrative[`socialMediaPlatform${index}`] || 'Facebook';
              const isHandle = narrative[`socialMediaType${index}`] !== 'url';
              
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-lg">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Platform</label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => onNarrativeChange(`socialMediaPlatform${index}`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={locked}
                    >
                      {platforms.map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Handle/URL Toggle */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Type</label>
                    <select
                      value={isHandle ? 'handle' : 'url'}
                      onChange={(e) => onNarrativeChange(`socialMediaType${index}`, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      disabled={locked}
                    >
                      <option value="handle">Handle (@username)</option>
                      <option value="url">Full URL</option>
                    </select>
                  </div>
                  
                  {/* Input Field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">
                      {isHandle ? 'Handle' : 'URL'}
                    </label>
                    <div className="relative">
                      {isHandle && (
                        <span className="absolute left-3 top-2 text-gray-500">@</span>
                      )}
                      <input
                        type="text"
                        value={narrative[`socialMediaValue${index}`] || ''}
                        onChange={(e) => onNarrativeChange(`socialMediaValue${index}`, e.target.value)}
                        className={`w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 ${
                          isHandle ? 'pl-8' : ''
                        }`}
                        placeholder={isHandle ? 'username' : 'https://...'}
                        disabled={locked}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <small className="text-gray-500 text-sm block mt-2">
            Add your organization's social media presence. Use handles (@username) or full URLs.
          </small>
        </div>

        {/* Videos */}
        <div className="mb-6">
          <label className="block font-semibold mb-4">
            Video Links
          </label>
          
          <div className="space-y-3">
            {/* Generate 5 video URL fields */}
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="flex gap-3 items-center">
                <div className="flex-1">
                  <input
                    type="url"
                    value={narrative[`videoUrl${index}`] || ''}
                    onChange={(e) => onNarrativeChange(`videoUrl${index}`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder={`Video URL ${index + 1} (YouTube, Vimeo, etc.)`}
                    disabled={locked}
                  />
                </div>
                <div className="text-sm text-gray-500 w-12">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
          
          <small className="text-gray-500 text-sm block mt-2">
            Add links to videos showcasing your organization's work (YouTube, Vimeo, etc.)
          </small>
        </div>

        {/* Search Keywords */}
        <div>
          <label htmlFor="searchKeywords" className="block font-semibold mb-2">
            Search Keywords
          </label>
          <input
            type="text"
            id="searchKeywords"
            value={narrative.searchKeywords || ''}
            onChange={(e) => onNarrativeChange('searchKeywords', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Keywords to help people find your organization (comma-separated)"
            disabled={locked}
          />
        </div>
      </div>

      {/* External Validation */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          External Validation and Documents
        </h3>

        {/* External Assessments */}
        <div className="mb-6">
          <label htmlFor="externalAssessments" className="block font-semibold mb-2">
            External Assessments
          </label>
          <textarea
            id="externalAssessments"
            value={narrative.externalAssessments || ''}
            onChange={(e) => onNarrativeChange('externalAssessments', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="List any external assessments or ratings (e.g., GuideStar, Charity Navigator)"
            disabled={locked}
          />
        </div>

        {/* Affiliations */}
        <div className="mb-6">
          <label htmlFor="affiliations" className="block font-semibold mb-2">
            Affiliations and Memberships
          </label>
          <textarea
            id="affiliations"
            value={narrative.affiliations || ''}
            onChange={(e) => onNarrativeChange('affiliations', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="List organizational affiliations and memberships"
            disabled={locked}
          />
        </div>

        {/* Annual Report */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Annual Report</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={(e) => handleFileChange('annualReport', e)}
              accept=".pdf,.doc,.docx"
              disabled={locked}
              className="block"
            />
            {narrative.annualReport && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">Annual report uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Strategic Plan */}
        <div>
          <label className="block font-semibold mb-2">Strategic Plan</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={(e) => handleFileChange('strategicPlan', e)}
              accept=".pdf,.doc,.docx"
              disabled={locked}
              className="block"
            />
            {narrative.strategicPlan && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm">Strategic plan uploaded</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto-save status */}
      {autoSaveStatus && (
        <div className="text-sm text-gray-600 italic text-right">
          {autoSaveStatus}
        </div>
      )}
    </div>
  );
};

export default NarrativeSection;