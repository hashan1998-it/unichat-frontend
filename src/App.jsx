import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProfileSetup from './components/Auth/ProfileSetup';
import Feed from './components/Dashboard/Feed';
import CreatePost from './components/Posts/CreatePost';
import Profile from './components/Profile/Profile';
import socket from './utils/socket';
import Explore from './components/Explore/Explore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

// Layout wrapper for authenticated routes
const AuthenticatedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <div className="lg:ml-64 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [feedKey, setFeedKey] = useState(0);
  
  return (
    <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Home</h1>
      <Feed key={feedKey} />
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
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-profile" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
        
        {/* Protected routes with layout */}
        <Route element={<PrivateRoute><AuthenticatedLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/profile/:id?" element={
            <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
              <Profile />
            </div>
          } />
          <Route path="/explore" element={
            <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
              <Explore/>
            </div>
          } />
          <Route path="/research" element={
            <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Research</h1>
              <p className="text-gray-600">Academic research and papers</p>
            </div>
          } />
          <Route path="/events" element={
            <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Events</h1>
              <p className="text-gray-600">University events and activities</p>
            </div>
          } />
          <Route path="/groups" element={
            <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Groups</h1>
              <p className="text-gray-600">Join study groups and communities</p>
            </div>
          } />
          <Route path="/courses" element={
            <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Courses</h1>
              <p className="text-gray-600">Your enrolled courses</p>
            </div>
          } />
          <Route path="/settings" element={
            <div className="max-w-6xl mx-auto py-4 px-3 sm:px-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Settings</h1>
              <p className="text-gray-600">Manage your account settings</p>
            </div>
          } />
        </Route>
      </Routes>
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