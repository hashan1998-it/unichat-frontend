import { io } from 'socket.io-client';

const socket = io('https://unichat-backend-production.up.railway.app');

export const joinRoom = (userId) => {
  socket.emit('join', userId);
};

export const onNotification = (callback) => {
  socket.on('newNotification', callback);
};

// Add these new events
export const onNewPost = (callback) => {
  socket.on('newPost', callback);
};

export const onPostUpdate = (callback) => {
  socket.on('postUpdated', callback);
};

export const onNewComment = (callback) => {
  socket.on('newComment', callback);
};

export default socket;