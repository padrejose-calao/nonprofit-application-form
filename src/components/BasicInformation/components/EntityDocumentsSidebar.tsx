import React, { useState } from 'react';
import { DocumentUpload } from '../types';

interface EntityDocumentsSidebarProps {
  documents: DocumentUpload[];
}

const EntityDocumentsSidebar: React.FC<EntityDocumentsSidebarProps> = ({ documents }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['taxDocs']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const documentsBySection = documents.reduce((acc, doc) => {
    const section = doc.sectionId || 'other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(doc);
    return acc;
  }, {} as Record<string, DocumentUpload[]>);

  const sectionLabels: Record<string, string> = {
    taxDocs: 'Tax Documents',
    orgDocs: 'Organization Documents',
    addressDocs: 'Address Documents',
    personnelDocs: 'Personnel Documents',
    other: 'Other Documents',
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-l">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Entity Documents
        </h2>
        <div className="space-y-2">
          {Object.entries(documentsBySection).map(([section, docs]) => (
            <div key={section}>
              <button
                onClick={() => toggleSection(section)}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{sectionLabels[section] || section}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedSections.includes(section) ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              {expandedSections.includes(section) && (
                <div className="ml-4 mt-1 space-y-1">
                  {docs.map((doc) => (
                    <button
                      key={doc.id}
                      className="w-full text-left px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded truncate"
                      title={doc.fileName}
                    >
                      • {doc.fileName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default EntityDocumentsSidebar;