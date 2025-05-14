import { useState, useEffect } from 'react';
import api from '@utils/api';
import Post from './Post';
import socketService from '@utils/socket';
import { Link } from 'react-router-dom';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const newPostCleanup = socketService.onNewPost((newPost) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    });
    
    // Listen for post updates (likes)
    const postUpdateCleanup = socketService.onPostUpdate((updatedPost) => {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    });
    
    return () => {
      newPostCleanup();
      postUpdateCleanup();
    };
  }, []);

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
      <p className="mt-4 text-gray-500">Loading your feed...</p>
    </div>
  );

  return (
    <div>
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">No posts found. Be the first to share!</p>
          <Link
            to="/create-post"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Create Post
          </Link>
        </div>
      ) : (
        posts.map((post) => (
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