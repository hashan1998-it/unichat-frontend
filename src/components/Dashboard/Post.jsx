// src/components/Dashboard/Post.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import socket, { onPostUpdate, onNewComment } from '../../utils/socket';
import { formatDistanceToNow } from 'date-fns';

const Post = ({ post: initialPost, onUpdate }) => {
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const { user } = useAuth();

  const isLiked = post.likes.includes(user?._id);

  // Format time for comments (shorter format)
  const formatCommentTime = (date) => {
    const distance = formatDistanceToNow(new Date(date), { addSuffix: true });
    // Convert "about 2 hours ago" to "2h ago", "5 minutes ago" to "5m ago", etc.
    return distance
      .replace('about ', '')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' months', 'mo')
      .replace(' month', 'mo')
      .replace(' years', 'y')
      .replace(' year', 'y');
  };

  useEffect(() => {
    // Listen for updates to this specific post
    onPostUpdate((updatedPost) => {
      if (updatedPost._id === post._id) {
        setPost(updatedPost);
      }
    });
    
    // Listen for new comments
    onNewComment(({ postId, comment }) => {
      if (postId === post._id) {
        setPost(prevPost => ({
          ...prevPost,
          comments: [...prevPost.comments, comment]
        }));
      }
    });
    
    return () => {
      socket.off('postUpdated');
      socket.off('newComment');
    };
  }, [post._id]);

  const handleLike = async () => {
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      setPost(response.data);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/posts/${post._id}/comment`, {
        content: commentText,
      });
      setPost(response.data);
      setCommentText('');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {post.user.profilePicture ? (
              <img
                src={post.user.profilePicture}
                alt={`${post.user.username}'s profile`}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-700 font-medium">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900">{post.user.username}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 text-base">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative w-full aspect-square">
          <img 
            src={`http://localhost:5000/${post.image}`} 
            alt="Post" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Interaction Section */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            {post.likes.length > 0 && (
              <span>{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>
            )}
          </div>
          <div className="text-sm text-gray-700">
            {post.comments.length > 0 && (
              <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors`}
          >
            <svg 
              className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
              fill={isLiked ? 'currentColor' : 'none'} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">Like</span>
          </button>
          
          <button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showCommentForm && (
        <div className="px-4 py-2 border-t border-gray-200">
          <form onSubmit={handleComment} className="space-y-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-400 focus:border-transparent"
            />
          </form>
          
          {/* Display comments */}
          <div className="mt-3 space-y-3">
            {post.comments
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-700 text-xs font-medium">
                      {comment.user?.username?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {comment.user?.username || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCommentTime(comment.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;