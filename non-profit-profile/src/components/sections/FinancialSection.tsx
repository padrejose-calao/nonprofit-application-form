import React from 'react';
import { 
  DollarSign, TrendingUp, FileText, Upload, AlertCircle,
  PieChart, BarChart3, Calendar, Calculator
} from 'lucide-react';
import { toast } from 'react-toastify';

interface FinancialSectionProps {
  formData: unknown;
  errors: unknown;
  locked: boolean;
  onInputChange: (field: string, value: unknown) => void;
  onFileUpload?: (field: string, file: File) => void;
}

const FinancialSection: React.FC<FinancialSectionProps> = ({
  formData,
  errors,
  locked,
  onInputChange,
  onFileUpload
}) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <DollarSign className="w-5 h-5 mr-2" />
          Financial Overview
        </h3>

        {/* Revenue & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
              Annual Revenue
            </h4>
            <div className="space-y-3">
              {years.map(year => (
                <div key={year} className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm text-gray-700">{year}:</label>
                  <input
                    type="number"
                    value={(formData as any)[`revenue${year}`] || ''}
                    onChange={(e) => onInputChange(`revenue${year}`, e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="$0"
                    disabled={locked}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-red-600" />
              Annual Expenses
            </h4>
            <div className="space-y-3">
              {years.map(year => (
                <div key={year} className="grid grid-cols-2 gap-2 items-center">
                  <label className="text-sm text-gray-700">{year}:</label>
                  <input
                    type="number"
                    value={(formData as any)[`expenses${year}`] || ''}
                    onChange={(e) => onInputChange(`expenses${year}`, e.target.value)}
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="$0"
                    disabled={locked}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Net Assets */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-4">Net Assets/Fund Balance</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {years.map(year => (
              <div key={year}>
                <label className="block text-sm text-gray-700 mb-1">{year}</label>
                <input
                  type="number"
                  value={(formData as any)[`netAssets${year}`] || ''}
                  onChange={(e) => onInputChange(`netAssets${year}`, e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="$0"
                  disabled={locked}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Information */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Budget Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">
              Current Year Operating Budget <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={(formData as any).operatingBudget || ''}
              onChange={(e) => onInputChange('operatingBudget', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="$0"
              disabled={locked}
            />
            {(errors as any).operatingBudget && (
              <p className="text-red-600 text-sm mt-1">{(errors as any).operatingBudget}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Project/Program Budget
            </label>
            <input
              type="number"
              value={(formData as any).programBudget || ''}
              onChange={(e) => onInputChange('programBudget', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="$0"
              disabled={locked}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Administrative Expenses (%)
            </label>
            <input
              type="number"
              value={(formData as any).adminExpensePercent || ''}
              onChange={(e) => onInputChange('adminExpensePercent', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="15"
              min="0"
              max="100"
              disabled={locked}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Fundraising Expenses (%)
            </label>
            <input
              type="number"
              value={(formData as any).fundraisingExpensePercent || ''}
              onChange={(e) => onInputChange('fundraisingExpensePercent', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="0"
              max="100"
              disabled={locked}
            />
          </div>
        </div>

        {/* Reserve Funds */}
        <div className="mt-6">
          <label className="block font-semibold mb-2">
            Operating Reserve (Months)
          </label>
          <input
            type="number"
            value={(formData as any).operatingReserveMonths || ''}
            onChange={(e) => onInputChange('operatingReserveMonths', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="3"
            min="0"
            disabled={locked}
          />
          <small className="text-gray-600 block mt-1">
            Number of months of operating expenses in reserve
          </small>
        </div>
      </div>

      {/* Financial Documents */}
      <div className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Financial Documents
        </h3>

        <div className="space-y-4">
          {/* Audited Financial Statements */}
          <div>
            <label className="block font-semibold mb-2">
              Most Recent Audited Financial Statements <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onFileUpload) {
                    onFileUpload('auditedFinancials', file);
                    toast.success('Audited financials uploaded');
                  }
                }}
                accept=".pdf,.doc,.docx"
                disabled={locked}
                className="block"
              />
              {(formData as any).auditedFinancials && (
                <span className="text-sm text-green-600 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Uploaded
                </span>
              )}
            </div>
            {(errors as any).auditedFinancials && (
              <p className="text-red-600 text-sm mt-1">{(errors as any).auditedFinancials}</p>
            )}
          </div>

          {/* Form 990 */}
          <div>
            <label className="block font-semibold mb-2">
              Most Recent Form 990
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onFileUpload) {
                    onFileUpload('form990', file);
                    toast.success('Form 990 uploaded');
                  }
                }}
                accept=".pdf,.doc,.docx"
                disabled={locked}
                className="block"
              />
              {(formData as any).form990 && (
                <span className="text-sm text-green-600 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Uploaded
                </span>
              )}
            </div>
          </div>

          {/* Annual Budget */}
          <div>
            <label className="block font-semibold mb-2">
              Current Year Budget Document
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && onFileUpload) {
                    onFileUpload('budgetDocument', file);
                    toast.success('Budget document uploaded');
                  }
                }}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                disabled={locked}
                className="block"
              />
              {(formData as any).budgetDocument && (
                <span className="text-sm text-green-600 flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  Uploaded
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fiscal Year */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Fiscal Year Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">
              Fiscal Year Start
            </label>
            <select
              value={(formData as any).fiscalYearStart || ''}
              onChange={(e) => onInputChange('fiscalYearStart', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={locked}
            >
              <option value="">Select month</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Audit Frequency
            </label>
            <select
              value={(formData as any).auditFrequency || ''}
              onChange={(e) => onInputChange('auditFrequency', e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={locked}
            >
              <option value="">Select frequency</option>
              <option value="annually">Annually</option>
              <option value="biannually">Every 2 Years</option>
              <option value="as-required">As Required</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Policies */}
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Financial Policies & Controls
        </h3>

        <div className="space-y-3">
          {[
            { field: 'hasFinancialPolicies', label: 'Written Financial Policies' },
            { field: 'hasInternalControls', label: 'Internal Financial Controls' },
            { field: 'hasConflictOfInterest', label: 'Conflict of Interest Policy' },
            { field: 'hasWhistleblower', label: 'Whistleblower Policy' },
            { field: 'hasDocumentRetention', label: 'Document Retention Policy' },
            { field: 'hasExpenseReimbursement', label: 'Expense Reimbursement Policy' }
          ].map(policy => (
            <label key={policy.field} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(formData as any)[policy.field] || false}
                onChange={(e) => onInputChange(policy.field, e.target.checked)}
                className="rounded"
                disabled={locked}
              />
              <span className="text-sm">{policy.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialSection;
