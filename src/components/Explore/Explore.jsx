// src/components/Explore/Explore.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
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
      setUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
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
      filtered = filtered.filter(user => {
        if (!user) return false;
        const email = user.email || '';
        const username = user.username || '';
        const bio = user.bio || '';

        if (filter === 'professors') {
          return email.includes('prof') || 
                 username.includes('prof') || 
                 bio.includes('Professor');
        } else if (filter === 'students') {
          return !email.includes('prof') && 
                 !username.includes('prof') && 
                 !bio.includes('Professor');
        }
        return true;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      const response = await api.post(`/users/${isFollowing ? 'unfollow' : 'follow'}/${userId}`);
      
      // Update the users state with the new data
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user._id === userId) {
            const currentFollowers = Array.isArray(user.followers) ? user.followers : [];
            return {
              ...user,
              followers: isFollowing 
                ? currentFollowers.filter(f => f._id !== currentUser._id)
                : [...currentFollowers, currentUser]
            };
          }
          return user;
        })
      );

      // Update filtered users as well
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => {
          if (user._id === userId) {
            const currentFollowers = Array.isArray(user.followers) ? user.followers : [];
            return {
              ...user,
              followers: isFollowing 
                ? currentFollowers.filter(f => f._id !== currentUser._id)
                : [...currentFollowers, currentUser]
            };
          }
          return user;
        })
      );
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
      // You might want to show an error message to the user here
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

  if (loading) return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Community</h1>
        <p className="text-gray-600">Connect with students and professors in your university</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilter('students')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'students'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setFilter('professors')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'professors'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Professors
          </button>
        </div>
      </div>

      {/* User Results Count */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} {filter !== 'all' ? filter : 'users'}
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const followers = Array.isArray(user.followers) ? user.followers : [];
          const isFollowing = followers.some(
            (follower) => follower._id === currentUser._id
          );
          const badge = getUserBadge(user);
          
          return (
            <div 
              key={user._id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group overflow-hidden"
            >
              {/* Cover Pattern */}
              <div className="h-24 bg-gradient-to-r from-blue-400 to-purple-600 relative">
                <div className="absolute inset-0 bg-black opacity-10"></div>
              </div>

              <div className="px-6 pb-6 relative">
                {/* Profile Picture and Badge */}
                <div className="flex items-end justify-between mb-4 -mt-12">
                  <Link to={`/profile/${user._id}`}>
                    <div className="h-20 w-20 rounded-full bg-gray-300 border-4 border-white shadow-md flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="text-gray-700 font-bold text-2xl">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
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

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex justify-around text-center mb-4 py-3 border-y border-gray-100">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Array.isArray(user.posts) ? user.posts.length : 0}
                      </p>
                      <p className="text-xs text-gray-500">Posts</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {followers.length}
                      </p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {Array.isArray(user.following) ? user.following.length : 0}
                      </p>
                      <p className="text-xs text-gray-500">Following</p>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <button
                    onClick={() => handleFollow(user._id, isFollowing)}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <CheckBadgeIcon className="h-5 w-5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No users match your search for "${searchQuery}"`
              : 'No users to display. Make sure your backend server is running and users are registered.'
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;