import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Notification = ({ 
  show, 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose,
  position = 'top-right' 
}) => {
  useEffect(() => {
    if (show && duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const types = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: XCircleIcon,
      iconColor: 'text-red-600'
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600'
    }
  };

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div className={`fixed ${positions[position]} z-50 transition-all duration-300`}>
      <div className={`flex items-center p-4 rounded-lg shadow-lg ${config.bg} ${config.text}`}>
        <Icon className={`h-5 w-5 ${config.iconColor} mr-3 flex-shrink-0`} />
        <p className="font-medium">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-4 ${config.text} hover:opacity-80`}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;