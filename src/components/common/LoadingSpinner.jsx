import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  centered = true,
  showMessage = true,
  className = '' 
}) => {
  const sizes = {
    small: { spinner: 'h-8 w-8', logo: 'text-base' },
    medium: { spinner: 'h-12 w-12', logo: 'text-xl' },
    large: { spinner: 'h-16 w-16', logo: 'text-2xl' }
  };

  const currentSize = sizes[size];

  const spinner = (
    <div className="relative">
      {/* Outer spinning ring */}
      <div className={`${currentSize.spinner} animate-spin`}>
        <div className="h-full w-full rounded-full border-4 border-blue-200/30 border-t-blue-600"></div>
      </div>
      
      {/* Inner spinning ring */}
      <div className={`absolute inset-0 ${currentSize.spinner} animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
        <div className="h-full w-full rounded-full border-4 border-purple-200/30 border-b-purple-600"></div>
      </div>
      
      {/* Center logo/text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${currentSize.logo}`}>
          UC
        </span>
      </div>
    </div>
  );

  const content = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {spinner}
      {showMessage && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 font-medium">{message}</p>
          <p className="text-sm text-gray-400 mt-1">UniChat</p>
        </div>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-8">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;