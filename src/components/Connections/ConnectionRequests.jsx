// src/components/Connections/ConnectionRequests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Notification from '../common/Notification';
import { Check, Close} from '@mui/icons-material';

const ConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/connections/pending');
      console.log('Pending requests response:', response.data);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load connection requests';
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await api.post(`/connections/accept/${requestId}`);
      setRequests(requests.filter(request => request._id !== requestId));
      setNotification({
        show: true,
        message: 'Connection request accepted',
        type: 'success'
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      setNotification({
        show: true,
        message: 'Failed to accept request',
        type: 'error'
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      await api.post(`/connections/reject/${requestId}`);
      setRequests(requests.filter(request => request._id !== requestId));
      setNotification({
        show: true,
        message: 'Connection request rejected',
        type: 'success'
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      setNotification({
        show: true,
        message: 'Failed to reject request',
        type: 'error'
      });
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading connection requests..." />;
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        title="No pending requests"
        description="You don't have any pending connection requests"
      />
    );
  }

  return (
    <div className="space-y-4">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: '', type: '' })}
      />
      
      {requests.map(request => {
        if (!request || !request.sender) return null;
        const sender = request.sender;
        const displayName = sender.username || 'Unknown User';
        
        return (
          <Card key={request._id} hoverable padding="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar
                  src={sender.profilePicture}
                  username={displayName}
                  size="medium"
                  userId={sender._id}
                  isLink
                />
                <div>
                  <h3 
                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => handleViewProfile(sender._id)}
                  >
                    {displayName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {sender.universityId || 'No University ID'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="success"
                  size="small"
                  onClick={() => handleAccept(request._id)}
                >
                  <Check className="mr-1" />
                  Accept
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleReject(request._id)}
                >
                  <Close className="mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ConnectionRequests;