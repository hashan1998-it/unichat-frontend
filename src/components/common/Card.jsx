import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hoverable = false, 
  padding = 'p-6',
  onClick,
  ...props 
}) => {
  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow duration-300' : '';
  const clickClass = onClick ? 'cursor-pointer' : '';
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm ${hoverClass} ${clickClass} ${padding} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;