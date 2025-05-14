// src/components/Explore/Explore.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@utils/api';
import { useAuth } from '@context/AuthContext';
import { 
  UserPlusIcon, 
  UserMinusIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';

const Explore = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, students, professors
  const { user: currentUser } = useAuth();

  // Add notification state and function
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

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

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filter]);

  const loadUsers = async () => {
    try {
      const response = await api.get('/search/users?query=');
      const filteredUsers = response.data.filter(user => user._id !== currentUser._id);
      
      // Get pending requests to set connection status
      const pendingResponse = await api.get('/connections/pending');
      const pendingRequests = pendingResponse.data;
      
      // Add connection status to users
      const usersWithStatus = filteredUsers.map(user => {
        const pendingRequest = pendingRequests.find(
          request => request.sender._id === currentUser._id && request.receiver._id === user._id
        );
        return {
          ...user,
          connectionStatus: pendingRequest ? 'pending' : 'none'
        };
      });
      
      setUsers(usersWithStatus);
      setFilteredUsers(usersWithStatus);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => {
        if (!user) return false;
        const username = user.username || '';
        const email = user.email || '';
        const bio = user.bio || '';
        
        return username.toLowerCase().includes(searchQuery.toLowerCase()) ||
               email.toLowerCase().includes(searchQuery.toLowerCase()) ||
               bio.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Apply role filter
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.role === filter);
    }

    setFilteredUsers(filtered);
  };

  const handleConnectionRequest = async (userId) => {
    try {
      console.log('Sending connection request to:', userId);
      console.log('Current user:', currentUser);

      // First check if we're already connected
      const userResponse = await api.get(`/users/${userId}`);
      const user = userResponse.data;
      
      console.log('Target user data:', user);
      
      if (user.connections?.includes(currentUser._id)) {
        console.log('Already connected');
        return; // Already connected
      }

      // Check for existing pending request
      const pendingResponse = await api.get('/connections/pending');
      console.log('Pending requests:', pendingResponse.data);
      
      const existingRequest = pendingResponse.data.find(
        request => request.sender._id === currentUser._id && request.receiver._id === userId
      );

      if (existingRequest) {
        console.log('Canceling existing request:', existingRequest._id);
        // If request exists, cancel it
        await api.post(`/connections/reject/${existingRequest._id}`);
        showNotification('Connection request canceled');
        
        // Update the UI
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              return { ...user, connectionStatus: 'none' };
            }
            return user;
          })
        );
        setFilteredUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              return { ...user, connectionStatus: 'none' };
            }
            return user;
          })
        );
      } else {
        console.log('Sending new request');
        // Send new request
        const response = await api.post(`/connections/send/${userId}`);
        console.log('Request sent successfully:', response.data);
        showNotification('Connection request sent successfully');
        
        // Update the UI
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              return { ...user, connectionStatus: 'pending' };
            }
            return user;
          })
        );
        setFilteredUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              return { ...user, connectionStatus: 'pending' };
            }
            return user;
          })
        );
      }
    } catch (error) {
      console.error('Failed to handle connection request:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      showNotification(error.response?.data?.message || 'Failed to send connection request', 'error');
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      // Find the pending request
      const response = await api.get('/connections/pending');
      const pendingRequest = response.data.find(
        request => request.sender._id === currentUser._id && request.receiver._id === userId
      );

      if (pendingRequest) {
        await api.post(`/connections/reject/${pendingRequest._id}`);
        // Update the user's connection status in the list
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              return { ...user, connectionStatus: 'none' };
            }
            return user;
          })
        );
      }
    } catch (error) {
      console.error('Failed to cancel connection request:', error);
    }
  };

  // Get user role badge
  const getUserBadge = (user) => {
    if (!user) return { icon: BriefcaseIcon, color: 'text-blue-600 bg-blue-100', label: 'Student' };
    
    const email = user.email || '';
    const username = user.username || '';
    const bio = user.bio || '';

    if (email.includes('prof') || username.includes('prof') || bio.includes('Professor')) {
      return { icon: AcademicCapIcon, color: 'text-purple-600 bg-purple-100', label: 'Professor' };
    }
    return { icon: BriefcaseIcon, color: 'text-blue-600 bg-blue-100', label: 'Student' };
  };

  // Get connection button based on status
  const getConnectionButton = (user) => {
    // Check if already connected
    if (user.connections?.includes(currentUser._id)) {
      return (
        <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-100 text-green-600">
          <CheckBadgeIcon className="h-4 w-4" />
          <span className="text-xs font-medium">Connected</span>
        </div>
      );
    }

    // Check if there's a pending request
    if (user.connectionStatus === 'pending') {
      return (
        <button
          onClick={() => handleConnectionRequest(user._id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <UserMinusIcon className="h-4 w-4" />
          <span>Cancel Request</span>
        </button>
      );
    }

    // Default state - send request
    return (
      <button
        onClick={() => handleConnectionRequest(user._id)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all bg-blue-50 text-blue-600 hover:bg-blue-100"
      >
        <UserPlusIcon className="h-4 w-4" />
        <span>Connect</span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'student'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setFilter('professor')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'professor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Professors
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const badge = getUserBadge(user);
          return (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 group"
            >
              <div className="px-6 pb-6 relative">
                {/* Profile Picture and Badge */}
                <div className="flex items-end justify-between mb-4 -mt-12">
                  <Link to={`/profile/${user._id}`}>
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.username}'s profile`}
                        className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-300 border-4 border-white shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-gray-700 font-bold text-2xl">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${badge.color}`}>
                    <badge.icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{badge.label}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-4">
                  <Link to={`/profile/${user._id}`} className="block mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </Link>
                  
                  {/* Connection Button */}
                  {getConnectionButton(user)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}
    </div>
  );
};

export default Explore;