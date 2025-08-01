import React, { useState } from 'react';
import { 
  Users, Plus, Trash2, Mail, Phone, Building,
  Star, CheckCircle, FileText, Award
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Reference {
  id: string | number;
  name: string;
  title: string;
  organization: string;
  relationship: string;
  email: string;
  phone: string;
  yearsKnown: number;
  referenceType: 'professional' | 'board' | 'funder' | 'partner' | 'client';
  notes: string;
}

interface ReferencesSectionProps {
  references: Reference[];
  errors: unknown;
  locked: boolean;
  onReferencesChange: (references: Reference[]) => void;
  onFileUpload?: (field: string, file: File) => void;
  formData?: unknown;
  onInputChange?: (field: string, value: unknown) => void;
}

const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  references,
  errors,
  locked,
  onReferencesChange,
  onFileUpload,
  formData,
  onInputChange
}) => {
  const [expandedReference, setExpandedReference] = useState<string | number | null>(null);

  const referenceTypes = [
    { value: 'professional', label: 'Professional Reference' },
    { value: 'board', label: 'Board Member' },
    { value: 'funder', label: 'Funder/Donor' },
    { value: 'partner', label: 'Partner Organization' },
    { value: 'client', label: 'Client/Beneficiary' }
  ];

  const addReference = () => {
    const newReference: Reference = {
      id: Date.now(),
      name: '',
      title: '',
      organization: '',
      relationship: '',
      email: '',
      phone: '',
      yearsKnown: 0,
      referenceType: 'professional',
      notes: ''
    };
    onReferencesChange([...references, newReference]);
  };

  const updateReference = (id: string | number, updates: Partial<Reference>) => {
    onReferencesChange(references.map(ref => 
      ref.id === id ? { ...ref, ...updates } : ref
    ));
  };

  const removeReference = (id: string | number) => {
    onReferencesChange(references.filter(ref => ref.id !== id));
    toast.info('Reference removed');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'board': return 'bg-green-100 text-green-800';
      case 'funder': return 'bg-purple-100 text-purple-800';
      case 'partner': return 'bg-orange-100 text-orange-800';
      case 'client': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* References Overview */}
      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Professional References
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{references.length}</div>
            <div className="text-sm text-gray-600">Total References</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">
              {references.filter(r => r.referenceType === 'professional').length}
            </div>
            <div className="text-sm text-gray-600">Professional</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">
              {references.filter(r => r.referenceType === 'funder').length}
            </div>
            <div className="text-sm text-gray-600">Funders</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {references.filter(r => r.referenceType === 'partner').length}
            </div>
            <div className="text-sm text-gray-600">Partners</div>
          </div>
        </div>

        {/* Reference Guidelines */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-2">Reference Guidelines</h4>
          <p className="text-sm text-gray-600 mb-2">
            Please provide references who can speak to your organization's effectiveness, 
            leadership, and impact. Include a mix of professional contacts, funders, 
            partners, and community leaders who know your work well.
          </p>
          <div className="text-xs text-gray-500">
            <strong>Note:</strong> You may want to contact your references before submitting 
            their information to let them know they may be contacted.
          </div>
        </div>
      </div>

      {/* References List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="font-semibold">Reference Contacts</h4>
          <button
            type="button"
            onClick={addReference}
            disabled={locked}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Reference
          </button>
        </div>

        {references.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No references added yet.</p>
            <p className="text-sm text-gray-500">Click "Add Reference" to add professional references.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {references.map((reference) => (
              <div key={reference.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={reference.name}
                        onChange={(e) => updateReference(reference.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                        placeholder="Full name"
                        disabled={locked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={reference.title}
                        onChange={(e) => updateReference(reference.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                        placeholder="Job title"
                        disabled={locked}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Reference Type</label>
                      <select
                        value={reference.referenceType}
                        onChange={(e) => updateReference(reference.id, { referenceType: e.target.value as 'professional' | 'board' | 'funder' | 'partner' | 'client' })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                        disabled={locked}
                      >
                        {referenceTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs ${getTypeColor(reference.referenceType)}`}>
                      {referenceTypes.find(t => t.value === reference.referenceType)?.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedReference(
                        expandedReference === reference.id ? null : reference.id
                      )}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      {expandedReference === reference.id ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeReference(reference.id)}
                      disabled={locked}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedReference === reference.id && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Organization & Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Organization</label>
                        <input
                          type="text"
                          value={reference.organization}
                          onChange={(e) => updateReference(reference.id, { organization: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                          placeholder="Organization name"
                          disabled={locked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Relationship to Organization</label>
                        <input
                          type="text"
                          value={reference.relationship}
                          onChange={(e) => updateReference(reference.id, { relationship: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                          placeholder="How they know your organization"
                          disabled={locked}
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={reference.email}
                          onChange={(e) => updateReference(reference.id, { email: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                          placeholder="email@example.com"
                          disabled={locked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={reference.phone}
                          onChange={(e) => updateReference(reference.id, { phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                          placeholder="Phone number"
                          disabled={locked}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Years Known</label>
                        <input
                          type="number"
                          value={reference.yearsKnown}
                          onChange={(e) => updateReference(reference.id, { yearsKnown: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                          min="0"
                          disabled={locked}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Additional Notes</label>
                      <textarea
                        value={reference.notes}
                        onChange={(e) => updateReference(reference.id, { notes: e.target.value })}
                        className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Any additional context about this reference..."
                        disabled={locked}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference Context */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h4 className="font-semibold mb-4">Reference Context & Permissions</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-2">
              Reference Permission Statement
            </label>
            <textarea
              value={(formData as any)?.referencePermission || ''}
              onChange={(e) => onInputChange?.('referencePermission', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Confirm that you have permission to list these references and that they are aware they may be contacted..."
              disabled={locked}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">
              What Should References Emphasize?
            </label>
            <textarea
              value={(formData as any)?.referenceGuidance || ''}
              onChange={(e) => onInputChange?.('referenceGuidance', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="What key points would you like your references to emphasize about your organization?"
              disabled={locked}
            />
          </div>
        </div>
      </div>

      {/* Reference Letters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Reference Letters & Testimonials
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Letters
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onFileUpload) {
                  onFileUpload('referenceLetters', file);
                  toast.success('Reference letters uploaded');
                }
              }}
              accept=".pdf,.doc,.docx"
              disabled={locked}
              className="block"
              multiple
            />
            <small className="text-gray-500 block mt-1">
              Upload any reference letters or testimonials you have received
            </small>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Testimonials & Endorsements
            </label>
            <textarea
              value={(formData as any)?.testimonials || ''}
              onChange={(e) => onInputChange?.('testimonials', e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
              rows={4}
              placeholder="Include any notable testimonials or endorsements from community leaders, clients, or partners..."
              disabled={locked}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferencesSection;