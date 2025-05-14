// src/components/Dashboard/Post.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import socketService from '../../utils/socket';
import { formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import Card from '../common/Card';
import Dropdown from '../common/Dropdown';
import Badge from '../common/Badge';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const Post = ({ post: initialPost, onUpdate }) => {
  const [post, setPost] = useState(initialPost);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { user } = useAuth();

  const isLiked = post.likes.includes(user?._id);

  // Format time for display
  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  useEffect(() => {
    // Socket listeners setup...
    const postUpdateCleanup = socketService.onPostUpdate((updatedPost) => {
      if (updatedPost._id === post._id) {
        setPost(updatedPost);
      }
    });
    
    const commentCleanup = socketService.onNewComment(({ postId, comment }) => {
      if (postId === post._id) {
        setPost(prevPost => ({
          ...prevPost,
          comments: [...prevPost.comments, comment]
        }));
      }
    });
    
    return () => {
      postUpdateCleanup();
      commentCleanup();
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
    if (!commentText.trim()) return;
    
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

  const menuTrigger = (
    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
      <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
    </button>
  );

  return (
    <Card hoverable className="mb-4 overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={post.user.profilePicture}
              username={post.user.username}
              userId={post.user._id}
              isLink
              size="medium"
            />
            <div>
              <Link to={`/profile/${post.user._id}`}>
                <p className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {post.user.username}
                </p>
              </Link>
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <span>{formatTime(post.createdAt)}</span>
                {post.postType !== 'general' && (
                  <>
                    <span>•</span>
                    <Badge 
                      variant={post.postType === 'academic' ? 'primary' : 'success'}
                      size="small"
                    >
                      {post.postType}
                    </Badge>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <Dropdown trigger={menuTrigger} position="bottom-right">
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Save post
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Copy link
            </button>
            {user?._id === post.user._id && (
              <>
                <hr className="border-gray-100" />
                <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  Delete post
                </button>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 text-base whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative w-full bg-gray-100">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          <img 
            src={`http://localhost:5000/${post.image}`} 
            alt="Post" 
            className={`w-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
          />
        </div>
      )}

      {/* Interaction Stats */}
      {(post.likes.length > 0 || post.comments.length > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {post.likes.length > 0 && (
              <button className="hover:text-gray-700 transition-colors">
                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
              </button>
            )}
          </div>
          {post.comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:text-gray-700 transition-colors"
            >
              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-100 px-4 py-1">
        <div className="flex items-center justify-around">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            {isLiked ? (
              <HeartSolid className="h-6 w-6" />
            ) : (
              <HeartIcon className="h-6 w-6" />
            )}
            <span className="text-sm font-medium">Like</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Comment</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all">
            <ShareIcon className="h-6 w-6" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <form onSubmit={handleComment} className="mb-4">
            <div className="flex items-start space-x-3">
              <Avatar
                src={user?.profilePicture}
                username={user?.username}
                size="small"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </form>
          
          {/* Display comments */}
          <div className="space-y-3">
            {post.comments
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <Avatar
                  src={comment.user?.profilePicture}
                  username={comment.user?.username || 'Anonymous'}
                  userId={comment.user?._id}
                  isLink
                  size="small"
                />
                <div className="flex-1">
                  <div className="bg-white p-3 rounded-lg">
                    <Link to={`/profile/${comment.user?._id}`}>
                      <p className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {comment.user?.username || 'Anonymous'}
                      </p>
                    </Link>
                    <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-3">
                    {formatTime(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default Post;