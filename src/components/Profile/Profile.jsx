// src/components/Profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Post from '../Dashboard/Post';
import ConnectionRequests from '../Connections/ConnectionRequests';
import ConnectionsList from '../Connections/ConnectionsList';
import Button from '../common/Button';
import Card from '../common/Card';
import Avatar from '../common/Avatar';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';

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

  if (!user) return <LoadingSpinner message="Loading profile..." />;

  const isFollowing = user.followers.some(
    (follower) => follower._id === currentUser?._id
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      
      <Card>
        <div className="flex items-center space-x-6 mb-4">
          <div className="flex-shrink-0">
            <Avatar
              src={user.profilePicture}
              username={user.username}
              size="large"
              showBorder
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-semibold text-gray-800">{user.username}</h2>
              {user.role && (
                <Badge variant={`role.${user.role}`} icon={user.role === 'professor' ? null : null}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              )}
            </div>
            
            {editMode ? (
              <div className="mt-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Bio"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  rows="3"
                />
                <div className="mt-2 space-x-3">
                  <Button onClick={handleSaveProfile}>Save</Button>
                  <Button onClick={() => setEditMode(false)} variant="secondary">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 mt-2">{user.bio || 'No bio'}</p>
            )}
            
            <div className="mt-4">
              {!isOwnProfile && (
                <Button
                  variant={isFollowing ? 'danger' : 'primary'}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}
              {isOwnProfile && (
                <Button onClick={() => setEditMode(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
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
      </Card>

      {/* Connection Requests Section - Only show on own profile */}
      {isOwnProfile && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Connection Requests</h2>
          <ConnectionRequests />
        </Card>
      )}

      {/* Connections List */}
      <Card>
        <ConnectionsList userId={userId} />
      </Card>

      {/* Posts Section */}
      <div className="space-y-4">
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