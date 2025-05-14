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
  CheckBadgeIcon,
  FunnelIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Explore = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, students, professors
  const [showFilters, setShowFilters] = useState(false);
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
      // Check for existing pending request
      const pendingResponse = await api.get('/connections/pending');
      const existingRequest = pendingResponse.data.find(
        request => request.sender._id === currentUser._id && request.receiver._id === userId
      );

      if (existingRequest) {
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
      } else {
        // Send new request
        await api.post(`/connections/send/${userId}`);
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
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to send connection request', 'error');
    }
  };

  // Get user role badge
  const getUserBadge = (user) => {
    if (!user) return { icon: BriefcaseIcon, color: 'bg-blue-100 text-blue-600', label: 'Student' };
    
    if (user.role === 'professor') {
      return { icon: AcademicCapIcon, color: 'bg-purple-100 text-purple-600', label: 'Professor' };
    }
    return { icon: BriefcaseIcon, color: 'bg-blue-100 text-blue-600', label: 'Student' };
  };

  // Get connection button based on status
  const getConnectionButton = (user) => {
    // Check if already connected
    if (user.connections?.includes(currentUser._id)) {
      return (
        <button className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium">
          <CheckBadgeIcon className="h-5 w-5" />
          <span>Connected</span>
        </button>
      );
    }

    // Check if there's a pending request
    if (user.connectionStatus === 'pending') {
      return (
        <button
          onClick={() => handleConnectionRequest(user._id)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <UserMinusIcon className="h-5 w-5" />
          <span>Cancel Request</span>
        </button>
      );
    }

    // Default state - send request
    return (
      <button
        onClick={() => handleConnectionRequest(user._id)}
        className="flex items-center space-x-1.5 px-4 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105"
      >
        <UserPlusIcon className="h-5 w-5" />
        <span>Connect</span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transform transition-all ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-500 mr-3" />
              Explore
            </h1>
            <p className="text-gray-600 mt-1">Connect with students and professors</p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center px-4 py-3 bg-gray-100 rounded-xl text-gray-700"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>

            {/* Desktop Filter Buttons */}
            <div className="hidden sm:flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-5 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('student')}
                className={`px-5 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  filter === 'student'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setFilter('professor')}
                className={`px-5 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                  filter === 'professor'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Professors
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Buttons */}
        {showFilters && (
          <div className="sm:hidden mt-4 flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'student'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setFilter('professor')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'professor'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Professors
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <UserGroupIcon className="h-10 w-10 text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Students</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
            <BriefcaseIcon className="h-10 w-10 text-purple-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Professors</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'professor').length}
              </p>
            </div>
            <AcademicCapIcon className="h-10 w-10 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => {
          const badge = getUserBadge(user);
          return (
            <div
              key={user._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="h-24 bg-gradient-to-r from-blue-400 to-purple-600"></div>
              <div className="px-6 pb-6 relative">
                {/* Profile Picture and Badge */}
                <div className="flex items-end justify-between mb-4 -mt-12">
                  <Link to={`/profile/${user._id}`}>
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={`${user.username}'s profile`}
                        className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 border-4 border-white shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-3xl">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${badge.color}`}>
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
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    {user.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.bio}</p>
                    )}
                  </Link>
                  
                  {/* Stats */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                    <span>{user.connections?.length || 0} connections</span>
                    <span>{user.posts?.length || 0} posts</span>
                  </div>
                  
                  {/* Connection Button */}
                  {getConnectionButton(user)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-medium">No users found</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default Explore;