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
    this.isConnected = false;
  }

  connect() {
    if (this.isConnected || this.socket?.connected) {
      console.log('Socket already connected, skipping connection');
      return;
    }

    const token = getToken();
    if (!token) {
      console.log('No token, cannot connect socket');
      return;
    }

    console.log('Creating new socket connection...');
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      transports: ['websocket'], // Force websocket to prevent duplicate connections
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    // Remove all previous listeners before adding new ones
    this.socket.removeAllListeners();

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Attach event handlers
    this.attachEventHandlers();
  }

  attachEventHandlers() {
    if (!this.socket) return;

    // Remove any existing listeners first
    this.socket.off('newNotification');
    this.socket.off('newComment');
    this.socket.off('postUpdated');
    this.socket.off('newPost');

    // Listen for notifications - single handler only
    this.socket.on('newNotification', (notification) => {
      console.log('New notification received:', notification);
      // Ensure we only process each notification once
      this.notificationCallbacks.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    });

    // Listen for new comments
    this.socket.on('newComment', (comment) => {
      console.log('New comment received:', comment);
      this.commentCallbacks.forEach(callback => {
        try {
          callback(comment);
        } catch (error) {
          console.error('Error in comment callback:', error);
        }
      });
    });

    // Listen for post updates
    this.socket.on('postUpdated', (post) => {
      console.log('Post update received:', post);
      this.postUpdateCallbacks.forEach(callback => {
        try {
          callback(post);
        } catch (error) {
          console.error('Error in post update callback:', error);
        }
      });
    });

    // Listen for new posts
    this.socket.on('newPost', (post) => {
      console.log('New post received:', post);
      this.newPostCallbacks.forEach(callback => {
        try {
          callback(post);
        } catch (error) {
          console.error('Error in new post callback:', error);
        }
      });
    });
  }

  disconnect() {
    console.log('Disconnecting socket...');
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    // Clear all callbacks
    this.notificationCallbacks.clear();
    this.commentCallbacks.clear();
    this.postUpdateCallbacks.clear();
    this.newPostCallbacks.clear();
  }

  onNotification(callback) {
    // Prevent duplicate callbacks
    if (this.notificationCallbacks.has(callback)) {
      console.log('Notification callback already registered');
      return () => {};
    }

    this.notificationCallbacks.add(callback);
    console.log('Added notification callback, total callbacks:', this.notificationCallbacks.size);
    
    // If socket isn't connected yet, connect it
    if (!this.isConnected) {
      this.connect();
    }

    // Return cleanup function
    return () => {
      this.notificationCallbacks.delete(callback);
      console.log('Removed notification callback, remaining:', this.notificationCallbacks.size);
    };
  }

  onNewComment(callback) {
    if (this.commentCallbacks.has(callback)) {
      return () => {};
    }

    this.commentCallbacks.add(callback);
    
    if (!this.isConnected) {
      this.connect();
    }

    return () => {
      this.commentCallbacks.delete(callback);
    };
  }

  onPostUpdate(callback) {
    if (this.postUpdateCallbacks.has(callback)) {
      return () => {};
    }

    this.postUpdateCallbacks.add(callback);
    
    if (!this.isConnected) {
      this.connect();
    }

    return () => {
      this.postUpdateCallbacks.delete(callback);
    };
  }

  onNewPost(callback) {
    if (this.newPostCallbacks.has(callback)) {
      return () => {};
    }

    this.newPostCallbacks.add(callback);
    
    if (!this.isConnected) {
      this.connect();
    }

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

// Ensure socket is disconnected when page unloads
window.addEventListener('beforeunload', () => {
  socketService.disconnect();
});

export default socketService;