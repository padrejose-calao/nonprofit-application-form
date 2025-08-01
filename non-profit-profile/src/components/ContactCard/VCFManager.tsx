import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, Users, Check, X, AlertCircle } from 'lucide-react';
import { ContactCard } from '../BasicInformation2/types';
import { 
  contactCardToVCF, 
  vcfToContactCard, 
  exportMultipleContactsToVCF, 
  parseMultipleVCF, 
  downloadVCF 
} from '../../utils/vcfUtils';

interface VCFManagerProps {
  contactCards: ContactCard[];
  onImportContact?: (contactCard: ContactCard) => void;
  onImportMultiple?: (contactCards: ContactCard[]) => void;
  className?: string;
}

interface ImportResult {
  success: ContactCard[];
  errors: string[];
}

const VCFManager: React.FC<VCFManagerProps> = ({ 
  contactCards, 
  onImportContact, 
  onImportMultiple, 
  className = '' 
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportSingle = (contactCard: ContactCard) => {
    const vcfContent = contactCardToVCF(contactCard);
    const filename = `${contactCard.name.replace(/[^a-zA-Z0-9]/g, '_')}.vcf`;
    downloadVCF(vcfContent, filename);
  };

  const handleExportAll = () => {
    if (contactCards.length === 0) {
      alert('No contact cards to export');
      return;
    }
    
    const vcfContent = exportMultipleContactsToVCF(contactCards);
    const filename = `contacts_${new Date().toISOString().split('T')[0]}.vcf`;
    downloadVCF(vcfContent, filename);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const importedCards = parseMultipleVCF(content);
      
      const result: ImportResult = {
        success: importedCards,
        errors: []
      };

      // Validate imported cards
      importedCards.forEach((card, index) => {
        if (!card.name || !card.displayName) {
          result.errors.push(`Contact ${index + 1}: Missing required name information`);
        }
      });

      setImportResult(result);
      setShowImportModal(true);
    } catch (error) {
      setImportResult({
        success: [],
        errors: ['Failed to parse VCF file. Please check the file format.']
      });
      setShowImportModal(true);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = () => {
    if (!importResult) return;

    if (importResult.success.length === 1 && onImportContact) {
      onImportContact(importResult.success[0]);
    } else if (importResult.success.length > 1 && onImportMultiple) {
      onImportMultiple(importResult.success);
    } else if (importResult.success.length > 0 && onImportContact) {
      // Import one by one if multiple import handler not available
      importResult.success.forEach(card => onImportContact(card));
    }

    setShowImportModal(false);
    setImportResult(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Export Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          Export Contacts
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Export All Contacts</p>
              <p className="text-xs text-gray-500">
                Download all {contactCards.length} contact cards as a VCF file
              </p>
            </div>
            <button
              onClick={handleExportAll}
              disabled={contactCards.length === 0}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
            >
              <Download className="h-4 w-4" />
              Export All
            </button>
          </div>

          {contactCards.length > 0 && (
            <div className="border-t pt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Export Individual Contacts</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {contactCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {card.type === 'person' ? (
                        <Users className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-green-600" />
                      )}
                      <span className="text-sm text-gray-700">{card.displayName}</span>
                    </div>
                    <button
                      onClick={() => handleExportSingle(card)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Export
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Upload className="h-5 w-5 text-green-600" />
          Import Contacts
        </h3>
        
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Import contacts from VCF (vCard) files. Supports both single contact and multiple contact files.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,.vcard"
              onChange={handleFileImport}
              className="hidden"
              id="vcf-import"
            />
            <label
              htmlFor="vcf-import"
              className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 ${
                isImporting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Processing...' : 'Choose VCF File'}
            </label>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Supported formats: .vcf, .vcard</p>
            <p>Compatible with: Google Contacts, Apple Contacts, Outlook, and other standard vCard applications</p>
          </div>
        </div>
      </div>

      {/* Import Results Modal */}
      {showImportModal && importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Success */}
              {importResult.success.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check className="h-4 w-4" />
                    <span className="font-medium">
                      Successfully parsed {importResult.success.length} contact{importResult.success.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.success.map((card, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        {card.type === 'person' ? (
                          <Users className="h-3 w-3 text-blue-600" />
                        ) : (
                          <FileText className="h-3 w-3 text-green-600" />
                        )}
                        {card.displayName}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">
                      {importResult.errors.length} error{importResult.errors.length > 1 ? 's' : ''} found
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                {importResult.success.length > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Import {importResult.success.length} Contact{importResult.success.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VCFManager;