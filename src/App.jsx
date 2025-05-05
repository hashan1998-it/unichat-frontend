import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Feed from './components/Dashboard/Feed';
import PostForm from './components/Dashboard/PostForm';
import Search from './components/Dashboard/Search';
import Profile from './components/Profile/Profile';
import socket from './utils/socket';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

const Dashboard = () => {
  const [feedKey, setFeedKey] = useState(0);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Search />
        <PostForm onPostCreated={() => setFeedKey(prev => prev + 1)} />
        <Feed key={feedKey} />
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