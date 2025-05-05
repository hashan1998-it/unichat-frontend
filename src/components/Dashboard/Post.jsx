// src/components/Dashboard/Post.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import socket, { onPostUpdate, onNewComment } from '../../utils/socket';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  BookmarkIcon,
  AcademicCapIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const Post = ({ post: initialPost, onUpdate }) => {
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const { user } = useAuth();

  const isLiked = post.likes.includes(user?._id);

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

  const getPostTypeIcon = () => {
    switch (post.postType) {
      case 'academic':
        return <AcademicCapIcon className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <CalendarIcon className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getPostTypeStyle = () => {
    switch (post.postType) {
      case 'academic':
        return 'border-l-4 border-blue-500';
      case 'event':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

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
    <div className={`bg-white shadow-md rounded-lg mb-6 ${getPostTypeStyle()}`}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {post.user.username.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center">
              <p className="text-sm font-medium text-gray-900">
                {post.user.username}
              </p>
              {getPostTypeIcon() && (
                <span className="ml-2">
                  {getPostTypeIcon()}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <p className="text-gray-800 text-base mb-4 whitespace-pre-wrap">{post.content}</p>
        
        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={`http://localhost:5000/${post.image}`} 
              alt="Post" 
              className="w-full object-cover"
            />
          </div>
        )}
        
        <div className="border-t border-b border-gray-200 py-3 my-4">
          <div className="flex items-center justify-between px-2">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isLiked
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isLiked ? (
                <HeartSolid className="h-5 w-5" />
              ) : (
                <HeartIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{post.likes.length}</span>
            </button>
            <button 
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
            >
              <ChatBubbleLeftIcon className="h-5 w-5" />
              <span className="text-sm font-medium">{post.comments.length}</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
            >
              <ShareIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
            >
              <BookmarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {showCommentForm && (
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-medium text-sm">
                    {user?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </form>
        )}

        {/* Comments Section */}
        {post.comments.map((comment) => (
          <div key={comment._id} className="flex space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {comment.user?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg px-4 py-2">
                <p className="text-sm font-medium text-gray-900">
                  {comment.user?.username || 'Anonymous'}
                </p>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-4">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;