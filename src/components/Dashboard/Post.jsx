import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import socket, { onPostUpdate, onNewComment } from '../../utils/socket';

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
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <strong className="text-gray-900 font-medium">{post.user.username}</strong>
        <small className="text-gray-500 ml-4">{new Date(post.createdAt).toLocaleDateString()}</small>
      </div>
      
      <p className="text-gray-700 mb-4">{post.content}</p>
      
      {post.image && (
        <img 
          src={`http://localhost:5000/${post.image}`} 
          alt="Post" 
          className="max-w-full h-auto rounded-lg mb-4"
        />
      )}
      
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={handleLike}
          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
            isLiked
              ? 'text-red-700 bg-red-100 hover:bg-red-200'
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {isLiked ? 'Unlike' : 'Like'} ({post.likes.length})
        </button>
        <button 
          onClick={() => setShowCommentForm(!showCommentForm)}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Comment ({post.comments.length})
        </button>
      </div>

      {/* Show Likes Section */}
      {post.likes.length > 0 && (
        <div className="mb-4">
          <button 
            onClick={() => setShowLikes(!showLikes)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Liked by {post.likes.length} {post.likes.length === 1 ? 'person' : 'people'}
            {showLikes ? ' (hide)' : ' (show)'}
          </button>
          
          {showLikes && (
            <div className="mt-2 text-sm text-gray-600">
              {/* Since we need to get user info for likes, we'll need to update our backend */}
              Users who liked: {post.likes.map((userId, index) => (
                <span key={userId}>
                  {userId}
                  {index < post.likes.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {showCommentForm && (
        <form onSubmit={handleComment} className="mb-4">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md mb-2"
          />
          <button 
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </form>
      )}

      {/* Comments Section */}
      {post.comments.map((comment) => (
        <div key={comment._id} className="bg-gray-50 rounded p-2 mb-2">
          <strong className="text-gray-900">
            {comment.user?.username || 'Anonymous'}
          </strong>
          <span className="text-gray-700">: {comment.content}</span>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Post;