// src/components/Notifications/NotificationButton.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import socketService from '../../utils/socket';
import { Dropdown, EmptyState, LoadingSpinner } from '../common';
import { BellSlashIcon } from '@heroicons/react/24/outline';

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications...');
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 404) {
        // If endpoint doesn't exist, show empty state instead of error
        setNotifications([]);
        setError(null);
      } else {
        setError('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('Fetching unread count...');
      const response = await api.get('/notifications/unread/count');
      console.log('Unread count response:', response.data);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (error.response?.status === 404) {
        // If endpoint doesn't exist, default to 0
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    console.log('NotificationButton mounted');
    fetchNotifications();
    fetchUnreadCount();

    // Set up socket listener for real-time notifications
    const cleanup = socketService.onNotification((notification) => {
      console.log('Received real-time notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      console.log('NotificationButton unmounting');
      cleanup();
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      await api.put('/notifications/read/all');
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
        return '👥';
      case 'connection_accepted':
        return '✅';
      case 'post_like':
        return '❤️';
      case 'post_comment':
        return '💬';
      default:
        return '📢';
    }
  };

  const bellTrigger = (
    <button className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
      <BellIcon className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-4">
          <LoadingSpinner size="small" message="Loading notifications..." centered={false} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="p-8">
          <EmptyState
            icon={BellSlashIcon}
            title="No notifications"
            description="You'll be notified when something happens"
          />
        </div>
      );
    }

    return (
      <>
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <Link
              key={notification._id}
              to={notification.link || '#'}
              onClick={() => {
                if (!notification.read) {
                  handleMarkAsRead(notification._id);
                }
              }}
              className={`block p-4 hover:bg-gray-50 border-b border-gray-200 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{notification.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="p-3 text-center border-t border-gray-200">
          <Link
            to="/notifications"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all notifications
          </Link>
        </div>
      </>
    );
  };

  return (
    <Dropdown
      trigger={bellTrigger}
      position="bottom-right"
      className="w-80"
      closeOnItemClick={false}
    >
      {renderContent()}
    </Dropdown>
  );
};

export default NotificationButton;