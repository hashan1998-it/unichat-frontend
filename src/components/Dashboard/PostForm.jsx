import { useState } from 'react';
import api from '../../utils/api';

const PostForm = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('content', content);
    if (image) {
      formData.append('image', image);
    }

    try {
      await api.post('/posts', formData);
      setContent('');
      setImage(null);
      onPostCreated();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Create Post</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          required
          className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md mb-4"
          rows="4"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="mb-4"
        />
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default PostForm;