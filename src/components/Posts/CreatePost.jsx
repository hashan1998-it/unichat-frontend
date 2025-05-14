// src/components/Posts/CreatePost.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { 
  Button, 
  Card, 
  FileUpload, 
  TextArea,
  LoadingSpinner 
} from '../common';
import { 
  BookOpenIcon, 
  PaperAirplaneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [postType, setPostType] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const postTypes = [
    { id: 'general', label: 'General', description: 'Regular post' },
    { id: 'academic', label: 'Academic', description: 'Study-related', icon: BookOpenIcon },
    { id: 'event', label: 'Event', description: 'Campus events', icon: CalendarIcon }
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          {/* Post Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type
            </label>
            <div className="flex space-x-3">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setPostType(type.id)}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                    postType === type.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {type.icon && <type.icon className="h-6 w-6 mx-auto mb-1" />}
                  <span className="text-lg font-semibold">{type.label}</span>
                  <p className="text-xs mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <TextArea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share your thoughts with the university community..."
            rows={6}
            required
            maxLength={1000}
            showCount
            className="mb-6"
          />

          {/* Image Upload */}
          <FileUpload
            label="Add Image (optional)"
            accept="image/*"
            onFileSelect={setImage}
            className="mb-6"
          />

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" showMessage={false} className="inline mr-2" />
                  Posting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePost;