import React, { useCallback, useState, useRef } from 'react';
import { 
  X, Download, Upload, FileJson, FileText, 
  FileSpreadsheet, FilePlus, Package, AlertTriangle,
  CheckCircle, Info, RefreshCw, Eye
} from 'lucide-react';
import { dataExportImportService, ExportOptions } from '../services/dataExportImportService';

interface ImportOptions {
  merge: boolean;
  validateSchema: boolean;
  dryRun: boolean;
  overwrite?: boolean;
}

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: string;
  organizationId: string;
}

const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  dataType,
  organizationId
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeMetadata: true,
    includeAttachments: false,
    includeAuditLog: false,
    sections: []
  });
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    merge: true,
    validateSchema: true,
    dryRun: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportResult, setExportResult] = useState<unknown>(null);
  const [importResult, setImportResult] = useState<unknown>(null);
  const [importPreview, setImportPreview] = useState<unknown>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
      setImportPreview(null);
    }
  }, []);

  const handleExport = async () => {
    setLoading(true);
    setExportResult(null);
    
    try {
      const result = await dataExportImportService.exportData(dataType, exportOptions);
      
      if (result.success) {
        await dataExportImportService.downloadExport(result);
        setExportResult({
          success: true,
          message: `Successfully exported ${dataType} data as ${exportOptions.format.toUpperCase()}`
        });
      } else {
        setExportResult({
          success: false,
          message: result.error || 'Export failed'
        });
      }
    } catch (error: unknown) {
      setExportResult({
        success: false,
        message: (error as any)?.message || 'Export failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportPreview = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setImportPreview(null);
    
    try {
      const result = await dataExportImportService.importData(
        selectedFile,
        dataType,
        { ...importOptions, dryRun: true }
      );
      
      setImportPreview(result);
    } catch (error: unknown) {
      setImportResult({
        success: false,
        message: (error as any)?.message || 'Preview failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setImportResult(null);
    
    try {
      const result = await dataExportImportService.importData(
        selectedFile,
        dataType,
        { ...importOptions, dryRun: false }
      );
      
      if (result.success) {
        setImportResult({
          success: true,
          message: `Successfully imported ${result.imported || 0} items`,
          details: result
        });
        
        // Clear file selection after successful import
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setImportResult({
          success: false,
          message: 'Import failed',
          errors: result.errors
        });
      }
    } catch (error: unknown) {
      setImportResult({
        success: false,
        message: (error as any)?.message || 'Import failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json': return <FileJson className="w-4 h-4" />;
      case 'csv': return <FileText className="w-4 h-4" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'zip': return <Package className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Export/Import {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </div>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Import Data
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {activeTab === 'export' && (
              <>
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {(['json', 'csv', 'excel', 'pdf', 'zip'] as const).map(format => (
                    <button
                      key={format}
                      onClick={() => setExportOptions({ ...exportOptions, format })}
                      className={`p-3 border rounded-lg transition-all ${
                        exportOptions.format === format
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {getFormatIcon(format)}
                        <span className="text-xs font-medium uppercase">{format}</span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  {exportOptions.format === 'json' && 'Best for re-importing data and API integration'}
                  {exportOptions.format === 'csv' && 'Compatible with Excel and other spreadsheet applications'}
                  {exportOptions.format === 'excel' && 'Native Excel format (currently exports as CSV)'}
                  {exportOptions.format === 'pdf' && 'Human-readable report format'}
                  {exportOptions.format === 'zip' && 'Complete archive with all data and metadata'}
                </p>
              </div>

              {/* Export Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include in Export
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeMetadata: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include metadata (dates, versions, etc.)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAttachments}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeAttachments: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include file attachments</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeAuditLog}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        includeAuditLog: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include audit log history</span>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        dateRange: {
                          start: new Date(e.target.value),
                          end: exportOptions.dateRange?.end || new Date()
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        dateRange: {
                          start: exportOptions.dateRange?.start || new Date(0),
                          end: new Date(e.target.value)
                        }
                      })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Export Result */}
              {exportResult && (
                <div className={`p-4 rounded-lg flex items-start gap-3 ${
                  (exportResult as any).success 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {(exportResult as any).success ? (
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">{(exportResult as any).message}</p>
                  </div>
                </div>
              )}
              </>
            )}
            {activeTab === 'import' && (
              <>
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File to Import
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-4 border-2 border-dashed rounded-lg hover:border-gray-400 transition-colors"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FilePlus className="w-8 h-8 text-blue-500" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to select file or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supports JSON, CSV, and ZIP files
                        </p>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Import Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Import Options
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importOptions.merge === true && importOptions.overwrite !== true}
                        onChange={() => setImportOptions({
                          ...importOptions,
                          merge: true,
                          overwrite: false
                        })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Merge with existing data</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importOptions.overwrite === true}
                        onChange={() => setImportOptions({
                          ...importOptions,
                          merge: false,
                          overwrite: true
                        })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Overwrite existing data</span>
                    </label>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={importOptions.validateSchema}
                      onChange={(e) => setImportOptions({
                        ...importOptions,
                        validateSchema: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Validate data schema before import</span>
                  </label>
                </div>
              </div>

              {/* Import Preview */}
              {importPreview && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-2">Import Preview</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p>• Will import: {(importPreview as any).imported || 0} items</p>
                        {(importPreview as any).skipped > 0 && (
                          <p>• Will skip: {(importPreview as any).skipped} duplicate items</p>
                        )}
                        {(importPreview as any).warnings?.map((warning: string, idx: number) => (
                          <p key={idx} className="text-orange-700">⚠ {warning}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className={`p-4 rounded-lg ${
                  (importResult as any).success 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {(importResult as any).success ? (
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{(importResult as any).message}</p>
                      {(importResult as any).details && (
                        <div className="mt-2 text-sm space-y-1">
                          <p>• Imported: {(importResult as any).details.imported || 0} items</p>
                          {(importResult as any).details.skipped > 0 && (
                            <p>• Skipped: {(importResult as any).details.skipped} items</p>
                          )}
                          {(importResult as any).details.warnings?.map((warning: string, idx: number) => (
                            <p key={idx}>• {warning}</p>
                          ))}
                        </div>
                      )}
                      {(importResult as any).errors && (
                        <div className="mt-2 text-sm space-y-1">
                          {(importResult as any).errors.map((error: string, idx: number) => (
                            <p key={idx}>• {error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          {activeTab === 'export' && (
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </button>
          )}
          {activeTab === 'import' && (
            <>
              {selectedFile && !(importResult as any)?.success && (
                <button
                  onClick={handleImportPreview}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              )}
              <button
                onClick={handleImport}
                disabled={!selectedFile || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import Data
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportModal;