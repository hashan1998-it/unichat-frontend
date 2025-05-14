import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext';
import api from '@utils/api';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import Button from '@components/common/Button';

const SendRequest = ({ userId, onRequestSent }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { user } = useAuth();

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  const handleSendRequest = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      await api.post(`/connections/send/${userId}`);
      showNotification('Connection request sent successfully');
      if (onRequestSent) {
        onRequestSent();
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
        showNotification(error.response.data.message, 'error');
      } else {
        setError('Failed to send connection request');
        showNotification('Failed to send connection request', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user._id === userId) {
    return null; // Don't show the button for the current user
  }

  return (
    <div>
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      <Button
        variant="primary"
        size="small"
        onClick={handleSendRequest}
        disabled={loading}
      >
        <UserPlusIcon className="h-5 w-5 mr-1" />
        {loading ? 'Sending...' : 'Connect'}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default SendRequest; 