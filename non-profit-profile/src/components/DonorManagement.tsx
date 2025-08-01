import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign, TrendingUp, Calendar, Gift, Heart, Star, Trophy,
  Clock, Target, Users, Mail, Phone, FileText, Download,
  Filter, Search, Plus, Edit2, Eye, ChevronRight, AlertCircle,
  CheckCircle, BarChart3, PieChart, Activity, Zap, RefreshCw,
  CreditCard, Building2, User, Hash, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Contact } from '../types/NonprofitTypes';

// Extended donor interface
export interface DonorProfile extends Contact {
  donorInfo?: {
    donorId: string;
    firstDonationDate?: string;
    lastDonationDate?: string;
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    frequency: 'one-time' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
    donorType: 'individual' | 'corporate' | 'foundation' | 'government';
    givingLevel: 'major' | 'mid-level' | 'grassroots' | 'lapsed' | 'prospect';
    
    // Donation History
    donations: Array<{
      id: string;
      date: string;
      amount: number;
      type: 'cash' | 'check' | 'credit' | 'stock' | 'in-kind' | 'planned';
      campaign?: string;
      designation?: string;
      method: 'online' | 'mail' | 'event' | 'phone' | 'in-person';
      receiptNumber?: string;
      acknowledged: boolean;
      acknowledgedDate?: string;
      notes?: string;
    }>;
    
    // Pledges
    pledges: Array<{
      id: string;
      amount: number;
      startDate: string;
      endDate: string;
      frequency: 'monthly' | 'quarterly' | 'annual';
      amountPaid: number;
      status: 'active' | 'completed' | 'defaulted';
      campaign?: string;
    }>;
    
    // Preferences
    communicationPreferences: {
      preferredChannel: 'email' | 'mail' | 'phone' | 'none';
      emailFrequency: 'all' | 'quarterly' | 'annual' | 'none';
      mailingOptOut: boolean;
      anonymousGiving: boolean;
      publicRecognition: boolean;
    };
    
    // Interests & Engagement
    interests: string[];
    volunteerHours?: number;
    eventAttendance: string[];
    boardMember?: boolean;
    majorDonorStatus?: {
      level: string;
      since: string;
      relationship: string;
    };
    
    // Analytics
    retentionRisk: 'low' | 'medium' | 'high';
    engagementScore: number; // 0-100
    lifetimeValue: number;
    lastEngagement?: string;
    nextAskDate?: string;
    nextAskAmount?: number;
  };
}

interface DonorManagementProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
  onClose: () => void;
}

const DonorManagement: React.FC<DonorManagementProps> = ({
  contacts,
  onContactsChange,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'donors' | 'campaigns' | 'analytics'>('overview');
  const [selectedDonor, setSelectedDonor] = useState<DonorProfile | null>(null);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonorProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    givingLevel: '',
    donorType: '',
    dateRange: 'all',
    minAmount: '',
    maxAmount: ''
  });
  
  // Campaign Management
  const [campaigns, setCampaigns] = useState([
    {
      id: '1',
      name: 'Annual Fund 2024',
      goal: 500000,
      raised: 325000,
      donors: 145,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active'
    },
    {
      id: '2',
      name: 'Building Hope Capital Campaign',
      goal: 2000000,
      raised: 1250000,
      donors: 89,
      startDate: '2023-06-01',
      endDate: '2025-06-01',
      status: 'active'
    }
  ]);

  // Convert contacts to donor profiles
  const donors: DonorProfile[] = useMemo(() => {
    return contacts
      .filter(contact => contact.tags?.includes('donor') || contact.groups?.includes('donors'))
      .map(contact => {
        const donorProfile = contact as DonorProfile;
        
        // Initialize donor info if not present
        if (!donorProfile.donorInfo) {
          donorProfile.donorInfo = {
            donorId: `D${contact.id}`,
            totalDonations: 0,
            totalAmount: 0,
            averageDonation: 0,
            frequency: 'one-time',
            donorType: 'individual',
            givingLevel: 'prospect',
            donations: [],
            pledges: [],
            communicationPreferences: {
              preferredChannel: 'email',
              emailFrequency: 'quarterly',
              mailingOptOut: false,
              anonymousGiving: false,
              publicRecognition: true
            },
            interests: [],
            eventAttendance: [],
            retentionRisk: 'low',
            engagementScore: 75,
            lifetimeValue: 0
          };
        }
        
        return donorProfile;
      });
  }, [contacts]);

  // Calculate donor analytics
  const analytics = useMemo(() => {
    const totalDonors = donors.length;
    const totalRaised = donors.reduce((sum, d) => sum + (d.donorInfo?.totalAmount || 0), 0);
    const averageGift = totalDonors > 0 ? totalRaised / totalDonors : 0;
    
    const byLevel = {
      major: donors.filter(d => d.donorInfo?.givingLevel === 'major').length,
      midLevel: donors.filter(d => d.donorInfo?.givingLevel === 'mid-level').length,
      grassroots: donors.filter(d => d.donorInfo?.givingLevel === 'grassroots').length,
      lapsed: donors.filter(d => d.donorInfo?.givingLevel === 'lapsed').length
    };
    
    const retentionRate = donors.filter(d => d.donorInfo?.donations && d.donorInfo.donations.length > 1).length / totalDonors * 100 || 0;
    
    return {
      totalDonors,
      totalRaised,
      averageGift,
      byLevel,
      retentionRate,
      newDonorsThisYear: donors.filter(d => {
        const firstDonation = d.donorInfo?.firstDonationDate;
        return firstDonation && new Date(firstDonation).getFullYear() === new Date().getFullYear();
      }).length
    };
  }, [donors]);

  // Filter donors
  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesSearch = searchTerm === '' || 
        `${donor.firstName || ''} ${donor.lastName || ''} ${donor.organization || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = filters.givingLevel === '' || donor.donorInfo?.givingLevel === filters.givingLevel;
      const matchesType = filters.donorType === '' || donor.donorInfo?.donorType === filters.donorType;
      
      const amount = donor.donorInfo?.totalAmount || 0;
      const matchesMinAmount = filters.minAmount === '' || amount >= parseFloat(filters.minAmount);
      const matchesMaxAmount = filters.maxAmount === '' || amount <= parseFloat(filters.maxAmount);
      
      return matchesSearch && matchesLevel && matchesType && matchesMinAmount && matchesMaxAmount;
    });
  }, [donors, searchTerm, filters]);

  // Add donation to donor
  const addDonation = (donorId: number, donation: any) => {
    const updatedContacts = contacts.map(contact => {
      if (contact.id === donorId) {
        const donorProfile = contact as DonorProfile;
        const newDonation = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          acknowledged: false,
          ...donation
        };
        
        const donations = [...(donorProfile.donorInfo?.donations || []), newDonation];
        const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
        const totalDonations = donations.length;
        
        return {
          ...donorProfile,
          donorInfo: {
            ...donorProfile.donorInfo!,
            donations,
            totalAmount,
            totalDonations,
            averageDonation: totalAmount / totalDonations,
            lastDonationDate: newDonation.date
          }
        };
      }
      return contact;
    });
    
    onContactsChange(updatedContacts);
    toast.success('Donation recorded successfully');
  };

  // Update donor giving level based on total donations
  const updateGivingLevel = (donorId: number) => {
    const donor = donors.find(d => d.id === donorId);
    if (!donor || !donor.donorInfo) return;
    
    const totalAmount = donor.donorInfo.totalAmount;
    let givingLevel: typeof donor.donorInfo.givingLevel = 'grassroots';
    
    if (totalAmount >= 10000) givingLevel = 'major';
    else if (totalAmount >= 1000) givingLevel = 'mid-level';
    else if (donor.donorInfo.donations.length === 0) givingLevel = 'prospect';
    else if (donor.donorInfo.lastDonationDate && 
      new Date(donor.donorInfo.lastDonationDate) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
      givingLevel = 'lapsed';
    }
    
    const updatedContacts = contacts.map(contact => {
      if (contact.id === donorId) {
        const donorProfile = contact as DonorProfile;
        return {
          ...donorProfile,
          donorInfo: {
            ...donorProfile.donorInfo!,
            givingLevel
          }
        };
      }
      return contact;
    });
    
    onContactsChange(updatedContacts);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{analytics.totalDonors}</div>
          <div className="text-sm text-gray-600">Active Donors</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-gray-500">YTD</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${analytics.totalRaised.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Raised</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Gift className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-gray-500">Average</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${Math.round(analytics.averageGift).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Gift Size</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-gray-500">Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(analytics.retentionRate)}%
          </div>
          <div className="text-sm text-gray-600">Retention</div>
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Active Campaigns
        </h3>
        <div className="space-y-4">
          {campaigns.filter(c => c.status === 'active').map(campaign => {
            const progress = (campaign.raised / campaign.goal) * 100;
            return (
              <div key={campaign.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-gray-600">
                      {campaign.donors} donors • Ends {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      ${campaign.raised.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      of ${campaign.goal.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">{Math.round(progress)}% Complete</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Donor Segments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-purple-600" />
          Donor Segments
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analytics.byLevel.major}</div>
            <div className="text-sm text-gray-600">Major Donors</div>
            <div className="text-xs text-gray-500">$10,000+</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analytics.byLevel.midLevel}</div>
            <div className="text-sm text-gray-600">Mid-Level</div>
            <div className="text-xs text-gray-500">$1,000-$9,999</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analytics.byLevel.grassroots}</div>
            <div className="text-sm text-gray-600">Grassroots</div>
            <div className="text-xs text-gray-500">Under $1,000</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{analytics.byLevel.lapsed}</div>
            <div className="text-sm text-gray-600">Lapsed</div>
            <div className="text-xs text-gray-500">12+ months</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-orange-600" />
          Recent Donor Activity
        </h3>
        <div className="space-y-3">
          {donors
            .filter(d => d.donorInfo?.donations && d.donorInfo.donations.length > 0)
            .sort((a, b) => {
              const aDate = a.donorInfo?.lastDonationDate || '';
              const bDate = b.donorInfo?.lastDonationDate || '';
              return bDate.localeCompare(aDate);
            })
            .slice(0, 5)
            .map(donor => {
              const lastDonation = donor.donorInfo?.donations[donor.donorInfo.donations.length - 1];
              return (
                <div key={donor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{donor.firstName} {donor.lastName}</div>
                    <div className="text-sm text-gray-600">
                      {lastDonation?.campaign || 'General Fund'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      ${lastDonation?.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {lastDonation?.date && new Date(lastDonation.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );

  const renderDonorList = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search donors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filters.givingLevel}
            onChange={(e) => setFilters({ ...filters, givingLevel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            <option value="major">Major Donors</option>
            <option value="mid-level">Mid-Level</option>
            <option value="grassroots">Grassroots</option>
            <option value="lapsed">Lapsed</option>
            <option value="prospect">Prospects</option>
          </select>
          
          <select
            value={filters.donorType}
            onChange={(e) => setFilters({ ...filters, donorType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="individual">Individual</option>
            <option value="corporate">Corporate</option>
            <option value="foundation">Foundation</option>
            <option value="government">Government</option>
          </select>
        </div>
      </div>

      {/* Donor Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Donor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Given
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Gift
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDonors.map(donor => {
              const riskColor = {
                low: 'text-green-600',
                medium: 'text-yellow-600',
                high: 'text-red-600'
              }[donor.donorInfo?.retentionRisk || 'low'];
              
              return (
                <tr key={donor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donor.firstName} {donor.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{donor.email}</div>
                      {donor.organization && (
                        <div className="text-xs text-gray-500">{donor.organization}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${(donor.donorInfo?.totalAmount || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {donor.donorInfo?.totalDonations || 0} gifts
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {donor.donorInfo?.lastDonationDate ? 
                        new Date(donor.donorInfo.lastDonationDate).toLocaleDateString() : 
                        'No donations'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      donor.donorInfo?.givingLevel === 'major' ? 'bg-purple-100 text-purple-800' :
                      donor.donorInfo?.givingLevel === 'mid-level' ? 'bg-blue-100 text-blue-800' :
                      donor.donorInfo?.givingLevel === 'grassroots' ? 'bg-green-100 text-green-800' :
                      donor.donorInfo?.givingLevel === 'lapsed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {donor.donorInfo?.givingLevel || 'prospect'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${donor.donorInfo?.engagementScore || 0}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${riskColor}`}>
                        {donor.donorInfo?.engagementScore || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedDonor(donor)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingDonor(donor)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredDonors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No donors found</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDonorDetail = () => {
    if (!selectedDonor) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {selectedDonor.firstName} {selectedDonor.lastName}
            </h2>
            <button
              onClick={() => setSelectedDonor(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Donor Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Lifetime Giving</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${(selectedDonor.donorInfo?.totalAmount || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedDonor.donorInfo?.totalDonations || 0} donations
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Average Gift</div>
                <div className="text-2xl font-bold text-green-600">
                  ${(selectedDonor.donorInfo?.averageDonation || 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedDonor.donorInfo?.frequency || 'one-time'} donor
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Engagement Score</div>
                <div className="text-2xl font-bold text-purple-600">
                  {selectedDonor.donorInfo?.engagementScore || 0}%
                </div>
                <div className="text-sm text-gray-600">
                  {selectedDonor.donorInfo?.retentionRisk || 'low'} risk
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Email:</span> {selectedDonor.email}
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span> {selectedDonor.phone}
                </div>
                <div>
                  <span className="text-gray-600">Address:</span> {selectedDonor.address}, {selectedDonor.city}, {selectedDonor.state} {selectedDonor.zipCode}
                </div>
                <div>
                  <span className="text-gray-600">Preferred Contact:</span> {selectedDonor.donorInfo?.communicationPreferences.preferredChannel || 'email'}
                </div>
              </div>
            </div>

            {/* Donation History */}
            <div>
              <h3 className="font-semibold mb-3">Donation History</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedDonor.donorInfo?.donations.map(donation => (
                      <tr key={donation.id}>
                        <td className="px-4 py-2 text-sm">
                          {new Date(donation.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm font-semibold">
                          ${donation.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {donation.campaign || 'General Fund'}
                        </td>
                        <td className="px-4 py-2 text-sm capitalize">
                          {donation.method}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {donation.acknowledged ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Acknowledged
                            </span>
                          ) : (
                            <span className="text-yellow-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {(!selectedDonor.donorInfo?.donations || selectedDonor.donorInfo.donations.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No donation history
                  </div>
                )}
              </div>
            </div>

            {/* Add Donation Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setEditingDonor(selectedDonor);
                  setSelectedDonor(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Record New Donation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <Heart className="w-8 h-8 text-red-600" />
            <div>
              <h2 className="text-2xl font-bold">Donor Management</h2>
              <p className="text-sm text-gray-600">
                {analytics.totalDonors} donors • ${analytics.totalRaised.toLocaleString()} raised
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toast.info('Export functionality would be implemented here')}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'overview'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('donors')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'donors'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Donors
            </button>
            <button
              onClick={() => setActiveView('campaigns')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'campaigns'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'analytics'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'donors' && renderDonorList()}
          {activeView === 'campaigns' && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Campaign management coming soon</p>
            </div>
          )}
          {activeView === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Advanced analytics coming soon</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {selectedDonor && renderDonorDetail()}
      </div>
    </div>
  );
};

export default DonorManagement;