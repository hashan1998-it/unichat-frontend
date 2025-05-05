// src/components/Dashboard/Feed.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Post from './Post';
import socket, { onNewPost, onPostUpdate } from '../../utils/socket';
import { SparklesIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadFeed = async () => {
    try {
      const response = await api.get('/posts/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
    
    // Listen for new posts
    onNewPost((newPost) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    });
    
    // Listen for post updates (likes)
    onPostUpdate((updatedPost) => {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    });
    
    return () => {
      socket.off('newPost');
      socket.off('postUpdated');
    };
  }, []);

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
      <p className="mt-4 text-gray-500">Loading your university feed...</p>
    </div>
  );

  const filteredPosts = posts.filter(post => 
    filter === 'all' || post.postType === filter
  );

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-indigo-500" />
            University Feed
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('academic')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'academic' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AcademicCapIcon className="h-4 w-4 inline mr-1" />
              Academic
            </button>
            <button
              onClick={() => setFilter('event')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'event' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Events
            </button>
          </div>
        </div>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No posts found. Be the first to share!</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <Post 
            key={post._id} 
            post={post} 
            onUpdate={loadFeed}
          />
        ))
      )}
    </div>
  );
};

export default Feed;