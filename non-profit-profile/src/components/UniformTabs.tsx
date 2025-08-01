import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface UniformTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const UniformTabs: React.FC<UniformTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="flex space-x-1 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-3 font-medium text-sm transition-all duration-200
              flex items-center space-x-2 rounded-t-lg
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }
            `}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`
                ml-2 px-2 py-0.5 text-xs rounded-full font-semibold
                ${activeTab === tab.id
                  ? 'bg-white bg-opacity-20 text-white'
                  : 'bg-gray-300 text-gray-700'
                }
              `}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UniformTabs;