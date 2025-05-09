import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Post from '../Dashboard/Post';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState('');

  const userId = id || currentUser?._id;
  const isOwnProfile = userId === currentUser?._id;

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const [userResponse, postsResponse] = await Promise.all([
        api.get(`/users/profile/${userId}`),
        api.get(`/posts/user/${userId}`),
      ]);
      
      setUser(userResponse.data);
      setPosts(postsResponse.data);
      setBio(userResponse.data.bio || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleFollow = async () => {
    const isFollowing = user.followers.some(
      (follower) => follower._id === currentUser._id
    );
    
    try {
      await api.post(`/users/${isFollowing ? 'unfollow' : 'follow'}/${userId}`);
      loadProfile();
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.put('/users/profile', { bio });
      setEditMode(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (!user) return <div className="text-center py-4">Loading...</div>;

  const isFollowing = user.followers.some(
    (follower) => follower._id === currentUser?._id
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Profile</h1>
        
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
          
          {editMode ? (
            <div className="mt-2">
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                rows="3"
              />
              <div className="mt-2">
                <button 
                  onClick={handleSaveProfile}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save
                </button>
                <button 
                  onClick={() => setEditMode(false)}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mt-2">{user.bio || 'No bio'}</p>
          )}
          
          <div className="mt-4">
            {!isOwnProfile && (
              <button 
                onClick={handleFollow}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isFollowing 
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {isOwnProfile && (
              <button 
                onClick={() => setEditMode(true)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold">{user.posts.length}</div>
            <div className="text-gray-600">Posts</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{user.followers.length}</div>
            <div className="text-gray-600">Followers</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{user.following.length}</div>
            <div className="text-gray-600">Following</div>
          </div>
        </div>
      </div>

      <div>
        {posts.map((post) => (
          <Post 
            key={post._id} 
            post={post} 
            onUpdate={loadProfile}
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;