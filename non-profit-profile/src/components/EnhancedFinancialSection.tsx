import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Upload, 
  AlertCircle,
  PieChart, 
  BarChart3, 
  Calendar, 
  Calculator,
  Plus,
  Trash2,
  Edit,
  Download,
  Eye,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Info,
  Target,
  Users,
  Building,
  Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SectionLock, usePermissions } from './PermissionsManager';

interface RevenueStream {
  id: string;
  source: string;
  category: 'grants' | 'donations' | 'programs' | 'investments' | 'other';
  amount: number;
  year: number;
  recurring: boolean;
  restricted: boolean;
  notes?: string;
}

interface ExpenseCategory {
  id: string;
  category: string;
  subcategory?: string;
  amount: number;
  year: number;
  budgeted: number;
  variance: number;
  essential: boolean;
  notes?: string;
}

interface BudgetLine {
  id: string;
  category: string;
  subcategory?: string;
  budgeted: number;
  actual: number;
  projected: number;
  variance: number;
  variancePercent: number;
  year: number;
}

interface FinancialRatio {
  name: string;
  value: number;
  benchmark: number;
  status: 'good' | 'warning' | 'concern';
  description: string;
}

interface EnhancedFinancialSectionProps {
  formData: unknown;
  errors: unknown;
  locked: boolean;
  onInputChange: (field: string, value: unknown) => void;
  onFileUpload?: (field: string, file: File) => void;
  sectionId?: string;
}

const EnhancedFinancialSection: React.FC<EnhancedFinancialSectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload,
  sectionId = 'financialSection'
}) => {
  const { hasPermission } = usePermissions();
  const sectionLocked = locked;
  const canEdit = hasPermission(sectionId, 'write') && !sectionLocked;

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];

  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'revenue' | 'expenses' | 'ratios' | 'documents'>('overview');
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [_showAddExpense, setShowAddExpense] = useState(false);
  const [_editingBudgetLine, _setEditingBudgetLine] = useState<string | null>(null);

  // Initialize data
  const revenueStreams: RevenueStream[] = (formData as any)?.revenueStreams || [];
  const expenseCategories: ExpenseCategory[] = (formData as any)?.expenseCategories || [];
  const budgetLines: BudgetLine[] = (formData as any)?.budgetLines || [];

  // Calculate financial ratios
  const financialRatios = useMemo((): FinancialRatio[] => {
    const currentYearRevenue = revenueStreams
      .filter(r => r.year === currentYear)
      .reduce((sum, r) => sum + r.amount, 0);
    
    const currentYearExpenses = expenseCategories
      .filter(e => e.year === currentYear)
      .reduce((sum, e) => sum + e.amount, 0);

    const adminExpenses = expenseCategories
      .filter(e => e.year === currentYear && e.category === 'Administrative')
      .reduce((sum, e) => sum + e.amount, 0);

    const programExpenses = expenseCategories
      .filter(e => e.year === currentYear && e.category === 'Program Services')
      .reduce((sum, e) => sum + e.amount, 0);

    const fundraisingExpenses = expenseCategories
      .filter(e => e.year === currentYear && e.category === 'Fundraising')
      .reduce((sum, e) => sum + e.amount, 0);

    const netAssets = (formData as any)?.[`netAssets${currentYear}`] || 0;

    const ratios: FinancialRatio[] = [
      {
        name: 'Program Expense Ratio',
        value: currentYearExpenses > 0 ? (programExpenses / currentYearExpenses) * 100 : 0,
        benchmark: 75,
        status: 'good',
        description: 'Percentage of expenses that go directly to programs'
      },
      {
        name: 'Administrative Ratio',
        value: currentYearExpenses > 0 ? (adminExpenses / currentYearExpenses) * 100 : 0,
        benchmark: 15,
        status: 'good',
        description: 'Percentage of expenses for administrative costs'
      },
      {
        name: 'Fundraising Efficiency',
        value: fundraisingExpenses > 0 ? currentYearRevenue / fundraisingExpenses : 0,
        benchmark: 4,
        status: 'good',
        description: 'Dollars raised per dollar spent on fundraising'
      },
      {
        name: 'Operating Margin',
        value: currentYearRevenue > 0 ? ((currentYearRevenue - currentYearExpenses) / currentYearRevenue) * 100 : 0,
        benchmark: 10,
        status: 'good',
        description: 'Net income as percentage of revenue'
      },
      {
        name: 'Months of Reserve',
        value: currentYearExpenses > 0 ? (netAssets / (currentYearExpenses / 12)) : 0,
        benchmark: 3,
        status: 'good',
        description: 'Months of operating expenses covered by reserves'
      }
    ];

    // Update status based on benchmarks
    ratios.forEach(ratio => {
      if (ratio.name === 'Program Expense Ratio') {
        ratio.status = ratio.value >= 75 ? 'good' : ratio.value >= 65 ? 'warning' : 'concern';
      } else if (ratio.name === 'Administrative Ratio') {
        ratio.status = ratio.value <= 15 ? 'good' : ratio.value <= 25 ? 'warning' : 'concern';
      } else if (ratio.name === 'Fundraising Efficiency') {
        ratio.status = ratio.value >= 4 ? 'good' : ratio.value >= 2 ? 'warning' : 'concern';
      } else if (ratio.name === 'Operating Margin') {
        ratio.status = ratio.value >= 5 ? 'good' : ratio.value >= 0 ? 'warning' : 'concern';
      } else if (ratio.name === 'Months of Reserve') {
        ratio.status = ratio.value >= 3 ? 'good' : ratio.value >= 1 ? 'warning' : 'concern';
      }
    });

    return ratios;
  }, [revenueStreams, expenseCategories, formData, currentYear]);

  // Add new revenue stream
  const addRevenueStream = () => {
    const newRevenue: RevenueStream = {
      id: Date.now().toString(),
      source: '',
      category: 'grants',
      amount: 0,
      year: currentYear,
      recurring: false,
      restricted: false
    };
    
    onInputChange('revenueStreams', [...revenueStreams, newRevenue]);
    setShowAddRevenue(false);
    toast.success('New revenue stream added');
  };

  // Add new expense category
  const _addExpenseCategory = () => {
    const newExpense: ExpenseCategory = {
      id: Date.now().toString(),
      category: 'Program Services',
      amount: 0,
      year: currentYear,
      budgeted: 0,
      variance: 0,
      essential: true
    };
    
    onInputChange('expenseCategories', [...expenseCategories, newExpense]);
    setShowAddExpense(false);
    toast.success('New expense category added');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status: 'good' | 'warning' | 'concern') => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'concern': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    const totalRevenue = revenueStreams.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenseCategories.reduce((sum, e) => sum + e.amount, 0);
    const totalBudgeted = budgetLines.reduce((sum, b) => sum + b.budgeted, 0);
    const totalActual = budgetLines.reduce((sum, b) => sum + b.actual, 0);

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      budgeted: totalBudgeted,
      actual: totalActual,
      budgetVariance: totalActual - totalBudgeted
    };
  }, [revenueStreams, expenseCategories, budgetLines]);

  return (
    <div className="space-y-6">
      <SectionLock resourceId={sectionId} />

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-green-600" />
            Enhanced Financial Management
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Comprehensive financial tracking and analysis</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'budget', label: 'Budget Analysis', icon: Calculator },
            { key: 'revenue', label: 'Revenue Streams', icon: TrendingUp },
            { key: 'expenses', label: 'Expense Categories', icon: TrendingDown },
            { key: 'ratios', label: 'Financial Ratios', icon: Target },
            { key: 'documents', label: 'Documents', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-900">Total Revenue</h3>
              </div>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.revenue)}</p>
              <p className="text-sm text-green-600">Current fiscal year</p>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-900">Total Expenses</h3>
              </div>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.expenses)}</p>
              <p className="text-sm text-red-600">Current fiscal year</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-blue-900">Net Income</h3>
              </div>
              <p className={`text-2xl font-bold ${totals.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(totals.netIncome)}
              </p>
              <p className="text-sm text-blue-600">Revenue minus expenses</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-purple-900">Budget Variance</h3>
              </div>
              <p className={`text-2xl font-bold ${totals.budgetVariance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(totals.budgetVariance)}
              </p>
              <p className="text-sm text-purple-600">Actual vs budgeted</p>
            </div>
          </div>

          {/* Three-Year Financial Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Three-Year Financial Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold">Category</th>
                    {years.map(year => (
                      <th key={year} className="text-right p-3 font-semibold">{year}</th>
                    ))}
                    <th className="text-right p-3 font-semibold">% Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-3 font-medium">Total Revenue</td>
                    {years.map(year => (
                      <td key={year} className="text-right p-3">
                        {formatCurrency((formData as any)?.[`revenue${year}`] || 0)}
                      </td>
                    ))}
                    <td className="text-right p-3">
                      {(((formData as any)?.[`revenue${years[2]}`] || 0) - ((formData as any)?.[`revenue${years[0]}`] || 0)) / ((formData as any)?.[`revenue${years[0]}`] || 1) * 100}%
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="p-3 font-medium">Total Expenses</td>
                    {years.map(year => (
                      <td key={year} className="text-right p-3">
                        {formatCurrency((formData as any)?.[`expenses${year}`] || 0)}
                      </td>
                    ))}
                    <td className="text-right p-3">
                      {(((formData as any)?.[`expenses${years[2]}`] || 0) - ((formData as any)?.[`expenses${years[0]}`] || 0)) / ((formData as any)?.[`expenses${years[0]}`] || 1) * 100}%
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="p-3 font-bold">Net Assets</td>
                    {years.map(year => (
                      <td key={year} className="text-right p-3 font-bold">
                        {formatCurrency((formData as any)?.[`netAssets${year}`] || 0)}
                      </td>
                    ))}
                    <td className="text-right p-3 font-bold">
                      {(((formData as any)?.[`netAssets${years[2]}`] || 0) - ((formData as any)?.[`netAssets${years[0]}`] || 0)) / ((formData as any)?.[`netAssets${years[0]}`] || 1) * 100}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Input for Basic Financial Data */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Financial Input</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {years.map(year => (
                <div key={year} className="space-y-4">
                  <h4 className="font-medium text-gray-800">{year} Financial Data</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Revenue
                    </label>
                    <input
                      type="number"
                      value={(formData as any)?.[`revenue${year}`] || ''}
                      onChange={(e) => onInputChange(`revenue${year}`, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="$0"
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Expenses
                    </label>
                    <input
                      type="number"
                      value={(formData as any)?.[`expenses${year}`] || ''}
                      onChange={(e) => onInputChange(`expenses${year}`, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="$0"
                      disabled={!canEdit}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Net Assets
                    </label>
                    <input
                      type="number"
                      value={(formData as any)?.[`netAssets${year}`] || ''}
                      onChange={(e) => onInputChange(`netAssets${year}`, parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="$0"
                      disabled={!canEdit}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Revenue Streams Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue Stream Analysis</h3>
            {canEdit && (
              <button
                onClick={() => setShowAddRevenue(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add Revenue Stream
              </button>
            )}
          </div>

          {/* Add Revenue Form */}
          {showAddRevenue && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Add New Revenue Stream</h4>
                <button
                  onClick={() => setShowAddRevenue(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Revenue source name"
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                  <option value="grants">Grants</option>
                  <option value="donations">Donations</option>
                  <option value="programs">Program Revenue</option>
                  <option value="investments">Investment Income</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="number"
                  placeholder="Amount"
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={addRevenueStream}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Revenue Stream
              </button>
            </div>
          )}

          {/* Revenue Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Source</th>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-right p-4 font-semibold">Amount</th>
                    <th className="text-center p-4 font-semibold">Year</th>
                    <th className="text-center p-4 font-semibold">Recurring</th>
                    <th className="text-center p-4 font-semibold">Restricted</th>
                    <th className="text-center p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueStreams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-gray-500">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No revenue streams added yet</p>
                        <p className="text-sm">Add your first revenue stream to get started</p>
                      </td>
                    </tr>
                  ) : (
                    revenueStreams.map(revenue => (
                      <tr key={revenue.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium">{revenue.source}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            revenue.category === 'grants' ? 'bg-blue-100 text-blue-800' :
                            revenue.category === 'donations' ? 'bg-green-100 text-green-800' :
                            revenue.category === 'programs' ? 'bg-purple-100 text-purple-800' :
                            revenue.category === 'investments' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {revenue.category.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-right p-4 font-medium">{formatCurrency(revenue.amount)}</td>
                        <td className="text-center p-4">{revenue.year}</td>
                        <td className="text-center p-4">
                          {revenue.recurring ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-4">
                          {revenue.restricted ? (
                            <CheckCircle className="w-4 h-4 text-orange-600 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-4">
                          <div className="flex items-center justify-center gap-1">
                            {canEdit && (
                              <>
                                <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Financial Ratios Tab */}
      {activeTab === 'ratios' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Financial Health Indicators</h3>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" />
              Recalculate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialRatios.map(ratio => (
              <div key={ratio.name} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{ratio.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ratio.status)}`}>
                    {ratio.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {ratio.name === 'Fundraising Efficiency' ? 
                      `${ratio.value.toFixed(1)}:1` : 
                      `${ratio.value.toFixed(1)}${ratio.name.includes('Ratio') || ratio.name.includes('Margin') ? '%' : ratio.name.includes('Months') ? ' mo' : ''}`
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    Benchmark: {ratio.name === 'Fundraising Efficiency' ? 
                      `${ratio.benchmark}:1` : 
                      `${ratio.benchmark}${ratio.name.includes('Ratio') || ratio.name.includes('Margin') ? '%' : ratio.name.includes('Months') ? ' mo' : ''}`
                    }
                  </div>
                </div>

                <p className="text-sm text-gray-700">{ratio.description}</p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        ratio.status === 'good' ? 'bg-green-500' :
                        ratio.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (ratio.value / ratio.benchmark) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Financial Health Recommendations
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              {financialRatios
                .filter(ratio => ratio.status !== 'good')
                .map(ratio => (
                  <div key={ratio.name} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>{ratio.name}:</strong> Consider strategies to improve this metric to meet benchmark standards.
                    </span>
                  </div>
                ))}
              {financialRatios.every(ratio => ratio.status === 'good') && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>All financial ratios are within healthy ranges. Continue monitoring trends.</span>
                </div>
              )}
            </div>
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

      <SectionLock resourceId={sectionId} />
    </div>
  );
};

export default EnhancedFinancialSection;