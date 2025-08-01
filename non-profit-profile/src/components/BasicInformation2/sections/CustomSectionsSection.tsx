import React, { useState } from 'react';
import { SectionProps } from '../types';
import { Plus, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'email' | 'url' | 'phone' | 'select' | 'checkbox';
  required: boolean;
  options?: string[]; // For select type
  value?: unknown;
}

interface CustomSubsection {
  id: string;
  name: string;
  fields: CustomField[];
}

interface CustomSection {
  id: string;
  name: string;
  icon?: string;
  subsections: CustomSubsection[];
}

const CustomSectionsSection: React.FC<SectionProps> = ({ data, onChange, errors }) => {
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddSubsection, setShowAddSubsection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const typedData = (data || {}) as { customSections?: CustomSection[] };
  const customSections: CustomSection[] = typedData.customSections || [];

  const handleAddSection = (name: string) => {
    const newSection: CustomSection = {
      id: `section-${Date.now()}`,
      name,
      subsections: []
    };
    onChange('customSections', [...customSections, newSection]);
    setShowAddSection(false);
    setExpandedSections([...expandedSections, newSection.id]);
  };

  const handleDeleteSection = (sectionId: string) => {
    onChange('customSections', customSections.filter(s => s.id !== sectionId));
    setExpandedSections(expandedSections.filter(id => id !== sectionId));
  };

  const handleAddSubsection = (sectionId: string, name: string) => {
    const newSubsection: CustomSubsection = {
      id: `subsection-${Date.now()}`,
      name,
      fields: []
    };
    
    const updatedSections = customSections.map(section => {
      if (section.id === sectionId) {
        return { ...section, subsections: [...section.subsections, newSubsection] };
      }
      return section;
    });
    
    onChange('customSections', updatedSections);
    setShowAddSubsection(null);
  };

  const handleDeleteSubsection = (sectionId: string, subsectionId: string) => {
    const updatedSections = customSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: section.subsections.filter(sub => sub.id !== subsectionId)
        };
      }
      return section;
    });
    
    onChange('customSections', updatedSections);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const renderFieldInput = (field: CustomField, subsectionId: string, sectionId: string) => {
    const baseClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm";
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={(field.value as string) || ''}
            onChange={(e) => updateFieldValue(sectionId, subsectionId, field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={baseClass}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <select
            value={(field.value as string) || ''}
            onChange={(e) => updateFieldValue(sectionId, subsectionId, field.id, e.target.value)}
            className={baseClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={(field.value as boolean) || false}
              onChange={(e) => updateFieldValue(sectionId, subsectionId, field.id, e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );
      
      default:
        return (
          <input
            type={field.type}
            value={(field.value as string) || ''}
            onChange={(e) => updateFieldValue(sectionId, subsectionId, field.id, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={baseClass}
          />
        );
    }
  };

  const updateFieldValue = (sectionId: string, subsectionId: string, fieldId: string, value: unknown) => {
    // Implementation for updating field values
    // This would update the nested structure in the data
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-3 rounded-md">
        <p className="text-sm text-blue-800">
          Create custom sections to capture information specific to your organization's needs.
        </p>
      </div>

      {/* Custom Sections */}
      {customSections.map((section) => (
        <div key={section.id} className="border rounded-lg bg-white">
          {/* Section Header */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex items-center gap-2 flex-1 text-left"
              >
                {expandedSections.includes(section.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
                <h3 className="font-medium text-gray-900">{section.name}</h3>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubsection(section.id)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="Add subsection"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSection(section.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete section"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Section Content */}
          {expandedSections.includes(section.id) && (
            <div className="p-4 space-y-4">
              {/* Add Subsection Form */}
              {showAddSubsection === section.id && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <input
                    type="text"
                    placeholder="Subsection name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleAddSubsection(section.id, e.currentTarget.value);
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSubsection(null)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Subsections */}
              {section.subsections.map((subsection) => (
                <div key={subsection.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">{subsection.name}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteSubsection(section.id, subsection.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete subsection"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-3">
                    {subsection.fields.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No fields configured. Click the settings icon to add fields.
                      </p>
                    ) : (
                      subsection.fields.map((field) => (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label} {field.required && '*'}
                          </label>
                          {renderFieldInput(field, subsection.id, section.id)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}

              {section.subsections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No subsections added yet</p>
                  <button
                    onClick={() => setShowAddSubsection(section.id)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Add a subsection
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add Section Button */}
      {customSections.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-4">No custom sections created yet</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAddSection(true)}
        className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        Add Custom Section
      </button>

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add Custom Section</h3>
            <input
              type="text"
              placeholder="Section name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  handleAddSection(e.currentTarget.value);
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddSection(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Section name"]') as HTMLInputElement;
                  if (input?.value) {
                    handleAddSection(input.value);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSectionsSection;