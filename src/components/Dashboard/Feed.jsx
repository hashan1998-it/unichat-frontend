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

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Feed</h2>
      {posts.map((post) => (
        <Post 
          key={post._id} 
          post={post} 
          onUpdate={loadFeed}
        />
      ))}
    </div>
  );
};

export default Feed;