// src/components/Layout/Header.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UserCircleIcon, 
  AcademicCapIcon,
  BellIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon 
} from '@heroicons/react/24/outline';
import api from '../../utils/api';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        api.get(`/search/users?query=${searchQuery}`),
        api.get(`/search/posts?query=${searchQuery}`),
      ]);
      
      setSearchResults({
        users: usersResponse.data,
        posts: postsResponse.data,
      });
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const closeSearch = () => {
    setShowSearchResults(false);
    setSearchQuery('');
  };

  if (!isAuthenticated) return null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">UniConnect</h1>
            </div>
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-indigo-600 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200"
              >
                <HomeIcon className="h-5 w-5 mr-1" />
                Home
              </Link>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-indigo-600 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200"
              >
                <UserCircleIcon className="h-5 w-5 mr-1" />
                Profile
              </Link>
              <Link
                to="/create-post"
                className="text-gray-600 hover:text-indigo-600 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Create Post
              </Link>
            </nav>
          </div>

          {/* Search bar in center */}
          <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
            <div className="max-w-lg w-full relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search university..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
                  />
                </div>
              </form>
              
              {/* Search results dropdown */}
              {showSearchResults && (
                <div className="absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                  <div className="p-3 border-b border-gray-200">
                    <button 
                      onClick={closeSearch}
                      className="text-xs text-gray-500 float-right"
                    >
                      Close
                    </button>
                    <h3 className="text-sm font-medium text-gray-900">Search Results</h3>
                  </div>
                  
                  {searchResults.users.length > 0 && (
                    <div className="py-2">
                      <h4 className="px-3 text-xs font-medium text-gray-500 uppercase">People</h4>
                      {searchResults.users.slice(0, 3).map((user) => (
                        <Link
                          key={user._id}
                          to={`/profile/${user._id}`}
                          onClick={closeSearch}
                          className="flex items-center px-3 py-2 hover:bg-gray-50"
                        >
                          <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <span className="text-indigo-600 text-xs">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-700">{user.username}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.posts.length > 0 && (
                    <div className="py-2 border-t border-gray-200">
                      <h4 className="px-3 text-xs font-medium text-gray-500 uppercase">Posts</h4>
                      {searchResults.posts.slice(0, 3).map((post) => (
                        <div
                          key={post._id}
                          className="px-3 py-2 hover:bg-gray-50"
                        >
                          <p className="text-sm text-gray-700 truncate">{post.content}</p>
                          <p className="text-xs text-gray-500">{post.user.username}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;