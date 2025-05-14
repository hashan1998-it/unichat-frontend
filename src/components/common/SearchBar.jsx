import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onSearch,
  onClear,
  size = 'medium',
  showClearButton = true,
  className = '',
  ...props
}) => {
  const sizes = {
    small: 'py-1.5 px-3 pr-9 text-sm',
    medium: 'py-2 px-4 pr-10',
    large: 'py-3 px-5 pr-12 text-lg'
  };

  const iconSizes = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange({ target: { value: '' } });
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className={`${iconSizes[size]} text-gray-400`} />
      </div>
      
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={`w-full ${sizes[size]} ${
          showClearButton && value ? 'pr-8' : ''
        } pl-10 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-gray-300 transition-colors`}
        {...props}
      />
      
      {showClearButton && value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <XMarkIcon className={`${iconSizes[size]} text-gray-400 hover:text-gray-600`} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;