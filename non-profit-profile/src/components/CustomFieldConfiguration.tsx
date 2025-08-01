import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, ChevronUp, ChevronDown } from 'lucide-react';
import { netlifySettingsService } from '../services/netlifySettingsService';

interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
  section: string;
  required: boolean;
  options?: string[]; // For select fields
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  order: number;
}

interface CustomFieldConfigurationProps {
  section?: string;
  onFieldsChange?: (fields: CustomField[]) => void;
}

const CustomFieldConfiguration: React.FC<CustomFieldConfigurationProps> = ({
  section,
  onFieldsChange
}) => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newField, setNewField] = useState<Partial<CustomField>>({
    type: 'text',
    required: false
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const loadCustomFields = React.useCallback(async () => {
    const savedFields = (await netlifySettingsService.get('custom-fields') || []) as CustomField[];
    const filteredFields = section 
      ? savedFields.filter((f: CustomField) => f.section === section)
      : savedFields;
    setFields(filteredFields.sort((a: CustomField, b: CustomField) => a.order - b.order));
  }, [section]);

  useEffect(() => {
    loadCustomFields();
  }, [loadCustomFields]);

  const saveCustomFields = async (updatedFields: CustomField[]) => {
    await netlifySettingsService.set('custom-fields', updatedFields, 'organization');
    setFields(updatedFields);
    onFieldsChange?.(updatedFields);
  };

  const addField = async () => {
    if (!newField.name || !newField.label) return;

    const field: CustomField = {
      id: `custom_${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type || 'text',
      section: section || newField.section || 'general',
      required: newField.required || false,
      options: newField.options,
      validation: newField.validation,
      order: fields.length
    };

    const allFields = (await netlifySettingsService.get('custom-fields') || []) as CustomField[];
    await saveCustomFields([...allFields, field]);
    
    setNewField({ type: 'text', required: false });
    setShowAddForm(false);
  };

  const updateField = async (id: string, updates: Partial<CustomField>) => {
    const allFields = (await netlifySettingsService.get('custom-fields') || []) as CustomField[];
    const updatedFields = allFields.map((f: CustomField) => 
      f.id === id ? { ...f, ...updates } : f
    );
    await saveCustomFields(updatedFields);
    setEditingField(null);
  };

  const deleteField = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    
    const allFields = (await netlifySettingsService.get('custom-fields') || []) as CustomField[];
    const updatedFields = allFields.filter((f: CustomField) => f.id !== id);
    await saveCustomFields(updatedFields);
  };

  const moveField = async (id: string, direction: 'up' | 'down') => {
    const index = fields.findIndex(f => f.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === fields.length - 1)) {
      return;
    }

    const newFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    
    // Update order values
    newFields.forEach((field, i) => {
      field.order = i;
    });

    await saveCustomFields(newFields);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Custom Fields</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3">Add Custom Field</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Field Name</label>
              <input
                type="text"
                value={newField.name || ''}
                onChange={(e) => setNewField({ ...newField, name: e.target.value.replace(/\s+/g, '_') })}
                placeholder="field_name"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={newField.label || ''}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                placeholder="Field Label"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value as CustomField['type'] })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
            {!section && (
              <div>
                <label className="block text-sm font-medium mb-1">Section</label>
                <input
                  type="text"
                  value={newField.section || ''}
                  onChange={(e) => setNewField({ ...newField, section: e.target.value })}
                  placeholder="general"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            )}
            <div className="col-span-2 flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={newField.required || false}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="required" className="text-sm">Required field</label>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={addField}
              disabled={!newField.name || !newField.label}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Add Field
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewField({ type: 'text', required: false });
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fields List */}
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 border rounded-lg bg-white">
            {editingField === field.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const updated = fields.map(f => 
                      f.id === field.id ? { ...f, label: e.target.value } : f
                    );
                    setFields(updated);
                  }}
                  className="w-full px-2 py-1 border rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateField(field.id, { label: field.label })}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingField(null);
                      loadCustomFields();
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{field.label}</span>
                  <span className="text-sm text-gray-500 ml-2">({field.name})</span>
                  <span className="text-xs text-gray-400 ml-2">{field.type}</span>
                  {field.required && <span className="text-xs text-red-500 ml-2">*Required</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveField(field.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveField(field.id, 'down')}
                    disabled={index === fields.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingField(field.id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteField(field.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No custom fields configured. Click "Add Field" to create one.
        </p>
      )}
    </div>
  );
};

export default CustomFieldConfiguration;