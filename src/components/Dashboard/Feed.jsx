// src/components/Dashboard/Feed.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import Post from './Post';
import socketService from '../../utils/socket';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { PlusCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
    
    // Initialize socket connection
    socketService.connect();
    
    return () => {
      newPostCleanup();
      postUpdateCleanup();
    };
  }, []);

  if (loading) return <LoadingSpinner message="Loading your feed..." />;

  return (
    <div>
      {posts.length === 0 ? (
        <EmptyState
          icon={DocumentTextIcon}
          title="No posts yet"
          description="Be the first to share something with the community!"
          actionButton={
            <Link to="/create-post">
              <Button>
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Create Post
              </Button>
            </Link>
          }
          className="bg-white rounded-lg shadow-sm"
        />
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