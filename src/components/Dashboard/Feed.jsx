import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Post from './Post';
import socket, { onNewPost, onPostUpdate } from '../../utils/socket';

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
      <p className="mt-4 text-gray-500">Loading your feed...</p>
    </div>
  );

  return (
    <div>
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No posts found. Be the first to share!</p>
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