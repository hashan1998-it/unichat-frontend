import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  centered = true,
  showMessage = true,
  className = '' 
}) => {
  const sizes = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizes[size]}`}></div>
  );

  const content = (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      {spinner}
      {showMessage && (
        <p className="mt-4 text-gray-500">{message}</p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex justify-center items-center p-8">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;