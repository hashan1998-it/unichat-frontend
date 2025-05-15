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
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
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

  const validateStep1 = () => {
    if (!formData.username) {
      setError('Please enter a username');
      return false;
    }
    if (!formData.email) {
      setError('Please enter your email');
      return false;
    }
    if (!formData.universityId) {
      setError('Please enter your university ID');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation for step 2
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all password fields');
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
          setCurrentStep(1); // Go back to step 1 for username error
        } else if (errorMessage.includes('Email already exists')) {
          setError('This email is already registered. Please use a different email.');
          setCurrentStep(1); // Go back to step 1 for email error
        } else if (errorMessage.includes('University ID already exists')) {
          setError('This University ID is already registered. Please check your ID or contact support.');
          setCurrentStep(1); // Go back to step 1 for university ID error
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract curved shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 -translate-x-1/2 translate-y-1/2"></div>
      
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
      
      <div className="max-w-5xl w-full flex bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10" style={{ minHeight: '600px' }}>
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
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
              
              {/* Progress indicator */}
              <div className="mt-8 flex items-center space-x-3">
                <div className={`h-2 w-20 rounded-full transition-colors duration-300 ${currentStep >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
                <div className={`h-2 w-20 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col" style={{ minHeight: '600px' }}>
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
            <p className="text-gray-600">
              {currentStep === 1 ? 'Enter your basic information' : 'Create a secure password'}
            </p>
            
            {/* Step indicator for mobile */}
            <div className="mt-4 flex items-center space-x-3 lg:hidden">
              <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${currentStep >= 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`h-2 flex-1 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            </div>
          </div>

          {/* Form Container with Fixed Height */}
          <div className="flex-1 flex flex-col">
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              {/* Form Content Container */}
              <div className="flex-1" style={{ minHeight: '350px' }}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <Select
                      label="I am a"
                      value={formData.role}
                      onChange={handleRoleChange}
                      options={roleOptions}
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
                      placeholder="e.g., CS123456"
                      required
                    />
                  </div>
                )}

                {/* Step 2: Password */}
                {currentStep === 2 && (
                  <div className="space-y-4">
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
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 mb-1">Password must:</p>
                        <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                          <li className={`transition-colors duration-200 ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                            Be at least 8 characters long
                          </li>
                          <li className={`transition-colors duration-200 ${/\d/.test(formData.password) ? 'text-green-600' : ''}`}>
                            Contain at least one number
                          </li>
                          <li className={`transition-colors duration-200 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}`}>
                            Contain at least one special character
                          </li>
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
                  </div>
                )}
              </div>

              {/* Action Buttons Container */}
              <div className="mt-6">
                {currentStep === 1 && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    fullWidth
                    className="flex items-center justify-center"
                  >
                    Next
                    <ChevronRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                )}

                {currentStep === 2 && (
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      onClick={handlePrevious}
                      variant="secondary"
                      className="flex items-center justify-center"
                    >
                      <ChevronLeftIcon className="w-5 h-5 mr-2" />
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
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