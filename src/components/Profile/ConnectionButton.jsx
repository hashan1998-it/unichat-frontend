import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import Button from '../common/Button';
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  CheckBadgeIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ConnectionButton = ({ userId, currentUserId, onStatusChange }) => {
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, [userId, currentUserId]);

  const checkConnectionStatus = async () => {
    try {
      setLoading(true);
      
      // First check if users are already connected
      const [userResponse, currentUserResponse] = await Promise.all([
        api.get(`/users/profile/${userId}`),
        api.get(`/users/profile/${currentUserId}`)
      ]);
      
      const userConnections = userResponse.data.connections || [];
      const currentUserConnections = currentUserResponse.data.connections || [];
      
      // Check if connected (both ways to be sure)
      if (userConnections.includes(currentUserId) || currentUserConnections.includes(userId)) {
        setConnectionStatus('connected');
        return;
      }

      // If not connected, check for pending requests
      const pendingResponse = await api.get('/connections/pending');
      const pendingRequests = pendingResponse.data || [];
      
      const request = pendingRequests.find(
        req => 
          (req.sender._id === currentUserId && req.receiver._id === userId && req.status === 'pending') ||
          (req.sender._id === userId && req.receiver._id === currentUserId && req.status === 'pending')
      );

      if (request) {
        setRequestId(request._id);
        // Determine if current user is sender or receiver
        if (request.sender._id === currentUserId) {
          setConnectionStatus('pending');
        } else {
          setConnectionStatus('received');
        }
      } else {
        setConnectionStatus('none');
        setRequestId(null);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus('none');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/connections/send/${userId}`);
      // Store the request ID for future operations
      setRequestId(response.data._id);
      setConnectionStatus('pending');
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setLoading(true);
      await api.delete(`/connections/cancel/${requestId}`);
      setConnectionStatus('none');
      setRequestId(null);
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Error cancelling request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setLoading(true);
      await api.post(`/connections/accept/${requestId}`);
      setConnectionStatus('connected');
      if (onStatusChange) onStatusChange();
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (userId === currentUserId) {
    return null;
  }

  switch (connectionStatus) {
    case 'connected':
      return (
        <Button variant="success" disabled>
          <CheckBadgeIcon className="h-5 w-5 mr-2" />
          Connected
        </Button>
      );

    case 'pending':
      return (
        <Button 
          variant="secondary" 
          onClick={handleCancelRequest}
          disabled={loading}
        >
          <UserMinusIcon className="h-5 w-5 mr-2" />
          {loading ? 'Cancelling...' : 'Cancel Request'}
        </Button>
      );

    case 'received':
      return (
        <div className="flex gap-3">
          <Button 
            variant="success" 
            onClick={handleAcceptRequest}
            disabled={loading}
            size="small"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelRequest}
            disabled={loading}
            size="small"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Decline
          </Button>
        </div>
      );

    default:
      return (
        <Button 
          onClick={handleSendRequest}
          disabled={loading}
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          {loading ? 'Sending...' : 'Connect'}
        </Button>
      );
  }
};

export default ConnectionButton;