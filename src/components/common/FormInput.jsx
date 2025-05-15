import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  helpText,
  icon: Icon,
  showPasswordToggle = false,
  showPassword,
  onTogglePassword,
  className = '',
  ...props
}) => {
  // Determine the actual input type
  const inputType = showPasswordToggle 
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        )}
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            showPasswordToggle ? 'pr-12' : ''
          }`}
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormInput;