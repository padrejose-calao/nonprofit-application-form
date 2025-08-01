import { Layers } from 'lucide-react';
import React from 'react';

interface ProgramSectionProps {
  formData: unknown;
  setFormData: (data: unknown) => void;
  errors: unknown;
  projects: unknown[];
}

const ProgramSection: React.FC<ProgramSectionProps> = ({
  formData,
  setFormData,
  errors,
  projects,
}) => {
  const handleChange = (field: string, value: unknown) => {
    setFormData({ ...(formData as any), [field]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Layers className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Program Information</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Programs/Services *
          </label>
          <textarea
            value={(formData as any).primaryPrograms || ''}
            onChange={(e) => handleChange('primaryPrograms', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).primaryPrograms ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Describe your organization's primary programs and services"
            required
          />
          {(errors as any).primaryPrograms && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).primaryPrograms}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Population *
          </label>
          <textarea
            value={(formData as any).targetPopulation || ''}
            onChange={(e) => handleChange('targetPopulation', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).targetPopulation ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Describe the population(s) your organization serves"
            required
          />
          {(errors as any).targetPopulation && (
            <p className="text-red-500 text-sm mt-1">{(errors as any).targetPopulation}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of People Served Annually *
            </label>
            <input
              type="number"
              value={(formData as any).annualServed || ''}
              onChange={(e) => handleChange('annualServed', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                (errors as any).annualServed ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              required
            />
            {(errors as any).annualServed && (
              <p className="text-red-500 text-sm mt-1">{(errors as any).annualServed}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geographic Service Area *
            </label>
            <input
              type="text"
              value={(formData as any).serviceArea || ''}
              onChange={(e) => handleChange('serviceArea', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                (errors as any).serviceArea ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Chicago, Cook County, Illinois"
              required
            />
            {(errors as any).serviceArea && (
              <p className="text-red-500 text-sm mt-1">{(errors as any).serviceArea}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Outcomes/Impact *
          </label>
          <textarea
            value={(formData as any).keyOutcomes || ''}
            onChange={(e) => handleChange('keyOutcomes', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              (errors as any).keyOutcomes ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Describe the key outcomes and impact of your programs"
            required
          />
          {(errors as any).keyOutcomes && <p className="text-red-500 text-sm mt-1">{(errors as any).keyOutcomes}</p>}
        </div>

        {projects && projects.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
            <div className="space-y-2">
              {projects.map((project, index) => (
                <div
                  key={(project as any).id || index}
                  className="p-2 bg-white rounded border border-gray-200"
                >
                  <p className="font-medium">{(project as any).name}</p>
                  <p className="text-sm text-gray-600">{(project as any).description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramSection;
