import { io } from 'socket.io-client';
import config from '../config';

const socket = io(config.SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {
    token: localStorage.getItem('token')
  },
  withCredentials: true
});

// Connection events for debugging (only in development)
if (config.isDevelopment) {
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });
}

// Update auth token when it changes
export const updateAuthToken = () => {
  const token = localStorage.getItem('token');
  socket.auth = { token };
  if (config.isDevelopment) {
    console.log('Socket auth updated');
  }
};

export const joinRoom = (userId) => {
  if (config.isDevelopment) {
    console.log('Joining room for user:', userId);
  }
  socket.emit('join', userId);
};

export const onNotification = (callback) => {
  socket.on('newNotification', callback);
};

// Real-time post events
export const onNewPost = (callback) => {
  socket.on('new-post', callback);
  // Also try alternative event names the backend might use
  socket.on('newPost', callback);
  if (config.isDevelopment) {
    console.log('Listening for new posts');
  }
};

export const onPostUpdate = (callback) => {
  socket.on('post-updated', callback);
  // Also try alternative event names
  socket.on('postUpdated', callback);
  if (config.isDevelopment) {
    console.log('Listening for post updates');
  }
};

export const onNewComment = (callback) => {
  socket.on('new-comment', callback);
  // Also try alternative event names
  socket.on('newComment', callback);
  if (config.isDevelopment) {
    console.log('Listening for new comments');
  }
};

// Clean up listeners
export const removePostListeners = () => {
  socket.off('new-post');
  socket.off('post-updated');
  socket.off('new-comment');
  socket.off('newPost');
  socket.off('postUpdated');
  socket.off('newComment');
  if (config.isDevelopment) {
    console.log('Removed post listeners');
  }
};

// Check if socket is connected
export const isConnected = () => socket.connected;

export default socket;