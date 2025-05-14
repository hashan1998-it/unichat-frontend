import React from 'react';
import { Link } from 'react-router-dom';

const Avatar = ({ 
  src, 
  alt, 
  username, 
  size = 'medium', 
  isLink = false, 
  userId,
  className = '',
  showBorder = false,
  borderColor = 'blue-100'
}) => {
  const sizes = {
    small: 'h-8 w-8 text-sm',
    medium: 'h-12 w-12 text-base',
    large: 'h-24 w-24 text-3xl',
    xlarge: 'h-32 w-32 text-4xl'
  };

  const borderClass = showBorder ? `border-4 border-${borderColor}` : '';

  const avatarContent = src ? (
    <img
      src={src}
      alt={alt || `${username}'s profile`}
      className={`${sizes[size]} rounded-full object-cover ${borderClass} ${className}`}
    />
  ) : (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center ${borderClass} ${className}`}>
      <span className="text-white font-medium">
        {username?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  );

  if (isLink && userId) {
    return (
      <Link to={`/profile/${userId}`} className="flex-shrink-0">
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
};

export default Avatar;