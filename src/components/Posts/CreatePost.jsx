// src/components/Posts/CreatePost.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  PhotoIcon, 
  BookOpenIcon, 
  PaperAirplaneIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [postType, setPostType] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('postType', postType);
    if (image) {
      formData.append('image', image);
    }

    try {
      await api.post('/posts', formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

      <div className="bg-white shadow-lg rounded-lg">
        <form onSubmit={handleSubmit} className="p-6">
          {/* Post Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setPostType('general')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                  postType === 'general' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg font-semibold">General</span>
                <p className="text-xs mt-1">Regular post</p>
              </button>
              <button
                type="button"
                onClick={() => setPostType('academic')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                  postType === 'academic' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <BookOpenIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-lg font-semibold">Academic</span>
                <p className="text-xs mt-1">Study-related</p>
              </button>
              <button
                type="button"
                onClick={() => setPostType('event')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                  postType === 'event' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <CalendarIcon className="h-6 w-6 mx-auto mb-1" />
                <span className="text-lg font-semibold">Event</span>
                <p className="text-xs mt-1">Campus events</p>
              </button>
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share your thoughts with the university community..."
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Image (optional)
            </label>
            {!image ? (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                  <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">Click to upload an image</p>
                </div>
              </label>
            ) : (
              <div className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors duration-200"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className={`inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white ${
                isSubmitting || !content.trim()
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;