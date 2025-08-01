import React, { useState, useMemo } from 'react';
import {
  Heart,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Award,
  Target,
  Camera,
  Video,
  FileText,
  Share2,
  Download,
  Upload,
  Edit,
  Plus,
  Star,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Zap,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Copy,
  Filter,
  Search,
  X,
  Play,
  Pause,
  Image as ImageIcon,
  BookOpen,
  Globe,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SectionLock, usePermissions } from './PermissionsLocker';
// import StandardizedNarrativeField from './StandardizedNarrativeField';

interface ImpactMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  description: string;
  category: 'people' | 'programs' | 'financial' | 'community' | 'environmental';
  timeframe: string;
  source: string;
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    comparisonPeriod: string;
  };
  visualizationType: 'number' | 'percentage' | 'chart' | 'progress';
  isHighlighted: boolean;
}

interface Story {
  id: string;
  title: string;
  content: string;
  type: 'success_story' | 'case_study' | 'testimonial' | 'program_spotlight' | 'volunteer_story';
  category: string;
  author: string;
  createdAt: Date;
  lastModified: Date;
  status: 'draft' | 'review' | 'published' | 'archived';
  tags: string[];
  media: {
    type: 'image' | 'video' | 'audio' | 'document';
    url: string;
    caption?: string;
    thumbnailUrl?: string;
  }[];
  participants: {
    name: string;
    role: string;
    consent: boolean;
    anonymous: boolean;
  }[];
  impactMetrics: string[]; // IDs of related impact metrics
  location?: string;
  dateOfImpact?: Date;
  publishedChannels: string[];
  engagement: {
    views: number;
    shares: number;
    likes: number;
    comments: number;
  };
  seoData: {
    metaTitle?: string;
    metaDescription?: string;
    keywords: string[];
  };
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'active' | 'completed' | 'paused';
  goals: {
    awareness: number;
    engagement: number;
    fundraising?: number;
    volunteerRecruitment?: number;
  };
  channels: string[];
  stories: string[]; // Story IDs
  metrics: string[]; // Metric IDs
  budget?: number;
  results: {
    reach: number;
    engagement: number;
    conversions: number;
    roi?: number;
  };
}

interface ImpactStorytellingHubProps {
  metrics: ImpactMetric[];
  stories: Story[];
  campaigns: Campaign[];
  onMetricsChange: (metrics: ImpactMetric[]) => void;
  onStoriesChange: (stories: Story[]) => void;
  onCampaignsChange: (campaigns: Campaign[]) => void;
  locked?: boolean;
  currentUser?: string;
  organizationName?: string;
}

const ImpactStorytellingHub: React.FC<ImpactStorytellingHubProps> = ({
  metrics = [],
  stories = [],
  campaigns = [],
  onMetricsChange,
  onStoriesChange,
  onCampaignsChange,
  locked = false,
  currentUser = 'Current User',
  organizationName = 'Organization'
}) => {
  const { checkPermission, isLocked } = usePermissions();
  const sectionLocked = locked || isLocked('impactStorytelling');
  const canEdit = checkPermission('write', 'impactStorytelling') && !sectionLocked;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'metrics' | 'stories' | 'campaigns'>('dashboard');
  const [_showNewMetricModal, _setShowNewMetricModal] = useState(false);
  const [_showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [_showNewCampaignModal, _setShowNewCampaignModal] = useState(false);
  const [_selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Analytics
  const analytics = useMemo(() => {
    const totalImpact = metrics.reduce((sum, metric) => {
      if (metric.category === 'people') return sum + metric.value;
      return sum;
    }, 0);

    const publishedStories = stories.filter(story => story.status === 'published').length;
    const totalEngagement = stories.reduce((sum, story) => 
      sum + story.engagement.views + story.engagement.shares + story.engagement.likes, 0
    );

    const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length;
    
    const categoryDistribution = metrics.reduce((acc, metric) => {
      acc[metric.category] = (acc[metric.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const storyTypeDistribution = stories.reduce((acc, story) => {
      acc[story.type] = (acc[story.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const monthStories = stories.filter(story => {
        const storyDate = new Date(story.createdAt);
        return storyDate.getMonth() === date.getMonth() && 
               storyDate.getFullYear() === date.getFullYear() &&
               story.status === 'published';
      });
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        stories: monthStories.length,
        engagement: monthStories.reduce((sum, story) => sum + story.engagement.views, 0)
      };
    });

    return {
      totalImpact,
      publishedStories,
      totalEngagement,
      activeCampaigns,
      categoryDistribution,
      storyTypeDistribution,
      monthlyTrend,
      avgEngagementPerStory: publishedStories > 0 ? totalEngagement / publishedStories : 0
    };
  }, [metrics, stories, campaigns]);

  // Filter functions
  const filteredStories = stories.filter(story => {
    const matchesSearch = searchTerm === '' || 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || story.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const _filteredMetrics = metrics.filter(metric => {
    const matchesSearch = searchTerm === '' || 
      metric.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || metric.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Story templates
  const storyTemplates = {
    success_story: {
      name: 'Success Story',
      content: `# [Participant Name]'s Success Story

**Background:**
[Brief background about the individual and their situation before engaging with your organization]

**Challenge:**
[What challenges or obstacles did they face?]

**Our Intervention:**
[What services, programs, or support did your organization provide?]

**The Journey:**
[Describe the process, including any setbacks or breakthroughs]

**Outcome:**
[What was achieved? How has their life improved?]

**Impact:**
[Broader impact on family, community, etc.]

**Quote:**
"[Powerful quote from the participant about their experience]"

**Looking Forward:**
[Their current situation and future goals]

---
*This story demonstrates the impact of [Program Name] and how your support makes a real difference in people's lives.*`,
      description: 'Template for individual success stories'
    },

    program_spotlight: {
      name: 'Program Spotlight',
      content: `# [Program Name] Program Spotlight

**Program Overview:**
[Brief description of the program, its goals, and target population]

**The Need:**
[What community need or problem does this program address?]

**Our Approach:**
[Describe your methodology, unique features, or innovative aspects]

**Key Statistics:**
• [Number] participants served
• [Percentage]% success rate
• [Number] hours of service provided
• [Dollar amount] in resources distributed

**Success Metrics:**
[List key performance indicators and outcomes]

**Participant Voice:**
"[Quote from program participant]" - [Name, Role/Relationship to program]

**Staff Perspective:**
"[Quote from program staff member]" - [Name, Title]

**Community Impact:**
[How has this program affected the broader community?]

**Looking Ahead:**
[Future plans, expansion, or improvements for the program]

---
*[Program Name] is funded by [Funding Sources] and serves [Geographic Area/Population].*`,
      description: 'Template for program highlights and spotlights'
    },

    testimonial: {
      name: 'Testimonial',
      content: `# Testimonial: [Title/Theme]

**From:** [Name, Title/Role]
**Date:** [Date]
**Program/Service:** [Related program or service]

---

"[Main testimonial quote - this should be the most powerful and impactful statement]"

**Background:**
[Context about the person giving the testimonial and their relationship to your organization]

**Their Experience:**
[Details about their specific experience with your organization]

**What Made a Difference:**
[Specific aspects of your service/program that had the most impact]

**Results They've Seen:**
[Concrete outcomes or changes they've witnessed or experienced]

**Why They Support Us:**
[Their reasons for continued involvement, donation, or advocacy]

**Call to Action:**
"[Their message to potential supporters, volunteers, or participants]"

---
*[Name] has been [involved with/supported by] [Organization] for [time period]. Learn more about [relevant program] at [website/contact].*`,
      description: 'Template for testimonials from participants, donors, or partners'
    }
  };

  // Add new story
  const addNewStory = () => {
    const newStory: Story = {
      id: Date.now().toString(),
      title: '',
      content: '',
      type: 'success_story',
      category: '',
      author: currentUser,
      createdAt: new Date(),
      lastModified: new Date(),
      status: 'draft',
      tags: [],
      media: [],
      participants: [],
      impactMetrics: [],
      publishedChannels: [],
      engagement: { views: 0, shares: 0, likes: 0, comments: 0 },
      seoData: { keywords: [] }
    };
    onStoriesChange([...stories, newStory]);
    setSelectedStory(newStory);
    setShowNewStoryModal(true);
    toast.success('New story created');
  };

  // Generate impact report
  const generateImpactReport = () => {
    const reportContent = `
# ${organizationName} Impact Report
Generated on ${new Date().toLocaleDateString()}

## Executive Summary
Total people impacted: ${analytics.totalImpact.toLocaleString()}
Published stories: ${analytics.publishedStories}
Total engagement: ${analytics.totalEngagement.toLocaleString()}
Active campaigns: ${analytics.activeCampaigns}

## Key Metrics
${metrics.map(metric => `
### ${metric.name}
- **Value:** ${metric.value.toLocaleString()} ${metric.unit}
- **Description:** ${metric.description}
- **Timeframe:** ${metric.timeframe}
- **Trend:** ${metric.trend.direction} ${metric.trend.percentage}% vs ${metric.trend.comparisonPeriod}
`).join('')}

## Success Stories Summary
${stories.filter(s => s.status === 'published').map(story => `
### ${story.title}
- **Type:** ${story.type.replace('_', ' ').toUpperCase()}
- **Views:** ${story.engagement.views}
- **Date:** ${story.createdAt.toLocaleDateString()}
`).join('')}

---
*This report was generated automatically by the Impact & Storytelling Hub*
    `.trim();

    // Download as text file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${organizationName}_Impact_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Impact report downloaded');
  };

  return (
    <div className="space-y-6">
      <SectionLock sectionId="impactStorytelling" position="top" />

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Impact & Storytelling Hub</h2>
            <p className="text-gray-600">Track your impact and share powerful stories</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateImpactReport}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            {canEdit && (
              <button
                onClick={addNewStory}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                New Story
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { key: 'metrics', label: 'Impact Metrics', icon: Target },
            { key: 'stories', label: 'Stories', icon: BookOpen },
            { key: 'campaigns', label: 'Campaigns', icon: Zap }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">People Impacted</h3>
              </div>
              <p className="text-3xl font-bold text-blue-700 mb-1">
                {analytics.totalImpact.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">across all programs</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Published Stories</h3>
              </div>
              <p className="text-3xl font-bold text-green-700 mb-1">
                {analytics.publishedStories}
              </p>
              <p className="text-sm text-green-600">sharing your impact</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Total Engagement</h3>
              </div>
              <p className="text-3xl font-bold text-purple-700 mb-1">
                {analytics.totalEngagement.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600">views, shares, and likes</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-orange-600" />
                <h3 className="font-semibold text-orange-900">Active Campaigns</h3>
              </div>
              <p className="text-3xl font-bold text-orange-700 mb-1">
                {analytics.activeCampaigns}
              </p>
              <p className="text-sm text-orange-600">ongoing campaigns</p>
            </div>
          </div>

          {/* Recent Stories */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Stories</h3>
              <button
                onClick={() => setActiveTab('stories')}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {stories.slice(0, 5).map(story => (
                <div key={story.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {story.type === 'success_story' && <Award className="w-6 h-6 text-blue-600" />}
                    {story.type === 'testimonial' && <MessageSquare className="w-6 h-6 text-blue-600" />}
                    {story.type === 'program_spotlight' && <Lightbulb className="w-6 h-6 text-blue-600" />}
                    {story.type === 'case_study' && <FileText className="w-6 h-6 text-blue-600" />}
                    {story.type === 'volunteer_story' && <Users className="w-6 h-6 text-blue-600" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{story.title || 'Untitled Story'}</h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {story.content.slice(0, 150)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{story.type.replace('_', ' ').toUpperCase()}</span>
                          <span>{story.createdAt.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {story.engagement.views}
                          </span>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        story.status === 'published' ? 'bg-green-100 text-green-800' :
                        story.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        story.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {story.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Highlights */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Impact Highlights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.filter(metric => metric.isHighlighted).slice(0, 4).map(metric => (
                <div key={metric.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{metric.name}</h4>
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.trend.direction === 'up' ? 'text-green-600' :
                      metric.trend.direction === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      <TrendingUp className={`w-4 h-4 ${
                        metric.trend.direction === 'down' ? 'rotate-180' : ''
                      }`} />
                      {metric.trend.percentage}%
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {metric.value.toLocaleString()} {metric.unit}
                  </p>
                  <p className="text-sm text-gray-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="success_story">Success Stories</option>
                <option value="testimonial">Testimonials</option>
                <option value="program_spotlight">Program Spotlights</option>
                <option value="case_study">Case Studies</option>
                <option value="volunteer_story">Volunteer Stories</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">In Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map(story => (
              <div key={story.id} className="bg-white border rounded-lg p-6 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {story.type === 'success_story' && <Award className="w-5 h-5 text-blue-600" />}
                    {story.type === 'testimonial' && <MessageSquare className="w-5 h-5 text-green-600" />}
                    {story.type === 'program_spotlight' && <Lightbulb className="w-5 h-5 text-purple-600" />}
                    {story.type === 'case_study' && <FileText className="w-5 h-5 text-orange-600" />}
                    {story.type === 'volunteer_story' && <Users className="w-5 h-5 text-pink-600" />}
                    <span className="text-sm font-medium text-gray-700">
                      {story.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    story.status === 'published' ? 'bg-green-100 text-green-800' :
                    story.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    story.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {story.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {story.title || 'Untitled Story'}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {story.content.slice(0, 200)}...
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{story.createdAt.toLocaleDateString()}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {story.engagement.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {story.engagement.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {story.engagement.shares}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStory(story);
                      // Open story editor modal
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setSelectedStory(story);
                        // Open story editor modal
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start sharing your impact by creating your first story.'
                }
              </p>
              {canEdit && !searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
                <button
                  onClick={addNewStory}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Create First Story
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Story Templates Section */}
      {canEdit && activeTab === 'stories' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Story Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(storyTemplates).map(([key, template]) => (
              <div key={key} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h4 className="font-medium mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <button
                  onClick={() => {
                    const newStory: Story = {
                      id: Date.now().toString(),
                      title: `New ${template.name}`,
                      content: template.content,
                      type: key as any,
                      category: '',
                      author: currentUser,
                      createdAt: new Date(),
                      lastModified: new Date(),
                      status: 'draft',
                      tags: [],
                      media: [],
                      participants: [],
                      impactMetrics: [],
                      publishedChannels: [],
                      engagement: { views: 0, shares: 0, likes: 0, comments: 0 },
                      seoData: { keywords: [] }
                    };
                    onStoriesChange([...stories, newStory]);
                    setSelectedStory(newStory);
                    toast.success(`New ${template.name.toLowerCase()} created from template`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sectionLocked && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                This section is currently locked. Contact an administrator to make changes.
              </p>
            </div>
          </div>
        </div>
      )}

      <SectionLock sectionId="impactStorytelling" position="bottom" />
    </div>
  );
};

export default ImpactStorytellingHub;