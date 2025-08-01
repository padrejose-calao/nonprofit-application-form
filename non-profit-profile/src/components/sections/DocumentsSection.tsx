import { FileText, Upload, Trash2 } from 'lucide-react';
import React from 'react';

interface DocumentsSectionProps {
  documents: any[];
  setDocuments: (docs: any[]) => void;
  errors: any;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documents, setDocuments, errors }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocs = Array.from(files).map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        uploadDate: new Date().toISOString(),
      }));
      setDocuments([...documents, ...newDocs]);
    }
  };

  const removeDocument = (docId: any) => {
    setDocuments(documents.filter((doc) => doc.id !== docId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <FileText className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Supporting Documents</h2>
      </div>

      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-4">Please upload supporting documents such as:</p>
        <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
          <li>IRS 501(c)(3) determination letter</li>
          <li>Most recent audited financial statements or Form 990</li>
          <li>Organizational chart</li>
          <li>Board of Directors list</li>
          <li>Annual report (if available)</li>
        </ul>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX (MAX. 10MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileUpload}
            />
          </label>
        </div>
        {errors.documents && <p className="text-red-500 text-sm mt-1">{errors.documents}</p>}
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h3>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeDocument(doc.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
