// src/components/Auth/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/Button";
import FormInput from "../common/FormInput";
import Notification from "../common/Notification";

const Login = () => {
  const [universityId, setUniversityId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!universityId || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    
    try {
      await login(universityId, password);
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Invalid credentials");
      } else if (error.request) {
        setError("Unable to connect to server. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Abstract curved shapes with fixed positioning */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 -translate-x-1/2 translate-y-1/2"></div>
      
      <Notification
        show={!!error}
        message={error}
        type="error"
        onClose={() => setError("")}
      />
      
      <div className="max-w-6xl w-full flex bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Log In</h1>
            <p className="text-gray-600">Welcome back! Please enter your details</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="University ID"
              type="text"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              placeholder="Enter your university ID"
              required
            />

            <div>
              <FormInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />
              <div className="mt-2 text-right">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                  forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Log in'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-60"></div>
          <div className="relative h-full flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="University students"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-12 bg-gradient-to-t from-black/70 to-transparent">
              <h2 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">Welcome to UniChat</h2>
              <p className="text-xl text-white drop-shadow-md">Connect with your university community and enhance your academic journey.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;