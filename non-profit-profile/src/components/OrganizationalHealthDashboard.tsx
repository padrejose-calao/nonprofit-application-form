import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Users, DollarSign, Target, Heart, Shield,
  CheckCircle, AlertCircle, Activity, Award, Building2,
  FileText, Calendar, Globe, Star, BarChart3, PieChart,
  Clock, Zap, Bookmark, Flag, ChevronRight, Eye, Download,
  RefreshCw, X, Info, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import { Contact } from '../types/NonprofitTypes';

interface OrganizationalMetrics {
  // Financial Health
  financialHealth: {
    totalRevenue: number;
    diversityScore: number; // Revenue source diversity
    fundingStability: number; // Recurring vs one-time
    cashReserves: number; // Months of operating expenses
    overhead: number; // Admin costs percentage
    fundraisingEfficiency: number; // Cost to raise $1
  };
  
  // Program Effectiveness
  programEffectiveness: {
    totalBeneficiaries: number;
    costPerBeneficiary: number;
    outcomeAchievementRate: number;
    programRetentionRate: number;
    evidenceBasedPractices: number;
  };
  
  // Governance & Compliance
  governance: {
    boardSize: number;
    boardIndependence: number;
    meetingAttendance: number;
    policyCompleteness: number;
    complianceRate: number;
    transparencyScore: number;
  };
  
  // Organizational Capacity
  capacity: {
    staffRetention: number;
    volunteerEngagement: number;
    technologyAdoption: number;
    strategicPlanningScore: number;
    partnershipStrength: number;
    innovationIndex: number;
  };
  
  // Impact & Sustainability
  impact: {
    missionAlignment: number;
    communityTrust: number;
    mediaVisibility: number;
    donorRetention: number;
    growthTrajectory: number;
    futureViability: number;
  };
}

interface HealthScore {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'fair' | 'poor';
  recommendations: string[];
}

interface OrganizationalHealthDashboardProps {
  onClose: () => void;
  contacts: Contact[];
  programs: any[];
  events: any[];
  compliance: any[];
  formData: any;
}

const OrganizationalHealthDashboard: React.FC<OrganizationalHealthDashboardProps> = ({
  onClose,
  contacts,
  programs,
  events,
  compliance,
  formData
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'financial' | 'programs' | 'governance' | 'capacity'>('overview');

  // Calculate organizational metrics
  const metrics: OrganizationalMetrics = useMemo(() => {
    // Financial Health Calculations
    const donors = contacts.filter(c => (c.groups || []).includes('donors') || (c.tags || []).includes('donor'));
    const totalRevenue = formData?.totalRevenue || 500000;
    const diversityScore = Math.min(100, (donors.length / 10) * 100); // More diverse donor base = higher score
    const fundingStability = 75; // Mock calculation based on recurring donors
    const cashReserves = 6; // Mock months of reserves
    const overhead = 15; // Mock overhead percentage
    const fundraisingEfficiency = 0.18; // Cost to raise $1

    // Program Effectiveness
    const totalBeneficiaries = programs.reduce((sum, p) => sum + (p.actualBeneficiaries || 0), 0) || 1000;
    const costPerBeneficiary = totalRevenue / totalBeneficiaries;
    const outcomeAchievementRate = 85; // Mock rate of outcomes achieved
    const programRetentionRate = 78; // Mock beneficiary retention rate
    const evidenceBasedPractices = 90; // Mock score for evidence-based methods

    // Governance & Compliance
    const boardMembers = contacts.filter(c => (c.groups || []).includes('board')).length;
    const boardSize = Math.max(boardMembers, formData?.boardSizeMin || 5);
    const boardIndependence = 88; // Mock independence score
    const meetingAttendance = 82; // Mock average attendance
    const policyCompleteness = compliance.filter(c => c.status === 'compliant').length / compliance.length * 100 || 90;
    const complianceRate = policyCompleteness;
    const transparencyScore = 95; // Mock transparency score

    // Organizational Capacity
    const staffCount = contacts.filter(c => (c.groups || []).includes('staff')).length || 10;
    const staffRetention = 89; // Mock retention rate
    const volunteerCount = contacts.filter(c => (c.groups || []).includes('volunteers')).length || 50;
    const volunteerEngagement = Math.min(100, volunteerCount * 2); // More volunteers = higher engagement
    const technologyAdoption = 75; // Mock tech adoption score
    const strategicPlanningScore = 88; // Mock strategic planning score
    const partnershipStrength = Math.min(100, programs.length * 15); // More programs = more partnerships
    const innovationIndex = 72; // Mock innovation score

    // Impact & Sustainability
    const missionAlignment = 92; // Mock mission alignment score
    const communityTrust = 87; // Mock community trust score
    const mediaVisibility = events.length * 10; // More events = more visibility
    const donorRetention = 76; // Mock donor retention rate
    const growthTrajectory = 83; // Mock growth trajectory
    const futureViability = 88; // Mock future viability score

    return {
      financialHealth: {
        totalRevenue,
        diversityScore,
        fundingStability,
        cashReserves,
        overhead,
        fundraisingEfficiency
      },
      programEffectiveness: {
        totalBeneficiaries,
        costPerBeneficiary,
        outcomeAchievementRate,
        programRetentionRate,
        evidenceBasedPractices
      },
      governance: {
        boardSize,
        boardIndependence,
        meetingAttendance,
        policyCompleteness,
        complianceRate,
        transparencyScore
      },
      capacity: {
        staffRetention,
        volunteerEngagement,
        technologyAdoption,
        strategicPlanningScore,
        partnershipStrength,
        innovationIndex
      },
      impact: {
        missionAlignment,
        communityTrust,
        mediaVisibility: Math.min(100, mediaVisibility),
        donorRetention,
        growthTrajectory,
        futureViability
      }
    };
  }, [contacts, programs, events, compliance, formData]);

  // Calculate health scores
  const healthScores: HealthScore[] = useMemo(() => {
    const calculateCategoryScore = (categoryMetrics: any) => {
      const values = Object.values(categoryMetrics) as number[];
      return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
    };

    const getStatus = (score: number): HealthScore['status'] => {
      if (score >= 90) return 'excellent';
      if (score >= 75) return 'good';
      if (score >= 60) return 'fair';
      return 'poor';
    };

    const getTrend = (): HealthScore['trend'] => {
      // Mock trend calculation - in real app, compare with historical data
      return Math.random() > 0.7 ? 'up' : Math.random() > 0.5 ? 'stable' : 'down';
    };

    const getRecommendations = (category: string, score: number): string[] => {
      const recommendations: Record<string, string[]> = {
        'Financial Health': score < 75 ? [
          'Diversify funding sources to reduce dependency risk',
          'Build 6+ months of operating reserves',
          'Improve fundraising efficiency through donor stewardship'
        ] : ['Maintain strong financial oversight', 'Continue donor cultivation efforts'],
        
        'Program Effectiveness': score < 80 ? [
          'Implement stronger outcome measurement systems',
          'Enhance beneficiary feedback collection',
          'Invest in evidence-based program models'
        ] : ['Document success stories for stakeholder communication', 'Share best practices with peer organizations'],
        
        'Governance': score < 85 ? [
          'Recruit diverse board members with needed expertise',
          'Implement board training and orientation programs',
          'Strengthen board committee structure'
        ] : ['Maintain strong governance practices', 'Consider board succession planning'],
        
        'Organizational Capacity': score < 75 ? [
          'Invest in staff professional development',
          'Upgrade technology infrastructure',
          'Develop strategic partnerships'
        ] : ['Continue building organizational capabilities', 'Foster innovation culture'],
        
        'Impact & Sustainability': score < 80 ? [
          'Strengthen community engagement strategies',
          'Develop comprehensive impact measurement',
          'Build long-term sustainability plan'
        ] : ['Amplify success stories', 'Share impact broadly with stakeholders']
      };
      
      return recommendations[category] || [];
    };

    return [
      {
        category: 'Financial Health',
        score: calculateCategoryScore(metrics.financialHealth),
        trend: getTrend(),
        status: getStatus(calculateCategoryScore(metrics.financialHealth)),
        recommendations: getRecommendations('Financial Health', calculateCategoryScore(metrics.financialHealth))
      },
      {
        category: 'Program Effectiveness',
        score: calculateCategoryScore(metrics.programEffectiveness),
        trend: getTrend(),
        status: getStatus(calculateCategoryScore(metrics.programEffectiveness)),
        recommendations: getRecommendations('Program Effectiveness', calculateCategoryScore(metrics.programEffectiveness))
      },
      {
        category: 'Governance',
        score: calculateCategoryScore(metrics.governance),
        trend: getTrend(),
        status: getStatus(calculateCategoryScore(metrics.governance)),
        recommendations: getRecommendations('Governance', calculateCategoryScore(metrics.governance))
      },
      {
        category: 'Organizational Capacity',
        score: calculateCategoryScore(metrics.capacity),
        trend: getTrend(),
        status: getStatus(calculateCategoryScore(metrics.capacity)),
        recommendations: getRecommendations('Organizational Capacity', calculateCategoryScore(metrics.capacity))
      },
      {
        category: 'Impact & Sustainability',
        score: calculateCategoryScore(metrics.impact),
        trend: getTrend(),
        status: getStatus(calculateCategoryScore(metrics.impact)),
        recommendations: getRecommendations('Impact & Sustainability', calculateCategoryScore(metrics.impact))
      }
    ];
  }, [metrics]);

  const overallScore = Math.round(healthScores.reduce((sum, hs) => sum + hs.score, 0) / healthScores.length);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-blue-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Overall Organizational Health</h3>
            <p className="text-sm text-gray-600">Based on financial, program, governance, capacity, and impact metrics</p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-sm text-gray-600">out of 100</div>
            <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
              overallScore >= 90 ? 'bg-green-100 text-green-700' :
              overallScore >= 75 ? 'bg-blue-100 text-blue-700' :
              overallScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {overallScore >= 90 ? 'Excellent' :
               overallScore >= 75 ? 'Good' :
               overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>

      {/* Health Score Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthScores.map((health, index) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${getScoreBgColor(health.score)} border-gray-200`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{health.category}</h4>
              <div className="flex items-center gap-1">
                {health.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-600" />}
                {health.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-600" />}
                {health.trend === 'stable' && <Minus className="w-4 h-4 text-gray-600" />}
                <span className={`text-2xl font-bold ${getScoreColor(health.score)}`}>
                  {health.score}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${
                  health.score >= 90 ? 'bg-green-600' :
                  health.score >= 75 ? 'bg-blue-600' :
                  health.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${health.score}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Recommendations:</div>
              <ul className="space-y-1">
                {health.recommendations.slice(0, 2).map((rec, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-gray-400 mr-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            ${metrics.financialHealth.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Annual Revenue</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.programEffectiveness.totalBeneficiaries.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">People Served</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border text-center">
          <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {metrics.governance.boardSize}
          </div>
          <div className="text-sm text-gray-600">Board Members</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border text-center">
          <Activity className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {programs.length}
          </div>
          <div className="text-sm text-gray-600">Active Programs</div>
        </div>
      </div>

      {/* Comparative Benchmarks */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="font-semibold mb-4">Benchmark Comparison</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Overhead Ratio</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Industry Avg: 20%</span>
              <span className={`font-semibold ${metrics.financialHealth.overhead <= 15 ? 'text-green-600' : 'text-yellow-600'}`}>
                Your Org: {metrics.financialHealth.overhead}%
              </span>
              {metrics.financialHealth.overhead <= 15 && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Donor Retention Rate</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Industry Avg: 70%</span>
              <span className={`font-semibold ${metrics.impact.donorRetention >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                Your Org: {metrics.impact.donorRetention}%
              </span>
              {metrics.impact.donorRetention >= 70 && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Cost per Beneficiary</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Similar Orgs: $750</span>
              <span className={`font-semibold ${metrics.programEffectiveness.costPerBeneficiary <= 750 ? 'text-green-600' : 'text-yellow-600'}`}>
                Your Org: ${Math.round(metrics.programEffectiveness.costPerBeneficiary)}
              </span>
              {metrics.programEffectiveness.costPerBeneficiary <= 750 && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedView = (category: string) => {
    const health = healthScores.find(h => (h.category || '').toLowerCase().includes(category.toLowerCase()));
    if (!health) return null;

    const categoryMetrics = category === 'financial' ? metrics.financialHealth :
                           category === 'programs' ? metrics.programEffectiveness :
                           category === 'governance' ? metrics.governance :
                           metrics.capacity;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">{health.category} Details</h3>
          <div className={`px-4 py-2 rounded-lg ${getScoreBgColor(health.score)}`}>
            <span className={`text-lg font-bold ${getScoreColor(health.score)}`}>
              {health.score}/100
            </span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryMetrics).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {typeof value === 'number' ? 
                    ((key || '').includes('Revenue') || (key || '').includes('cost') || (key || '').includes('reserves') ? 
                      `$${value.toLocaleString()}` : 
                      (key || '').includes('Rate') || (key || '').includes('Score') || (key || '').includes('Percentage') || (key || '').includes('overhead') || (key || '').includes('efficiency') ?
                        `${value}%` :
                        value.toLocaleString()
                    ) : value}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full"
                  style={{ width: `${Math.min(100, typeof value === 'number' ? value : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Improvement Recommendations
          </h4>
          <div className="space-y-2">
            {health.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <Activity className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold">Organizational Health Dashboard</h2>
              <p className="text-sm text-gray-600">
                Comprehensive health assessment for charity ratings and stakeholder reporting
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="px-4 py-2 text-gray-700 hover:bg-white/50 rounded-lg flex items-center"
              onClick={() => window.print()}
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
                  ? 'border-green-600 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Health Overview
            </button>
            <button
              onClick={() => setActiveView('financial')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'financial'
                  ? 'border-green-600 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Financial Health
            </button>
            <button
              onClick={() => setActiveView('programs')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'programs'
                  ? 'border-green-600 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Program Effectiveness
            </button>
            <button
              onClick={() => setActiveView('governance')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'governance'
                  ? 'border-green-600 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Governance
            </button>
            <button
              onClick={() => setActiveView('capacity')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeView === 'capacity'
                  ? 'border-green-600 text-green-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Organizational Capacity
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'financial' && renderDetailedView('financial')}
          {activeView === 'programs' && renderDetailedView('programs')}
          {activeView === 'governance' && renderDetailedView('governance')}
          {activeView === 'capacity' && renderDetailedView('capacity')}
        </div>
      </div>
    </div>
  );
};

export default OrganizationalHealthDashboard;