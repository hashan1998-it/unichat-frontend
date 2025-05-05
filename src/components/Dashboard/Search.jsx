// src/components/Dashboard/Search.jsx
import { useState } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        api.get(`/search/users?query=${query}`),
        api.get(`/search/posts?query=${query}`),
      ]);
      
      setResults({
        users: usersResponse.data,
        posts: postsResponse.data,
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Search University Community</h2>
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search for students, professors, or posts..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 rounded-md text-sm font-medium ${
            isSearching 
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
              : 'text-white bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {(results.users.length > 0 || results.posts.length > 0) && (
        <div className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {results.users.length > 0 && (
              <div>
                <h3 className="flex items-center text-base font-medium text-gray-900 mb-3">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  People ({results.users.length})
                </h3>
                <div className="space-y-2">
                  {results.users.map((user) => (
                    <Link 
                      key={user._id}
                      to={`/profile/${user._id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {results.posts.length > 0 && (
              <div>
                <h3 className="flex items-center text-base font-medium text-gray-900 mb-3">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Posts ({results.posts.length})
                </h3>
                <div className="space-y-2">
                  {results.posts.map((post) => (
                    <div 
                      key={post._id}
                      className="p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {post.user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{post.user.username}</p>
                          <p className="text-sm text-gray-600 truncate">{post.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {query && results.users.length === 0 && results.posts.length === 0 && !isSearching && (
        <div className="mt-6 text-center py-4">
          <p className="text-gray-500">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default Search;