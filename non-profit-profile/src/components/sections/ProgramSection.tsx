import { Layers } from 'lucide-react';
import React from 'react';

interface ProgramSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: any;
  projects: any[];
}

const ProgramSection: React.FC<ProgramSectionProps> = ({
  formData,
  setFormData,
  errors,
  projects,
}) => {
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
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
            value={formData.primaryPrograms || ''}
            onChange={(e) => handleChange('primaryPrograms', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.primaryPrograms ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            placeholder="Describe your organization's primary programs and services"
            required
          />
          {errors.primaryPrograms && (
            <p className="text-red-500 text-sm mt-1">{errors.primaryPrograms}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Population *
          </label>
          <textarea
            value={formData.targetPopulation || ''}
            onChange={(e) => handleChange('targetPopulation', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.targetPopulation ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Describe the population(s) your organization serves"
            required
          />
          {errors.targetPopulation && (
            <p className="text-red-500 text-sm mt-1">{errors.targetPopulation}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of People Served Annually *
            </label>
            <input
              type="number"
              value={formData.annualServed || ''}
              onChange={(e) => handleChange('annualServed', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.annualServed ? 'border-red-500' : 'border-gray-300'
              }`}
              min="0"
              required
            />
            {errors.annualServed && (
              <p className="text-red-500 text-sm mt-1">{errors.annualServed}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Geographic Service Area *
            </label>
            <input
              type="text"
              value={formData.serviceArea || ''}
              onChange={(e) => handleChange('serviceArea', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.serviceArea ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Chicago, Cook County, Illinois"
              required
            />
            {errors.serviceArea && (
              <p className="text-red-500 text-sm mt-1">{errors.serviceArea}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Outcomes/Impact *
          </label>
          <textarea
            value={formData.keyOutcomes || ''}
            onChange={(e) => handleChange('keyOutcomes', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.keyOutcomes ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={3}
            placeholder="Describe the key outcomes and impact of your programs"
            required
          />
          {errors.keyOutcomes && <p className="text-red-500 text-sm mt-1">{errors.keyOutcomes}</p>}
        </div>

        {projects && projects.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
            <div className="space-y-2">
              {projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="p-2 bg-white rounded border border-gray-200"
                >
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-gray-600">{project.description}</p>
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
