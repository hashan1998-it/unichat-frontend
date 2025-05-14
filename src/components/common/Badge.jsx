import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'medium',
  icon: Icon,
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    role: {
      student: 'bg-blue-100 text-blue-600',
      professor: 'bg-purple-100 text-purple-600',
      admin: 'bg-red-100 text-red-600'
    }
  };

  const sizes = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const badgeStyle = variant.includes('.') 
    ? variants.role[variant.split('.')[1]] 
    : variants[variant];

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${badgeStyle} ${sizes[size]} ${className}`}>
      {Icon && <Icon className={`h-4 w-4 ${children ? 'mr-1.5' : ''}`} />}
      {children}
    </span>
  );
};

export default Badge;