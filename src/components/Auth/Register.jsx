// src/components/Auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    universityId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Clear error when user types
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasNumber && hasSymbol,
      minLength,
      hasNumber,
      hasSymbol
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.universityId) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 8 characters long and contain numbers and symbols');
      return;
    }
    
    setLoading(true);
    try {
      // Register the user
      const registerResponse = await register(
        formData.username, 
        formData.email, 
        formData.password,
        formData.role,
        formData.universityId
      );
      
      setShowSuccess(true);
      
      // Automatically log in after registration
      await login(formData.universityId, formData.password);
      
      // Navigate to profile picture section after 2 seconds
      setTimeout(() => {
        navigate('/setup-profile');
      }, 2000);
      
    } catch (error) {
      if (error.response) {
        // Handle specific error messages from the backend
        const errorMessage = error.response.data.message;
        if (errorMessage.includes('Username already exists')) {
          setError('This username is already taken. Please choose another one.');
        } else if (errorMessage.includes('Email already exists')) {
          setError('This email is already registered. Please use a different email.');
        } else if (errorMessage.includes('University ID already exists')) {
          setError('This University ID is already registered. Please check your ID or contact support.');
        } else {
          setError(errorMessage || 'Failed to register. Please try again.');
        }
      } else if (error.request) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 flex items-center justify-center p-4">
      {/* Abstract curved shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-6xl w-full flex bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-400 to-blue-600">
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="relative h-full flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="University students collaborating"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black/70 to-transparent">
              <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Join UniConnect Today</h2>
              <p className="text-xl text-white drop-shadow-md">Connect with students, professors, and researchers from your university.</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Sign Up</h1>
            <p className="text-sm sm:text-base text-gray-600">Start your university journey with us</p>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {showSuccess && (
            <div className="mb-4 sm:mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <div>
                <p className="text-green-700 font-medium">Registration successful!</p>
                <p className="text-green-600 text-sm">Redirecting to profile setup...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'student'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-base sm:text-lg font-semibold">Student</div>
                  <div className="text-xs sm:text-sm text-gray-500">Join as a student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'professor' })}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'professor'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-base sm:text-lg font-semibold">Professor</div>
                  <div className="text-xs sm:text-sm text-gray-500">Join as a professor</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your university email"
              />
            </div>

            <div>
              <label htmlFor="universityId" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                University Registration ID
              </label>
              <input
                id="universityId"
                name="universityId"
                type="text"
                required
                value={formData.universityId}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your university ID (e.g., CS123456)"
              />
              <p className="mt-1 text-xs text-gray-500">Format: 2-3 letters followed by 6-8 numbers</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Password must:</p>
                <ul className="text-xs text-gray-500 list-disc list-inside">
                  <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>Be at least 8 characters long</li>
                  <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>Contain at least one number</li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}>Contain at least one special character</li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02]'
              }`}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;