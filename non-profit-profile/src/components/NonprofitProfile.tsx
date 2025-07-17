import React, { useState } from 'react';
import BasicInformation2 from './BasicInformation2/BasicInformation';

interface NonprofitProfileProps {}

const NonprofitProfile: React.FC<NonprofitProfileProps> = () => {
  const [currentSection, setCurrentSection] = useState('basic-information');
  const [submitted, setSubmitted] = useState(false);

  const sections = [
    { id: 'basic-information', name: 'Basic Information', component: BasicInformation2 },
    { id: 'program-information', name: 'Program Information', component: null },
    { id: 'financial-information', name: 'Financial Information', component: null },
    { id: 'organization-structure', name: 'Organization Structure', component: null },
    { id: 'impact-measurement', name: 'Impact Measurement', component: null },
    { id: 'partnerships', name: 'Partnerships & Collaborations', component: null },
    { id: 'additional-info', name: 'Additional Information', component: null },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Application Submitted!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Thank you for your nonprofit profile submission. We'll review your information and get back to you soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  const renderCurrentSection = () => {
    const section = sections.find(s => s.id === currentSection);
    
    if (section?.component) {
      const Component = section.component;
      return <Component />;
    }

    // Placeholder for sections not yet implemented
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {section?.name || 'Section'}
        </h2>
        <p className="text-gray-600">
          This section is coming soon. Please check back later or complete other sections.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Nonprofit Profile Application</h1>
            <button
              onClick={() => setSubmitted(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Submit Application
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Section Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Application Sections
              </h3>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        currentSection === section.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {section.name}
                      {section.component && (
                        <span className="ml-2 text-xs text-green-600">✓</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Progress Summary */}
            <div className="bg-white rounded-lg shadow p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Progress</h3>
              <div className="text-2xl font-bold text-blue-600">
                1 of 7
              </div>
              <p className="text-xs text-gray-500 mt-1">sections available</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {renderCurrentSection()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default NonprofitProfile;