import React, { useState } from 'react';
import { 
  Gift, DollarSign, TrendingUp, Users, Calendar, 
  BarChart3, PieChart, Target, Heart, Star
} from 'lucide-react';
import { toast } from 'react-toastify';
import RichTextEditor from './RichTextEditor';

interface DonationsSectionProps {
  formData: any;
  errors: any;
  locked: boolean;
  onInputChange: (field: string, value: any) => void;
  onFileUpload?: (field: string, file: File) => void;
}

const DonationsSection: React.FC<DonationsSectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'stewardship'>('overview');

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];

  return (
    <div className="space-y-6">
      {/* Donations Overview */}
      <div className="bg-rose-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Gift className="w-5 h-5 mr-2" />
          Fundraising & Donations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-rose-600">
              ${(formData?.totalDonationsLastYear || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Last Year Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {formData?.totalDonors || 0}
            </div>
            <div className="text-sm text-gray-600">Total Donors</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${(formData?.averageDonation || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Average Donation</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formData?.donorRetentionRate || 0}%
            </div>
            <div className="text-sm text-gray-600">Retention Rate</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Donation Overview
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Campaigns & Events
            </button>
            <button
              onClick={() => setActiveTab('stewardship')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'stewardship'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Donor Stewardship
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Annual Donation Data */}
              <div>
                <h4 className="font-semibold mb-4">Annual Donation History</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {years.map(year => (
                    <div key={year} className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-medium mb-3">{year}</h5>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Total Donations</label>
                          <input
                            type="number"
                            value={formData?.[`donations${year}`] || ''}
                            onChange={(e) => onInputChange(`donations${year}`, e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                            placeholder="$0"
                            disabled={locked}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Number of Donors</label>
                          <input
                            type="number"
                            value={formData?.[`donors${year}`] || ''}
                            onChange={(e) => onInputChange(`donors${year}`, e.target.value)}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                            placeholder="0"
                            disabled={locked}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donation Sources */}
              <div>
                <h4 className="font-semibold mb-4">Donation Sources</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Individual Donations (%)</label>
                    <input
                      type="number"
                      value={formData?.individualDonationsPercent || ''}
                      onChange={(e) => onInputChange('individualDonationsPercent', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      placeholder="0"
                      max="100"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Corporate Donations (%)</label>
                    <input
                      type="number"
                      value={formData?.corporateDonationsPercent || ''}
                      onChange={(e) => onInputChange('corporateDonationsPercent', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      placeholder="0"
                      max="100"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Foundation Grants (%)</label>
                    <input
                      type="number"
                      value={formData?.foundationGrantsPercent || ''}
                      onChange={(e) => onInputChange('foundationGrantsPercent', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      placeholder="0"
                      max="100"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Online Donations (%)</label>
                    <input
                      type="number"
                      value={formData?.onlineDonationsPercent || ''}
                      onChange={(e) => onInputChange('onlineDonationsPercent', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      placeholder="0"
                      max="100"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* Fundraising Strategy */}
              <div>
                <label className="block font-semibold mb-2">
                  Overall Fundraising Strategy
                </label>
                <RichTextEditor
                  value={formData?.fundraisingStrategy || ''}
                  onChange={(content) => onInputChange('fundraisingStrategy', content)}
                  placeholder="Describe your organization's fundraising approach and strategy..."
                  disabled={locked}
                  height={150}
                />
              </div>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              {/* Major Campaigns */}
              <div>
                <label className="block font-semibold mb-2">
                  Major Fundraising Campaigns
                </label>
                <RichTextEditor
                  value={formData?.majorCampaigns || ''}
                  onChange={(content) => onInputChange('majorCampaigns', content)}
                  placeholder="Describe major fundraising campaigns, capital campaigns, or special initiatives..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Annual Events */}
              <div>
                <label className="block font-semibold mb-2">
                  Annual Fundraising Events
                </label>
                <RichTextEditor
                  value={formData?.annualEvents || ''}
                  onChange={(content) => onInputChange('annualEvents', content)}
                  placeholder="List and describe annual fundraising events (galas, runs, auctions, etc.)..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Digital Fundraising */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2" />
                  Digital Fundraising
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Online Donation Platform
                    </label>
                    <input
                      type="text"
                      value={formData?.donationPlatform || ''}
                      onChange={(e) => onInputChange('donationPlatform', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      placeholder="e.g., PayPal, Stripe, DonorBox"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Social Media Fundraising
                    </label>
                    <textarea
                      value={formData?.socialMediaFundraising || ''}
                      onChange={(e) => onInputChange('socialMediaFundraising', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      rows={3}
                      placeholder="Describe your social media fundraising efforts..."
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peer-to-Peer Fundraising
                    </label>
                    <textarea
                      value={formData?.peerToPeerFundraising || ''}
                      onChange={(e) => onInputChange('peerToPeerFundraising', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      rows={3}
                      placeholder="How do supporters fundraise on your behalf?"
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* Campaign Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2">
                    Most Successful Campaign
                  </label>
                  <textarea
                    value={formData?.mostSuccessfulCampaign || ''}
                    onChange={(e) => onInputChange('mostSuccessfulCampaign', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                    rows={3}
                    placeholder="Describe your most successful fundraising campaign..."
                    disabled={locked}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">
                    Lessons Learned
                  </label>
                  <textarea
                    value={formData?.fundraisingLessons || ''}
                    onChange={(e) => onInputChange('fundraisingLessons', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                    rows={3}
                    placeholder="What have you learned from fundraising efforts?"
                    disabled={locked}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stewardship Tab */}
          {activeTab === 'stewardship' && (
            <div className="space-y-6">
              {/* Donor Recognition */}
              <div>
                <label className="block font-semibold mb-2">
                  Donor Recognition Program
                </label>
                <RichTextEditor
                  value={formData?.donorRecognition || ''}
                  onChange={(content) => onInputChange('donorRecognition', content)}
                  placeholder="Describe how you recognize and thank donors..."
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Communication Strategy */}
              <div>
                <label className="block font-semibold mb-2">
                  Donor Communication Strategy
                </label>
                <RichTextEditor
                  value={formData?.donorCommunication || ''}
                  onChange={(content) => onInputChange('donorCommunication', content)}
                  placeholder="How do you communicate with donors throughout the year?"
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Donor Categories */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Donor Categories & Benefits
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Major Donor Threshold
                    </label>
                    <input
                      type="number"
                      value={formData?.majorDonorThreshold || ''}
                      onChange={(e) => onInputChange('majorDonorThreshold', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      placeholder="$1,000"
                      disabled={locked}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Membership/Giving Levels
                    </label>
                    <textarea
                      value={formData?.givingLevels || ''}
                      onChange={(e) => onInputChange('givingLevels', e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                      rows={4}
                      placeholder="List your donor recognition levels and benefits..."
                      disabled={locked}
                    />
                  </div>
                </div>
              </div>

              {/* Retention Strategies */}
              <div>
                <label className="block font-semibold mb-2">
                  Donor Retention Strategies
                </label>
                <RichTextEditor
                  value={formData?.retentionStrategies || ''}
                  onChange={(content) => onInputChange('retentionStrategies', content)}
                  placeholder="How do you work to retain donors year over year?"
                  disabled={locked}
                  height={150}
                />
              </div>

              {/* Legacy Giving */}
              <div>
                <label className="block font-semibold mb-2">
                  Legacy & Planned Giving Program
                </label>
                <textarea
                  value={formData?.legacyGiving || ''}
                  onChange={(e) => onInputChange('legacyGiving', e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-rose-500"
                  rows={3}
                  placeholder="Describe your planned giving or legacy program..."
                  disabled={locked}
                />
              </div>

              {/* Fundraising Documentation */}
              <div className="bg-rose-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Fundraising Documentation</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fundraising Plan
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('fundraisingPlan', file);
                          toast.success('Fundraising plan uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx"
                      disabled={locked}
                      className="block"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Donor Reports
                    </label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onFileUpload) {
                          onFileUpload('donorReports', file);
                          toast.success('Donor reports uploaded');
                        }
                      }}
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      disabled={locked}
                      className="block"
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

export default DonationsSection;