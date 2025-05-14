import React, { useState } from 'react';

const Tabs = ({ 
  tabs, 
  defaultTab = 0, 
  onChange,
  variant = 'default',
  className = '' 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };

  const variants = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-2 -mb-px text-sm font-medium text-gray-600 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300',
      activeTab: 'px-4 py-2 -mb-px text-sm font-medium text-blue-600 border-b-2 border-blue-600'
    },
    pills: {
      container: 'flex space-x-1 bg-gray-100 p-1 rounded-lg',
      tab: 'flex-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-200 transition-colors',
      activeTab: 'flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md'
    }
  };

  const style = variants[variant];

  return (
    <div className={className}>
      <div className={style.container}>
        <nav className="flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={activeTab === index ? style.activeTab : style.tab}
              aria-selected={activeTab === index}
            >
              {tab.icon && <tab.icon className="h-5 w-5 mr-2" />}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;