
// src/components/Connections/ConnectionRequestCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Card from '../common/Card';
import { CheckCircleIcon, XMarkIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';

const ConnectionRequestCard = ({ 
  userId, 
  username, 
  profilePicture, 
  universityId, 
  role, 
  connectionStatus, 
  currentUserId,
  onStatusChange 
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAccept = async () => {
    try {
      setLoading(true);
      const pendingResponse = await api.get('/connections/pending');
      const request = pendingResponse.data.find(
        req => req.sender._id === userId && req.receiver._id === currentUserId
      );

      if (request) {
        await api.post(`/connections/accept/${request._id}`);
        onStatusChange(userId, 'connected');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const pendingResponse = await api.get('/connections/pending');
      const request = pendingResponse.data.find(
        req => req.sender._id === userId && req.receiver._id === currentUserId
      );

      if (request) {
        await api.delete(`/connections/cancel/${request._id}`);
        onStatusChange(userId, 'none');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const pendingResponse = await api.get('/connections/pending');
      const request = pendingResponse.data.find(
        req => req.sender._id === currentUserId && req.receiver._id === userId
      );

      if (request) {
        await api.delete(`/connections/cancel/${request._id}`);
        onStatusChange(userId, 'none');
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      await api.post(`/connections/send/${userId}`);
      onStatusChange(userId, 'pending');
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (connectionStatus === 'connected') {
      return (
        <Button className="w-full" variant="success" disabled>
          <CheckCircleIcon className="h-5 w-5 mr-1" />
          Connected
        </Button>
      );
    }

    if (connectionStatus === 'pending') {
      return (
        <Button
          className="w-full"
          variant="secondary"
          onClick={handleCancel}
          disabled={loading}
        >
          <UserMinusIcon className="h-5 w-5 mr-1" />
          {loading ? 'Cancelling...' : 'Cancel Request'}
        </Button>
      );
    }

    if (connectionStatus === 'received') {
      return (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 text-center">Pending request</p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="success"
              onClick={handleAccept}
              disabled={loading}
              size="small"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              className="flex-1"
              variant="danger"
              onClick={handleReject}
              disabled={loading}
              size="small"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      );
    }

    return (
      <Button
        className="w-full"
        onClick={handleConnect}
        disabled={loading}
      >
        <UserPlusIcon className="h-5 w-5 mr-1" />
        {loading ? 'Sending...' : 'Connect'}
      </Button>
    );
  };

  return (
    <Card hoverable className="overflow-hidden group" padding="p-0">
      <div className="h-24 bg-gradient-to-r from-blue-400 to-purple-600"></div>
      <div className="px-6 pb-6 relative">
        <div className="flex items-end justify-between mb-4 -mt-12">
          <Avatar
            src={profilePicture}
            username={username}
            userId={userId}
            isLink
            size="large"
            showBorder
            borderColor="white"
            className="shadow-lg group-hover:scale-105 transition-transform"
          />
          {role && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              role === 'professor' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {role}
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigate(`/profile/${userId}`)}
          >
            {username}
          </h3>
          <p className="text-sm text-gray-500">{universityId || 'No University ID'}</p>
          
          <div className="mt-4">
            {renderActionButtons()}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConnectionRequestCard;