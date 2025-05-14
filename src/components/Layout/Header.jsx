// src/components/Layout/Header.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import NotificationButton from '../Notifications/NotificationButton';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';
import { 
  MagnifyingGlassIcon, 
  Bars3Icon, 
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  if (!isAuthenticated) return null;

  const userMenuTrigger = (
    <button className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100 transition-colors duration-150">
      <Avatar
        src={user?.profilePicture}
        username={user?.username}
        size="small"
      />
      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
    </button>
  );

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 ml-12 lg:ml-0">
            <span className="text-blue-600">Uni</span>Chat
          </h2>
          
          {/* Search Bar */}
          <div className="hidden md:block relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-gray-300"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>

          {/* Notifications */}
          <NotificationButton />

          {/* User Menu */}
          <Dropdown trigger={userMenuTrigger} position="bottom-right">
            <Link
              to="/profile"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
                <span>My Profile</span>
              </div>
            </Link>
            <Link
              to="/settings"
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
                <span>Settings</span>
              </div>
            </Link>
            <hr className="border-gray-100" />
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400" />
                <span>Sign out</span>
              </div>
            </button>
          </Dropdown>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showSearch && (
        <div className="md:hidden border-t border-gray-200 px-4 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-gray-300"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;