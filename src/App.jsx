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
import ComingSoon from './components/common/CommingSoon';
import {
  BellIcon,
  BookOpenIcon,
  CalendarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CogIcon
} from '@heroicons/react/24/outline';

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
      <Feed key={feedKey} />
    </div>
  );
};

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (user && isAuthenticated) {
      // Initialize socket connection when user is available
      socket.connect();
      socket.emit('join', user._id);
    }
    
    return () => {
      if (socket.socket?.connected) {
        socket.disconnect();
      }
    };
  }, [user, isAuthenticated]);
  
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
          <Route path="/notifications" element={
            <ComingSoon
              title="Notifications Center"
              description="All your notifications in one place"
              icon={BellIcon}
              expectedDate="Q1 2024"
              features={[
                {
                  title: "Notification History",
                  description: "View all your past notifications"
                },
                {
                  title: "Filter & Search",
                  description: "Find specific notifications quickly"
                },
                {
                  title: "Bulk Actions",
                  description: "Mark multiple notifications as read at once"
                },
                {
                  title: "Custom Preferences",
                  description: "Set notification preferences for different types of updates"
                }
              ]}
            />
          } />
          <Route path="/research" element={
            <ComingSoon
              title="Research Hub"
              description="Share and discover academic research, papers, and publications"
              icon={BookOpenIcon}
              expectedDate="Q2 2024"
              features={[
                {
                  title: "Paper Repository",
                  description: "Upload and share your research papers with the university community"
                },
                {
                  title: "Collaboration Tools",
                  description: "Find collaborators for your research projects"
                },
                {
                  title: "Citation Manager",
                  description: "Manage your references and generate citations automatically"
                },
                {
                  title: "Peer Review",
                  description: "Get feedback on your work from professors and peers"
                }
              ]}
            />
          } />
          <Route path="/events" element={
            <ComingSoon
              title="Campus Events"
              description="Discover and manage university events and activities"
              icon={CalendarIcon}
              expectedDate="Q1 2024"
              features={[
                {
                  title: "Event Calendar",
                  description: "View all upcoming campus events in one place"
                },
                {
                  title: "RSVP Management",
                  description: "Register for events and track your attendance"
                },
                {
                  title: "Event Creation",
                  description: "Create and promote your own campus events"
                },
                {
                  title: "Reminders",
                  description: "Get notifications for upcoming events you're interested in"
                }
              ]}
            />
          } />
          <Route path="/groups" element={
            <ComingSoon
              title="Study Groups"
              description="Join or create study groups and communities"
              icon={UserGroupIcon}
              expectedDate="Q1 2024"
              features={[
                {
                  title: "Group Discovery",
                  description: "Find study groups for your courses and interests"
                },
                {
                  title: "Private Discussions",
                  description: "Chat with group members and share resources"
                },
                {
                  title: "Schedule Meetings",
                  description: "Organize study sessions and group meetings"
                },
                {
                  title: "File Sharing",
                  description: "Share notes and study materials with your group"
                }
              ]}
            />
          } />
          <Route path="/courses" element={
            <ComingSoon
              title="Course Manager"
              description="Track your enrolled courses and academic progress"
              icon={AcademicCapIcon}
              expectedDate="Q2 2024"
              features={[
                {
                  title: "Course Catalog",
                  description: "Browse and search available courses"
                },
                {
                  title: "Schedule Builder",
                  description: "Plan your semester schedule with ease"
                },
                {
                  title: "Grade Tracking",
                  description: "Monitor your academic performance"
                },
                {
                  title: "Assignment Calendar",
                  description: "Keep track of all your assignments and deadlines"
                }
              ]}
            />
          } />
          <Route path="/settings" element={
            <ComingSoon
              title="Settings"
              description="Customize your UniChat experience"
              icon={CogIcon}
              expectedDate="Q1 2024"
              features={[
                {
                  title: "Profile Settings",
                  description: "Update your profile information and privacy settings"
                },
                {
                  title: "Notification Preferences",
                  description: "Choose what notifications you want to receive"
                },
                {
                  title: "Account Security",
                  description: "Manage passwords and two-factor authentication"
                },
                {
                  title: "Data & Privacy",
                  description: "Control your data and privacy preferences"
                }
              ]}
            />
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