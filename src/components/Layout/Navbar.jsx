import { Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import NotificationButton from '@components/Notifications/NotificationButton';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">UniChat</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <NotificationButton />
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 