import React from 'react';

const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  required = false,
  disabled = false,
  maxLength,
  showCount = false,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          {...props}
        />
        
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {value?.length || 0}/{maxLength}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default TextArea;