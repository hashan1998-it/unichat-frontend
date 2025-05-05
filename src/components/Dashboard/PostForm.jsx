// src/components/Dashboard/PostForm.jsx
import { useState } from 'react';
import api from '../../utils/api';
import { 
  PhotoIcon, 
  BookOpenIcon, 
  PaperAirplaneIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const PostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [postType, setPostType] = useState('general');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }
    formData.append('postType', postType);

    try {
      await api.post('/posts', formData);
      setContent('');
      setImage(null);
      setPostType('general');
      onPostCreated();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-medium text-lg">A</span>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-medium text-gray-900">Share with your university community</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex space-x-2 mb-3">
            <button
              type="button"
              onClick={() => setPostType('general')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                postType === 'general' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              General
            </button>
            <button
              type="button"
              onClick={() => setPostType('academic')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                postType === 'academic' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BookOpenIcon className="h-4 w-4 inline mr-1" />
              Academic
            </button>
            <button
              type="button"
              onClick={() => setPostType('event')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                postType === 'event' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Event
            </button>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in your university?"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows="4"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="hidden"
              />
              <div className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                <PhotoIcon className="h-5 w-5" />
                <span className="text-sm">Photo</span>
              </div>
            </label>
            {image && (
              <span className="text-sm text-gray-600">Selected: {image.name}</span>
            )}
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;