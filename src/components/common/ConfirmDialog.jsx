import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon: Icon = ExclamationTriangleIcon,
  loading = false
}) => {
  const iconColors = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    success: 'text-green-600',
    primary: 'text-blue-600'
  };

  const bgColors = {
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    success: 'bg-green-100',
    primary: 'bg-blue-100'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      closeOnOverlayClick={false}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-full ${bgColors[variant]}`}>
          <Icon className={`h-6 w-6 ${iconColors[variant]}`} />
        </div>
        <div className="flex-1">
          <p className="text-gray-700">{message}</p>
          <div className="mt-4 flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;