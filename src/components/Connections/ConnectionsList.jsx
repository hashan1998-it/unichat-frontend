import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import SendRequest from './SendRequest';

const ConnectionsList = ({ userId }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadConnections();
  }, [userId]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}/connections`);
      setConnections(response.data);
      setError('');
    } catch (error) {
      setError('Failed to load connections');
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {userId === user._id ? 'Your Connections' : 'Connections'}
      </h2>
      
      {connections.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No connections yet
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <div
              key={connection._id}
              className="bg-white rounded-lg shadow p-4 flex items-center space-x-4"
            >
              <Link to={`/profile/${connection._id}`} className="flex-shrink-0">
                <img
                  src={connection.profilePicture || '/default-avatar.png'}
                  alt={connection.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              </Link>
              
              <div className="flex-grow">
                <Link
                  to={`/profile/${connection._id}`}
                  className="text-gray-900 font-medium hover:text-blue-600"
                >
                  {connection.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {connection.universityId}
                </p>
              </div>

              {userId === user._id && (
                <SendRequest
                  userId={connection._id}
                  onRequestSent={loadConnections}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectionsList; 