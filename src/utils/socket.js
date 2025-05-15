import { io } from 'socket.io-client';
import { getToken } from '@utils/auth';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.notificationCallbacks = new Set();
    this.commentCallbacks = new Set();
    this.postUpdateCallbacks = new Set();
    this.newPostCallbacks = new Set();
  }

  connect() {
    if (this.socket?.connected) return;

    const token = getToken();
    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Listen for notifications
    this.socket.on('newNotification', (notification) => {
      console.log('New notification received:', notification);
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    // Fallback event names
    this.socket.on('new-notification', (notification) => {
      console.log('New notification received (alternative event):', notification);
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    this.socket.on('notification', (notification) => {
      console.log('New notification received (fallback event):', notification);
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    // Listen for new comments
    this.socket.on('newComment', (comment) => {
      console.log('New comment received:', comment);
      this.commentCallbacks.forEach(callback => callback(comment));
    });

    this.socket.on('new-comment', (comment) => {
      console.log('New comment received (alternative event):', comment);
      this.commentCallbacks.forEach(callback => callback(comment));
    });

    // Listen for post updates
    this.socket.on('postUpdated', (post) => {
      console.log('Post update received:', post);
      this.postUpdateCallbacks.forEach(callback => callback(post));
    });

    this.socket.on('post-updated', (post) => {
      console.log('Post update received (alternative event):', post);
      this.postUpdateCallbacks.forEach(callback => callback(post));
    });

    // Listen for new posts
    this.socket.on('newPost', (post) => {
      console.log('New post received:', post);
      this.newPostCallbacks.forEach(callback => callback(post));
    });

    this.socket.on('new-post', (post) => {
      console.log('New post received (alternative event):', post);
      this.newPostCallbacks.forEach(callback => callback(post));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onNotification(callback) {
    this.notificationCallbacks.add(callback);
    
    // If socket isn't connected yet, connect it
    if (!this.socket?.connected) {
      this.connect();
    }

    // Return cleanup function
    return () => {
      this.notificationCallbacks.delete(callback);
    };
  }

  onNewComment(callback) {
    this.commentCallbacks.add(callback);
    
    // If socket isn't connected yet, connect it
    if (!this.socket?.connected) {
      this.connect();
    }

    // Return cleanup function
    return () => {
      this.commentCallbacks.delete(callback);
    };
  }

  onPostUpdate(callback) {
    this.postUpdateCallbacks.add(callback);
    
    // If socket isn't connected yet, connect it
    if (!this.socket?.connected) {
      this.connect();
    }

    // Return cleanup function
    return () => {
      this.postUpdateCallbacks.delete(callback);
    };
  }

  onNewPost(callback) {
    this.newPostCallbacks.add(callback);
    
    // If socket isn't connected yet, connect it
    if (!this.socket?.connected) {
      this.connect();
    }

    // Return cleanup function
    return () => {
      this.newPostCallbacks.delete(callback);
    };
  }

  // Emit events
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;