// src/components/Layout/Header.jsx
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        <div className="flex items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ml-12 lg:ml-0">UniChat</h2>
        </div>
      </div>
    </header>
  );
};

export default Header;