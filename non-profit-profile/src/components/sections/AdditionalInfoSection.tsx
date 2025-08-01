import React, { useState } from 'react';
import { 
  Info, FileText, Upload, Link, Award, Calendar,
  Globe, Users, Star, Zap, Heart, Target
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from '../RichTextEditor';

interface AdditionalInfoSectionProps {
  formData: any;
  errors: any;
  locked: boolean;
  onInputChange: (field: string, value: any) => void;
  onFileUpload?: (field: string, file: File) => void;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'achievements' | 'resources'>('general');

  return (
    <div className="space-y-6">
      {/* Additional Info Overview */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Info className="w-5 h-5 mr-2" />
          Additional Information
        </h3>
        
        <p className="text-gray-600 mb-4">
          This section allows you to provide any additional information that doesn't fit in other sections 
          but is important for understanding your organization.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-gray-600 text-gray-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              General Information
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'achievements'
                  ? 'border-gray-600 text-gray-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Achievements & Recognition
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'resources'
                  ? 'border-gray-600 text-gray-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Resources & Links
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Additional Organization Details */}
              <div>
                <label className="block font-semibold mb-2">
                  Additional Organization Details
                </label>
                <RichTextEditor
                  value={formData?.additionalDetails || ''}
                  onChange={(content) => onInputChange('additionalDetails', content)}
                  placeholder="Provide any additional information about your organization that wasn't covered in other sections..."
                  disabled={locked}
                  height={200}
                />
              </div>

              {/* Special Circumstances */}
              <div>
                <label className="block font-semibold mb-2">
                  Special Circumstances or Considerations
                </label>
                <RichTextEditor
                  value={formData?.specialCircumstances || ''}
                  onChange={(content) => onInputChange('specialCircumstances', content)}
                  placeholder="Describe any special circumstances, challenges, or unique aspects of your organization..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Future Plans */}
              <div>
                <label className="block font-semibold mb-2">
                  Future Plans & Vision
                </label>
                <RichTextEditor
                  value={formData?.futurePlans || ''}
                  onChange={(content) => onInputChange('futurePlans', content)}
                  placeholder="Describe your organization's future plans, goals, and vision for growth..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Organizational Culture */}
              <div>
                <label className="block font-semibold mb-2">
                  Organizational Culture & Values
                </label>
                <RichTextEditor
                  value={formData?.organizationalCulture || ''}
                  onChange={(content) => onInputChange('organizationalCulture', content)}
                  placeholder="Describe your organization's culture, work environment, and core values..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Community Impact */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2" />
                  Community Impact & Stories
                </h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Community Impact Stories
                  </label>
                  <textarea
                    value={formData?.communityImpactStories || ''}
                    onChange={(e) => onInputChange('communityImpactStories', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                    rows={4}
                    placeholder="Share specific stories or examples of your community impact..."
                    disabled={locked}
                  />
                </div>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block font-semibold mb-2">
                  Additional Comments or Information
                </label>
                <textarea
                  value={formData?.additionalComments || ''}
                  onChange={(e) => onInputChange('additionalComments', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                  rows={4}
                  placeholder="Any other information you'd like to share..."
                  disabled={locked}
                />
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              {/* Awards and Recognition */}
              <div>
                <label className="block font-semibold mb-2">
                  Awards & Recognition
                </label>
                <RichTextEditor
                  value={formData?.awardsRecognition || ''}
                  onChange={(content) => onInputChange('awardsRecognition', content)}
                  placeholder="List awards, certifications, recognition, and honors your organization has received..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Media Coverage */}
              <div>
                <label className="block font-semibold mb-2">
                  Media Coverage & Press
                </label>
                <RichTextEditor
                  value={formData?.mediaCoverage || ''}
                  onChange={(content) => onInputChange('mediaCoverage', content)}
                  placeholder="Describe notable media coverage, press mentions, or publicity your organization has received..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Certifications */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2" />
                  Certifications & Accreditations
                </h4>
                <div className="space-y-3">
                  {[
                    { field: 'guidestarSeal', label: 'GuideStar Seal of Transparency' },
                    { field: 'charityNavigator', label: 'Charity Navigator Rating' },
                    { field: 'betterBusinessBureau', label: 'BBB Wise Giving Alliance' },
                    { field: 'candid', label: 'Candid (Foundation Center) Profile' },
                    { field: 'nationalStandards', label: 'National Standards Compliance' },
                    { field: 'industryAccreditation', label: 'Industry-Specific Accreditation' }
                  ].map(cert => (
                    <label key={cert.field} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData?.[cert.field] || false}
                        onChange={(e) => onInputChange(cert.field, e.target.checked)}
                        className="rounded"
                        disabled={locked}
                      />
                      <span className="text-sm">{cert.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Certifications
                  </label>
                  <textarea
                    value={formData?.additionalCertifications || ''}
                    onChange={(e) => onInputChange('additionalCertifications', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                    rows={2}
                    placeholder="List any other certifications or accreditations..."
                    disabled={locked}
                  />
                </div>
              </div>

              {/* Notable Achievements */}
              <div>
                <label className="block font-semibold mb-2">
                  Notable Achievements & Milestones
                </label>
                <RichTextEditor
                  value={formData?.notableAchievements || ''}
                  onChange={(content) => onInputChange('notableAchievements', content)}
                  placeholder="Describe significant achievements, milestones, or accomplishments in your organization's history..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Supporting Documents */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Supporting Documentation
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Awards & Certificates
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('awardsCertificates', file);
                          toast.success('Awards documentation uploaded');
                        }
                      }}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      disabled={locked}
                      className="block"
                      multiple
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Media Clippings
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('mediaClippings', file);
                          toast.success('Media clippings uploaded');
                        }
                      }}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      disabled={locked}
                      className="block"
                      multiple
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              {/* Online Presence */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Online Presence & Resources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Website
                    </label>
                    <input
                      type="url"
                      value={formData?.organizationWebsite || ''}
                      onChange={(e) => onInputChange('organizationWebsite', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      placeholder="https://www.example.org"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Donation Page
                    </label>
                    <input
                      type="url"
                      value={formData?.donationPage || ''}
                      onChange={(e) => onInputChange('donationPage', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      placeholder="https://www.example.org/donate"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volunteer Portal
                    </label>
                    <input
                      type="url"
                      value={formData?.volunteerPortal || ''}
                      onChange={(e) => onInputChange('volunteerPortal', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      placeholder="https://www.example.org/volunteer"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Newsletter Signup
                    </label>
                    <input
                      type="url"
                      value={formData?.newsletterSignup || ''}
                      onChange={(e) => onInputChange('newsletterSignup', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      placeholder="https://www.example.org/newsletter"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h4 className="font-semibold mb-3">Social Media Profiles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { field: 'facebookUrl', label: 'Facebook' },
                    { field: 'twitterUrl', label: 'Twitter' },
                    { field: 'instagramUrl', label: 'Instagram' },
                    { field: 'linkedinUrl', label: 'LinkedIn' },
                    { field: 'youtubeUrl', label: 'YouTube' },
                    { field: 'tiktokUrl', label: 'TikTok' }
                  ].map(social => (
                    <div key={social.field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {social.label}
                      </label>
                      <input
                        type="url"
                        value={formData?.[social.field] || ''}
                        onChange={(e) => onInputChange(social.field, e.target.value)}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                        placeholder={`https://${social.label.toLowerCase()}.com/yourorg`}
                        disabled={locked}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Resources */}
              <div>
                <label className="block font-semibold mb-2">
                  Additional Resources & Links
                </label>
                <textarea
                  value={formData?.additionalResources || ''}
                  onChange={(e) => onInputChange('additionalResources', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                  rows={4}
                  placeholder="List any other relevant websites, resources, or links related to your organization..."
                  disabled={locked}
                />
              </div>

              {/* Publications */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Publications & Resources
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Research Publications
                    </label>
                    <textarea
                      value={formData?.researchPublications || ''}
                      onChange={(e) => onInputChange('researchPublications', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      rows={2}
                      placeholder="List any research, white papers, or publications by your organization..."
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Educational Materials
                    </label>
                    <textarea
                      value={formData?.educationalMaterials || ''}
                      onChange={(e) => onInputChange('educationalMaterials', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      rows={2}
                      placeholder="Describe educational resources, toolkits, or materials you've developed..."
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Additional Documents
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('additionalDocuments', file);
                          toast.success('Additional document uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      disabled={locked}
                      className="block"
                      multiple
                    />
                    <small className="text-gray-500 block mt-1">
                      Upload any additional documents that support your application
                    </small>
                  </div>
                </div>
              </div>

              {/* External Profiles */}
              <div>
                <h4 className="font-semibold mb-3">External Organization Profiles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GuideStar Profile
                    </label>
                    <input
                      type="url"
                      value={formData?.guidestarProfile || ''}
                      onChange={(e) => onInputChange('guidestarProfile', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      placeholder="GuideStar profile URL"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Charity Navigator Profile
                    </label>
                    <input
                      type="url"
                      value={formData?.charityNavigatorProfile || ''}
                      onChange={(e) => onInputChange('charityNavigatorProfile', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-gray-500"
                      placeholder="Charity Navigator profile URL"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoSection;