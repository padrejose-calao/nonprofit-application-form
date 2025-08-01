import React, { useState, useEffect } from 'react';
import { Settings, Shield, Check, X, Save } from 'lucide-react';
import { fieldProgressService } from '../services/fieldProgressService';
import { ownerAuthService } from '../services/ownerAuthService';
import { toast } from 'react-hot-toast';

interface SuperuserFieldSettingsProps {
  sections: Array<{
    id: string;
    name: string;
    fields: Array<{
      id: string;
      label: string;
    }>;
  }>;
  currentUserEmail: string;
  onClose: () => void;
}

const SuperuserFieldSettings: React.FC<SuperuserFieldSettingsProps> = ({
  sections,
  currentUserEmail,
  onClose
}) => {
  const [requiredFields, setRequiredFields] = useState<{[key: string]: boolean}>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if user is authorized
  const isAuthorized = ownerAuthService.isProtectedOwner(currentUserEmail);

  useEffect(() => {
    if (!isAuthorized) {
      toast.error('Unauthorized access to superuser settings');
      onClose();
      return;
    }

    // Load current required field settings
    const loadRequiredFields = () => {
      const fields: {[key: string]: boolean} = {};
      sections.forEach(section => {
        section.fields.forEach(field => {
          const fieldKey = `${section.id}.${field.id}`;
          fields[fieldKey] = fieldProgressService.isFieldRequired(section.id, field.id);
        });
      });
      setRequiredFields(fields);
    };

    loadRequiredFields();
  }, [sections, isAuthorized, currentUserEmail, onClose]);

  const handleFieldToggle = (sectionId: string, fieldId: string) => {
    const fieldKey = `${sectionId}.${fieldId}`;
    setRequiredFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each field setting
      for (const [fieldKey, required] of Object.entries(requiredFields)) {
        const [sectionId, fieldId] = fieldKey.split('.');
        await fieldProgressService.setRequiredField(sectionId, fieldId, required);
      }
      
      toast.success('Required field settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-red-600 text-white">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6" />
            <h2 className="text-xl font-bold">Superuser Field Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> These settings affect all users. Required fields must be completed before form submission.
            </p>
          </div>

          {sections.map(section => (
            <div key={section.id} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {section.name}
              </h3>
              <div className="space-y-3">
                {section.fields.map(field => {
                  const fieldKey = `${section.id}.${field.id}`;
                  const isRequired = requiredFields[fieldKey] || false;
                  
                  return (
                    <div 
                      key={field.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <label className="flex items-center cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isRequired}
                          onChange={() => handleFieldToggle(section.id, field.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="ml-3 text-gray-700">{field.label}</span>
                      </label>
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${isRequired 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {isRequired ? 'Required' : 'Optional'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Logged in as: <strong>{currentUserEmail}</strong>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`
                px-4 py-2 rounded-lg font-medium flex items-center space-x-2
                ${hasChanges && !saving
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperuserFieldSettings;