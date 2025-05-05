// App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Feed from './components/Dashboard/Feed';
import CreatePost from './components/Posts/CreatePost';
import Profile from './components/Profile/Profile';
import socket from './utils/socket';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

const Dashboard = () => {
  const [feedKey, setFeedKey] = useState(0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">University Connect</h1>
          <p className="text-gray-600">Connect with your university community</p>
        </div>
        
        <div className="grid gap-6">
          <Feed key={feedKey} />
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      socket.emit('join', user._id);
    }
  }, [user]);
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-post"
              element={
                <PrivateRoute>
                  <CreatePost />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:id?"
              element={
                <PrivateRoute>
                  <div className="container mx-auto px-4 py-8">
                    <Profile />
                  </div>
                </PrivateRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;