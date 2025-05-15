// src/components/Explore/Explore.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Notification from '../common/Notification';
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
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const { user: currentUser } = useAuth();
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

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
      setLoading(true);
      const response = await api.get('/search/users?query=');
      const allUsers = response.data || [];
      const filteredUsers = allUsers.filter(user => user._id !== currentUser._id);
      
      // Get current user's connections
      let currentUserConnections = [];
      try {
        const profileResponse = await api.get(`/users/profile/${currentUser._id}`);
        currentUserConnections = profileResponse.data.connections || [];
      } catch (error) {
        console.log('Could not fetch user profile:', error);
      }

      // Get pending requests
      let pendingRequests = [];
      try {
        const pendingResponse = await api.get('/connections/pending');
        pendingRequests = pendingResponse.data || [];
      } catch (error) {
        console.log('Could not fetch pending requests:', error);
      }

      // Add connection status to users
      const usersWithStatus = filteredUsers.map(user => {
        // Check if already connected (check both user's connections arrays)
        const isConnected = currentUserConnections.includes(user._id) || 
                          user.connections?.includes(currentUser._id);
        
        // Check for pending requests (both sent and received)
        const pendingRequest = pendingRequests.find(
          request => 
            (request.sender._id === currentUser._id && request.receiver._id === user._id) ||
            (request.sender._id === user._id && request.receiver._id === currentUser._id)
        );
        
        let connectionStatus = 'none';
        if (isConnected) {
          connectionStatus = 'connected';
        } else if (pendingRequest) {
          // Determine if current user sent or received the request
          connectionStatus = pendingRequest.sender._id === currentUser._id ? 'pending' : 'received';
        }
        
        return {
          ...user,
          connectionStatus,
          pendingRequestId: pendingRequest?._id
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

  const acceptRequest = async (userId) => {
    try {
      // Get the existing request
      const pendingResponse = await api.get('/connections/pending');
      const existingRequest = pendingResponse.data.find(
        request => request.sender._id === userId && request.receiver._id === currentUser._id
      );

      if (existingRequest) {
        // Accept the request
        await api.post(`/connections/accept/${existingRequest._id}`);
        showNotification('Connection request accepted');
        
        // Update the UI
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              return { ...user, connectionStatus: 'connected' };
            }
            return user;
          })
        );
        setFilteredUsers(prevUsers => 
          prevUsers.map(user => {
            if (user._id === userId) {
              return { ...user, connectionStatus: 'connected' };
            }
            return user;
          })
        );
      }
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to accept request', 'error');
    }
  };

  const handleConnectionRequest = async (userId) => {
    try {
      const targetUser = users.find(u => u._id === userId);
      
      if (targetUser?.connectionStatus === 'pending' || targetUser?.connectionStatus === 'received') {
        // Get the existing request
        const pendingResponse = await api.get('/connections/pending');
        const existingRequest = pendingResponse.data.find(
          request => 
            (request.sender._id === currentUser._id && request.receiver._id === userId) ||
            (request.sender._id === userId && request.receiver._id === currentUser._id)
        );

        if (existingRequest) {
          // Cancel the request
          await api.delete(`/connections/cancel/${existingRequest._id}`);
          showNotification('Connection request cancelled');
          
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
        }
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
      showNotification(error.response?.data?.message || 'Failed to process request', 'error');
    }
  };

  const getConnectionButton = (user) => {
    // Check if already connected
    if (user.connections?.includes(currentUser._id)) {
      return (
        <Button className="w-full" variant="success" disabled>
          <CheckBadgeIcon className="h-5 w-5 mr-1" />
          Connected
        </Button>
      );
    }

    // Check if there's a pending request
    if (user.connectionStatus === 'pending') {
      return (
        <Button
          className="w-full"
          variant="secondary"
          onClick={() => handleConnectionRequest(user._id)}
        >
          <UserMinusIcon className="h-5 w-5 mr-1" />
          Cancel Request
        </Button>
      );
    }

    // Default state - send request
    return (
      <Button
        className="w-full"
        onClick={() => handleConnectionRequest(user._id)}
      >
        <UserPlusIcon className="h-5 w-5 mr-1" />
        Connect
      </Button>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading users..." />;
  }

  return (
    <div className="space-y-6">
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: '', type: '' })}
      />

      {/* Redesigned Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          {/* Icon and subtitle */}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <p className="text-white/90 text-lg font-medium">Connect with students and professors</p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Enhanced Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-full text-gray-900 placeholder-gray-600 focus:ring-2 focus:ring-white/50 focus:border-transparent focus:bg-white transition-all"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-600" />
            </div>

            {/* Mobile Filter Toggle */}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </Button>

            {/* Desktop Filter Pills */}
            <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === 'all' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('student')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === 'student' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <BriefcaseIcon className="h-4 w-4 inline mr-1" />
                Students
              </button>
              <button
                onClick={() => setFilter('professor')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === 'professor' 
                    ? 'bg-white text-gray-900 shadow-md' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                Professors
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Pills */}
        {showFilters && (
          <div className="sm:hidden mt-4 flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'student' 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setFilter('professor')}
              className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'professor' 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              Professors
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <UserGroupIcon className="h-10 w-10 text-blue-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Students</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
            <BriefcaseIcon className="h-10 w-10 text-purple-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Professors</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'professor').length}
              </p>
            </div>
            <AcademicCapIcon className="h-10 w-10 text-indigo-200" />
          </div>
        </Card>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={UserGroupIcon}
          title="No users found"
          description="Try adjusting your search or filters"
          className="bg-white rounded-xl"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <Card
              key={user._id}
              hoverable
              className="overflow-hidden group"
              padding="p-0"
            >
              <div className="h-24 bg-gradient-to-r from-blue-400 to-purple-600"></div>
              <div className="px-6 pb-6 relative">
                {/* Profile Picture and Badge */}
                <div className="flex items-end justify-between mb-4 -mt-12">
                  <Avatar
                    src={user.profilePicture}
                    username={user.username}
                    userId={user._id}
                    isLink
                    size="large"
                    showBorder
                    borderColor="white"
                    className="shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <Badge variant={`role.${user.role}`}>
                    {user.role}
                  </Badge>
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;