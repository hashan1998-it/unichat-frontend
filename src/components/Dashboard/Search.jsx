import { useState } from 'react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });

  const handleSearch = async () => {
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
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Search</h2>
      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users or posts"
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
        />
        <button 
          onClick={handleSearch}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Search
        </button>
      </div>
      
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-2">Users:</h3>
        {results.users.map((user) => (
          <div key={user._id} className="mb-2">
            <Link 
              to={`/profile/${user._id}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              {user.username}
            </Link>
          </div>
        ))}
        
        <h3 className="text-base font-medium text-gray-900 mb-2 mt-4">Posts:</h3>
        {results.posts.map((post) => (
          <div key={post._id} className="mb-2">
            <strong className="text-gray-900">{post.user.username}</strong>: {post.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;