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
  const processedNotificationIds = useRef(new Set());

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      const notificationsData = response.data || [];
      setNotifications(notificationsData);
      // Track processed notification IDs
      notificationsData.forEach(notif => {
        processedNotificationIds.current.add(notif._id);
      });
      // Update unread count based on actual notifications
      const unreadNotifications = notificationsData.filter(n => !n.read);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      if (error.response?.status === 404) {
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
      const response = await api.get('/notifications/unread/count');
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (error.response?.status === 404) {
        setUnreadCount(0);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Set up socket listener for real-time notifications
    const cleanup = socketService.onNotification((notification) => {
      // Check if we've already processed this notification
      if (processedNotificationIds.current.has(notification._id)) {
        console.log('Ignoring duplicate notification:', notification._id);
        return;
      }

      // Add to processed set
      processedNotificationIds.current.add(notification._id);

      // Add to notifications array
      setNotifications(prev => {
        // Double-check that this notification isn't already in the array
        if (prev.some(n => n._id === notification._id)) {
          console.log('Notification already in state:', notification._id);
          return prev;
        }
        return [notification, ...prev];
      });
      
      // Increment unread count if the notification is unread
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      cleanup();
      // Clear processed IDs on unmount
      processedNotificationIds.current.clear();
    };
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
      // Decrease unread count
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read/all');
      setNotifications(prev => prev.map(notification => ({
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
          {unreadCount > 99 ? '99+' : unreadCount}
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
          {notifications
            .filter((notif, index, self) => 
              // Additional filter to ensure no duplicates
              index === self.findIndex(n => n._id === notif._id)
            )
            .map((notification) => (
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