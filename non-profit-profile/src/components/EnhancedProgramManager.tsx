import React, { useState, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, Calendar, DollarSign, Users, Target,
  CheckCircle, Clock, AlertCircle, FileText, TrendingUp,
  Award, Building2, Briefcase, Gift, History, Eye,
  BarChart3, Heart, Star, ChevronRight, Download,
  Search, Filter, X, MapPin, Globe
} from 'lucide-react';
import { toast } from 'react-toastify';

// Enhanced Program with storytelling and funding history
interface EnhancedProgram {
  id: number;
  name: string;
  description: string;
  
  // Timeline
  startDate: string;
  endDate?: string;
  status: 'completed' | 'active' | 'paused' | 'planned';
  
  // Story Elements
  challenge: string; // What problem does this solve?
  approach: string; // How do we address it?
  theory_of_change: string; // Our theory of how change happens
  
  // Impact & Outcomes
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  outcomes: {
    description: string;
    metric: string;
    target: number;
    actual: number;
    verified: boolean;
    verificationDate?: string;
  }[];
  successStories: {
    title: string;
    story: string;
    date: string;
    beneficiaryName?: string;
    photo?: string;
  }[];
  
  // Funding History
  fundingHistory: {
    id: string;
    source: string;
    type: 'grant' | 'contract' | 'donation' | 'government' | 'corporate';
    amount: number;
    startDate: string;
    endDate: string;
    status: 'completed' | 'active' | 'pending';
    deliverables: string[];
    reporting: string[];
    contactPerson?: string;
    renewalLikelihood?: 'high' | 'medium' | 'low';
    notes?: string;
  }[];
  
  // Future Funding Pipeline
  fundingPipeline: {
    id: string;
    funder: string;
    type: 'grant' | 'contract' | 'partnership';
    amount: number;
    probability: number; // 0-100%
    submitDate?: string;
    decisionDate?: string;
    status: 'researching' | 'writing' | 'submitted' | 'under-review' | 'approved' | 'declined';
    notes: string;
    requirements: string[];
  }[];
  
  // Budget & Financials
  totalBudget: number;
  totalRaised: number;
  totalSpent: number;
  costPerBeneficiary: number;
  
  // Team & Partners
  team: {
    name: string;
    role: string;
    allocation: number; // % of time
    period: string;
  }[];
  partners: {
    name: string;
    type: 'implementing' | 'funding' | 'technical' | 'community';
    contribution: string;
    logo?: string;
  }[];
  
  // Documentation
  reports: {
    title: string;
    type: 'annual' | 'quarterly' | 'evaluation' | 'donor';
    date: string;
    url?: string;
  }[];
  media: {
    type: 'photo' | 'video' | 'article' | 'presentation';
    title: string;
    url: string;
    date: string;
  }[];
  
  // Metadata
  createdDate: string;
  lastModified: string;
  tags: string[];
  location?: string;
  website?: string;
}

interface EnhancedProgramManagerProps {
  programs: EnhancedProgram[];
  onProgramsChange: (programs: EnhancedProgram[]) => void;
  onClose: () => void;
}

const EnhancedProgramManager: React.FC<EnhancedProgramManagerProps> = ({
  programs,
  onProgramsChange,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'programs' | 'funding' | 'impact'>('overview');
  const [selectedProgram, setSelectedProgram] = useState<EnhancedProgram | null>(null);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<EnhancedProgram | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Calculate overall metrics
  const metrics = useMemo(() => {
    const totalBeneficiaries = programs.reduce((sum, p) => sum + (p.actualBeneficiaries || 0), 0);
    const totalFunding = programs.reduce((sum, p) => sum + p.totalRaised, 0);
    const totalSpent = programs.reduce((sum, p) => sum + p.totalSpent, 0);
    const activePrograms = programs.filter(p => p.status === 'active').length;
    
    // Funding pipeline
    const pipelineTotal = programs.reduce((sum, p) => 
      sum + p.fundingPipeline.reduce((pSum, f) => 
        pSum + (f.amount * f.probability / 100), 0
      ), 0
    );
    
    // Success rate
    const completedPrograms = programs.filter(p => p.status === 'completed');
    const successRate = completedPrograms.length > 0
      ? completedPrograms.filter(p => 
          p.outcomes.some(o => o.actual >= o.target)
        ).length / completedPrograms.length * 100
      : 0;
    
    return {
      totalBeneficiaries,
      totalFunding,
      totalSpent,
      activePrograms,
      pipelineTotal,
      successRate,
      totalPrograms: programs.length
    };
  }, [programs]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesSearch = searchTerm === '' || 
        (program.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (program.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [programs, searchTerm, filterStatus]);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-blue-700">All Time</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {metrics.totalBeneficiaries.toLocaleString()}
          </div>
          <div className="text-sm text-blue-700">People Served</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-sm text-green-700">Raised</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            ${metrics.totalFunding.toLocaleString()}
          </div>
          <div className="text-sm text-green-700">Total Funding</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-purple-700">Rate</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {Math.round(metrics.successRate)}%
          </div>
          <div className="text-sm text-purple-700">Success Rate</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-orange-700">Pipeline</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            ${Math.round(metrics.pipelineTotal).toLocaleString()}
          </div>
          <div className="text-sm text-orange-700">Expected Funding</div>
        </div>
      </div>

      {/* Active Programs Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Active Programs</h3>
        <div className="space-y-3">
          {programs
            .filter(p => p.status === 'active')
            .slice(0, 5)
            .map(program => {
              const fundingPercentage = program.totalBudget > 0 
                ? (program.totalRaised / program.totalBudget * 100)
                : 0;
              
              return (
                <div key={program.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{program.name}</h4>
                      <p className="text-sm text-gray-600">
                        {program.actualBeneficiaries.toLocaleString()} people served
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProgram(program)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Funding</span>
                      <span>{Math.round(fundingPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Active Funders */}
                  <div className="flex flex-wrap gap-1">
                    {program.fundingHistory
                      .filter(f => f.status === 'active')
                      .slice(0, 3)
                      .map((funding, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {funding.source}
                        </span>
                      ))}
                    {program.fundingHistory.filter(f => f.status === 'active').length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{program.fundingHistory.filter(f => f.status === 'active').length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Funding Pipeline */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Funding Pipeline</h3>
        <div className="space-y-2">
          {programs
            .flatMap(p => (p.fundingPipeline || []).map(f => ({ ...f, programName: p.name })))
            .filter(f => f.status !== 'declined')
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 10)
            .map((opportunity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{opportunity.funder}</div>
                  <div className="text-sm text-gray-600">{opportunity.programName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${opportunity.amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">
                    {opportunity.probability}% probability
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  opportunity.status === 'approved' ? 'bg-green-100 text-green-700' :
                  opportunity.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  opportunity.status === 'under-review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {opportunity.status}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderProgramList = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
          <option value="planned">Planned</option>
        </select>
        
        <button
          onClick={() => setShowProgramForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Program
        </button>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrograms.map(program => (
          <div key={program.id} className="bg-white rounded-lg border p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{program.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    program.status === 'active' ? 'bg-green-100 text-green-700' :
                    program.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    program.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {program.status}
                  </span>
                  {program.location && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {program.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedProgram(program)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Eye className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setEditingProgram(program)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <p className="text-gray-700 mb-4 line-clamp-2">{program.description}</p>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {program.actualBeneficiaries.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">People Served</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${(program.totalRaised / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-gray-600">Raised</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {program.fundingHistory.filter(f => f.status === 'active').length}
                </div>
                <div className="text-xs text-gray-600">Active Funders</div>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Budget Progress</span>
                <span>${program.totalRaised.toLocaleString()} / ${program.totalBudget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min((program.totalRaised / program.totalBudget) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Recent Success Story */}
            {program.successStories.length > 0 && (
              <div className="bg-green-50 p-3 rounded text-sm">
                <p className="text-green-800 italic line-clamp-2">
                  "{program.successStories[0].story}"
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFundingView = () => (
    <div className="space-y-6">
      {/* Funding History Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Funding History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Funder</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {programs.flatMap(program => 
                (program.fundingHistory || []).map(funding => ({
                  ...funding,
                  programName: program.name
                }))
              )
              .sort((a, b) => b.startDate.localeCompare(a.startDate))
              .map((funding, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{funding.source}</div>
                    {funding.contactPerson && (
                      <div className="text-xs text-gray-500">{funding.contactPerson}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{funding.programName}</td>
                  <td className="px-4 py-3 font-semibold">${funding.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(funding.startDate).toLocaleDateString()} - 
                    {new Date(funding.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      funding.status === 'active' ? 'bg-green-100 text-green-700' :
                      funding.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {funding.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm capitalize">{funding.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline Opportunities */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Grant Pipeline</h3>
        <div className="space-y-3">
          {programs.flatMap(program => 
            (program.fundingPipeline || []).map(opp => ({
              ...opp,
              programName: program.name
            }))
          )
          .sort((a, b) => {
            const statusOrder = ['approved', 'under-review', 'submitted', 'writing', 'researching', 'declined'];
            return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          })
          .map((opportunity, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{opportunity.funder}</h4>
                  <p className="text-sm text-gray-600">{opportunity.programName}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg">${opportunity.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{opportunity.probability}% probability</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  opportunity.status === 'approved' ? 'bg-green-100 text-green-700' :
                  opportunity.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                  opportunity.status === 'under-review' ? 'bg-yellow-100 text-yellow-700' :
                  opportunity.status === 'declined' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {opportunity.status.replace('-', ' ')}
                </span>
                
                {opportunity.decisionDate && (
                  <span className="text-sm text-gray-600">
                    Decision: {new Date(opportunity.decisionDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {opportunity.notes && (
                <p className="text-sm text-gray-600 mt-2">{opportunity.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderImpactView = () => (
    <div className="space-y-6">
      {/* Impact Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold mb-4">Total Impact</h4>
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold text-blue-600">
                {metrics.totalBeneficiaries.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Lives Impacted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(metrics.totalSpent / metrics.totalBeneficiaries || 0)}
              </div>
              <div className="text-sm text-gray-600">Cost per Beneficiary</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold mb-4">Success Stories</h4>
          <div className="text-3xl font-bold text-purple-600">
            {programs.reduce((sum, p) => sum + p.successStories.length, 0)}
          </div>
          <div className="text-sm text-gray-600">Stories Documented</div>
          <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
            View Story Library →
          </button>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="font-semibold mb-4">Outcome Achievement</h4>
          <div className="space-y-2">
            {programs.slice(0, 3).map(program => {
              const achievedOutcomes = program.outcomes.filter(o => o.actual >= o.target).length;
              const totalOutcomes = program.outcomes.length;
              const percentage = totalOutcomes > 0 ? (achievedOutcomes / totalOutcomes * 100) : 0;
              
              return (
                <div key={program.id}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{program.name}</span>
                    <span>{Math.round(percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Success Stories */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Recent Success Stories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs
            .flatMap(p => (p.successStories || []).map(s => ({ ...s, programName: p.name })))
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 4)
            .map((story, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{story.title}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(story.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{story.programName}</p>
                <p className="text-sm italic text-gray-700 line-clamp-3">
                  "{story.story}"
                </p>
                {story.beneficiaryName && (
                  <p className="text-xs text-gray-600 mt-2">— {story.beneficiaryName}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center space-x-4">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Program Management & Impact</h2>
              <p className="text-sm text-gray-600">
                {metrics.activePrograms} active programs serving {metrics.totalBeneficiaries.toLocaleString()} people
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toast.info('Impact report generation would be implemented here')}
              className="px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'overview'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('programs')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'programs'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Programs
            </button>
            <button
              onClick={() => setActiveView('funding')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'funding'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Funding
            </button>
            <button
              onClick={() => setActiveView('impact')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'impact'
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Impact
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'programs' && renderProgramList()}
          {activeView === 'funding' && renderFundingView()}
          {activeView === 'impact' && renderImpactView()}
        </div>

        {/* Program Detail Modal */}
        {selectedProgram && (
          <ProgramDetailModal
            program={selectedProgram}
            onClose={() => setSelectedProgram(null)}
          />
        )}
      </div>
    </div>
  );
};

// Program Detail Modal Component
const ProgramDetailModal: React.FC<{
  program: EnhancedProgram;
  onClose: () => void;
}> = ({ program, onClose }) => {
  const fundingPercentage = program.totalBudget > 0 
    ? (program.totalRaised / program.totalBudget * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold">{program.name}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  program.status === 'active' ? 'bg-green-100 text-green-700' :
                  program.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {program.status}
                </span>
                <span className="text-gray-600">
                  {new Date(program.startDate).toLocaleDateString()} - 
                  {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Program Story */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Challenge</h4>
              <p className="text-gray-700">{program.challenge}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Approach</h4>
              <p className="text-gray-700">{program.approach}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Theory of Change</h4>
              <p className="text-gray-700">{program.theory_of_change}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {program.actualBeneficiaries.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">People Served</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                ${program.totalRaised.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Raised</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${program.costPerBeneficiary}
              </div>
              <div className="text-sm text-gray-600">Cost per Person</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(fundingPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Funded</div>
            </div>
          </div>

          {/* Outcomes */}
          <div>
            <h4 className="font-semibold mb-3">Outcomes & Impact</h4>
            <div className="space-y-3">
              {program.outcomes.map((outcome, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{outcome.description}</p>
                      <p className="text-sm text-gray-600">{outcome.metric}</p>
                    </div>
                    {outcome.verified && (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{outcome.actual} / {outcome.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            outcome.actual >= outcome.target ? 'bg-green-600' : 'bg-blue-600'
                          }`}
                          style={{ 
                            width: `${Math.min((outcome.actual / outcome.target) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Funding */}
          <div>
            <h4 className="font-semibold mb-3">Current Funding Partners</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {program.fundingHistory
                .filter(f => f.status === 'active')
                .map((funding, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{funding.source}</h5>
                        <p className="text-sm text-gray-600">{funding.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${funding.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">
                          {new Date(funding.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {funding.renewalLikelihood && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          funding.renewalLikelihood === 'high' ? 'bg-green-100 text-green-700' :
                          funding.renewalLikelihood === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {funding.renewalLikelihood} renewal likelihood
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Success Stories */}
          {program.successStories.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Success Stories</h4>
              <div className="space-y-3">
                {program.successStories.slice(0, 3).map((story, i) => (
                  <div key={i} className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-medium mb-2">{story.title}</h5>
                    <p className="text-gray-700 italic">"{story.story}"</p>
                    {story.beneficiaryName && (
                      <p className="text-sm text-gray-600 mt-2">
                        — {story.beneficiaryName}, {new Date(story.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProgramManager;