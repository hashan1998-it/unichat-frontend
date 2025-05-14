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
  socket.on('connect', () => {});

  socket.on('disconnect', (reason) => {});

  socket.on('connect_error', (error) => {});
}

// Update auth token when it changes
export const updateAuthToken = () => {
  const token = localStorage.getItem('token');
  socket.auth = { token };
};

export const joinRoom = (userId) => {
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
};

export const onPostUpdate = (callback) => {
  socket.on('post-updated', callback);
  // Also try alternative event names
  socket.on('postUpdated', callback);
};

export const onNewComment = (callback) => {
  socket.on('new-comment', callback);
  // Also try alternative event names
  socket.on('newComment', callback);
};

// Clean up listeners
export const removePostListeners = () => {
  socket.off('new-post');
  socket.off('post-updated');
  socket.off('new-comment');
  socket.off('newPost');
  socket.off('postUpdated');
  socket.off('newComment');
};

// Check if socket is connected
export const isConnected = () => socket.connected;

export default socket;