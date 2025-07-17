import React from 'react';

interface NavigationSidebarProps {
  sections: string[];
  currentSection: string;
  onSectionChange: (section: string) => void;
  completedSections: string[];
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  sections,
  currentSection,
  onSectionChange,
  completedSections,
}) => {
  const sectionLabels: Record<string, string> = {
    taxIdentification: 'Tax Identification',
    organizationIdentity: 'Organization Identity',
    organizationalAddress: 'Physical Address',
    taxExemptStatus: '501(c)(3) Status',
    organizationalCommunication: 'Communication',
    contactPersons: 'Key Personnel',
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Navigation
        </h2>
        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => onSectionChange(section)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentSection === section
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={completedSections.includes(section)}
                  readOnly
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span>{sectionLabels[section] || section}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default NavigationSidebar;