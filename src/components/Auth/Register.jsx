// src/components/Auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Button, 
  FormInput, 
  Notification, 
  Select 
} from '../common';
import { CheckCircleIcon } from "@heroicons/react/24/outline";

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

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      role: e.target.value,
    });
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
      await register(
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

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'professor', label: 'Professor' }
  ];

  const passwordValidation = validatePassword(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 flex items-center justify-center p-4">
      {/* Abstract curved shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <Notification
        show={!!error}
        message={error}
        type="error"
        onClose={() => setError("")}
      />
      
      <Notification
        show={showSuccess}
        message="Registration successful! Redirecting to profile setup..."
        type="success"
      />
      
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

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Role Selection */}
            <Select
              label="I am a"
              value={formData.role}
              onChange={handleRoleChange}
              options={roleOptions}
              className="mb-4"
            />

            <FormInput
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your university email"
              required
            />

            <FormInput
              label="University Registration ID"
              name="universityId"
              type="text"
              value={formData.universityId}
              onChange={handleChange}
              placeholder="Enter your university ID (e.g., CS123456)"
              helpText="Format: 2-3 letters followed by 6-8 numbers"
              required
            />

            <div>
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500">Password must:</p>
                <ul className="text-xs text-gray-500 list-disc list-inside">
                  <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>Be at least 8 characters long</li>
                  <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>Contain at least one number</li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}>Contain at least one special character</li>
                </ul>
              </div>
            </div>

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
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