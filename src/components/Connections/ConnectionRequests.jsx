import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@utils/api';
import { Avatar, Typography, Box, CircularProgress } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import Button from '@components/common/Button';

const ConnectionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No pending connection requests
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {notification.show && (
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {notification.message}
        </Box>
      )}
      {requests.map(request => {
        if (!request || !request.sender) return null;
        const sender = request.sender;
        const displayName = sender.username || 'Unknown User';
        const initial = displayName.charAt(0).toUpperCase();
        
        return (
          <Box 
            key={request._id} 
            className="bg-white rounded-lg shadow p-4 mb-4"
          >
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-4">
                <Avatar
                  src={sender.profilePicture}
                  alt={displayName}
                  sx={{ width: 40, height: 40 }}
                >
                  {initial}
                </Avatar>
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    className="cursor-pointer hover:underline"
                    onClick={() => handleViewProfile(sender._id)}
                  >
                    {displayName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sender.universityId || 'No University ID'}
                  </Typography>
                </Box>
              </Box>
              <Box className="flex gap-2">
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
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ConnectionRequests; 