import React from 'react';
import { TaxExemptStatusData } from '../types';
import { ORG_TYPES_501C } from '../constants';

interface TaxExemptStatusSectionProps {
  data: TaxExemptStatusData;
  onChange: (field: string, value: unknown) => void;
  errors?: Record<string, string>;
}

const TaxExemptStatusSection: React.FC<TaxExemptStatusSectionProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const formatGEN = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 4);
  };

  const formatEIN = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 9)}`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">501(c)(3) Status</h2>

      {/* Primary 501(c)(3) Question */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Are you a 501(c)(3) organization? *
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.is501c3 === true}
              onChange={() => onChange('is501c3', true)}
              className="mr-3 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={data.is501c3 === false}
              onChange={() => onChange('is501c3', false)}
              className="mr-3 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>

      {/* If not 501(c)(3), show other organization types */}
      {data.is501c3 === false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Type *
          </label>
          <select
            value={data.organizationType || ''}
            onChange={(e) => onChange('organizationType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              errors.organizationType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Organization Type</option>
            {ORG_TYPES_501C.filter(type => type.value !== '501c3').map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.organizationType && (
            <p className="mt-1 text-sm text-red-600">{errors.organizationType}</p>
          )}
        </div>
      )}

      {/* Group Exemption */}
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.hasGroupExemption}
            onChange={(e) => onChange('hasGroupExemption', e.target.checked)}
            className="mr-2 h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            Part of Group Exemption
          </span>
        </label>

        {data.hasGroupExemption && (
          <div className="ml-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                A group exemption allows a central organization to obtain recognition of exemption for 
                subordinate organizations under its general supervision or control.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Central Organization Name *
                </label>
                <input
                  type="text"
                  value={data.centralOrgName || ''}
                  onChange={(e) => onChange('centralOrgName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.centralOrgName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Name of central organization"
                />
                {errors.centralOrgName && (
                  <p className="mt-1 text-sm text-red-600">{errors.centralOrgName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Central Organization EIN *
                </label>
                <input
                  type="text"
                  value={data.centralOrgEIN || ''}
                  onChange={(e) => onChange('centralOrgEIN', formatEIN(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.centralOrgEIN ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="XX-XXXXXXX"
                  maxLength={10}
                />
                {errors.centralOrgEIN && (
                  <p className="mt-1 text-sm text-red-600">{errors.centralOrgEIN}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Exemption Number (GEN) *
                </label>
                <input
                  type="text"
                  value={data.groupExemptionNumber || ''}
                  onChange={(e) => onChange('groupExemptionNumber', formatGEN(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                    errors.groupExemptionNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="4-digit number"
                  maxLength={4}
                />
                {errors.groupExemptionNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.groupExemptionNumber}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  The 4-digit Group Exemption Number assigned by the IRS
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subordinate Number
                </label>
                <input
                  type="text"
                  value={data.subordinateNumber || ''}
                  onChange={(e) => onChange('subordinateNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Your subordinate number"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Number assigned to your organization by the central organization
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Required Documentation</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Group exemption letter from IRS</li>
                <li>• Letter from central organization confirming inclusion</li>
                <li>• Annual information update to central organization</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Tax Exempt Status Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tax Exempt Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Organization Type:</span>{' '}
            <span className="font-medium">
              {data.is501c3 
                ? '501(c)(3) Charitable Organization' 
                : data.organizationType 
                  ? ORG_TYPES_501C.find(t => t.value === data.organizationType)?.label
                  : 'Not specified'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Group Exemption:</span>{' '}
            <span className="font-medium">
              {data.hasGroupExemption ? 'Yes' : 'No'}
            </span>
          </div>
          {data.hasGroupExemption && data.groupExemptionNumber && (
            <div>
              <span className="text-gray-500">GEN:</span>{' '}
              <span className="font-medium">{data.groupExemptionNumber}</span>
            </div>
          )}
          {data.hasGroupExemption && data.centralOrgName && (
            <div>
              <span className="text-gray-500">Central Org:</span>{' '}
              <span className="font-medium">{data.centralOrgName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxExemptStatusSection;