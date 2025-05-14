import React from 'react';

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  actionButton,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      )}
      {title && (
        <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-500 mb-6">{description}</p>
      )}
      {actionButton}
    </div>
  );
};

export default EmptyState;