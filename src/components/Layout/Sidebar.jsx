// src/components/Layout/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
  CogIcon,
  PlusCircleIcon,
  UserGroupIcon,
  CalendarIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as MagnifyingGlassSolid,
  UserIcon as UserSolid,
  CogIcon as CogSolid,
  PlusCircleIcon as PlusCircleSolid,
  UserGroupIcon as UserGroupSolid,
  CalendarIcon as CalendarSolid,
  BookOpenIcon as BookOpenSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon, activeIcon: HomeSolid },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassSolid },
    { name: 'Research', href: '/research', icon: BookOpenIcon, activeIcon: BookOpenSolid },
    { name: 'Events', href: '/events', icon: CalendarIcon, activeIcon: CalendarSolid },
    { name: 'Groups', href: '/groups', icon: UserGroupIcon, activeIcon: UserGroupSolid },
    { name: 'Courses', href: '/courses', icon: BookOpenIcon, activeIcon: BookOpenSolid },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon, activeIcon: UserSolid },
    { name: 'Settings', href: '/settings', icon: CogIcon, activeIcon: CogSolid },
  ];

  const isActive = (path) => {
    // Handle exact matches for most routes
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    // For profile routes, check if the pathname starts with /profile
    if (path === '/profile' && location.pathname.startsWith('/profile')) {
      return true;
    }
    // For other routes, exact match
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-4 mt-12 lg:mt-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-blue-600">Uni</span>
            <span className="ml-1">Chat</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            const Icon = active && item.activeIcon ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}

          {/* Create Post Button */}
          <Link
            to="/create-post"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-3 py-2 mt-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5 mr-3" />
            Create Post
          </Link>
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200">
          <div className="px-2 py-4 space-y-1">
            {userNavigation.map((item) => {
              const active = isActive(item.href);
              const Icon = active && item.activeIcon ? item.activeIcon : item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-gray-500" />
              Log out
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;