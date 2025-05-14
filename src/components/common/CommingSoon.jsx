// src/components/common/ComingSoon.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  RocketLaunchIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ComingSoon = ({ 
  title, 
  description, 
  icon: Icon = RocketLaunchIcon,
  expectedDate,
  features = []
}) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                <ClockIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{expectedDate || 'Coming Soon'}</span>
              </div>
            </div>
            
            <div className="text-center">
              <Icon className="h-20 w-20 mx-auto mb-4 text-white/80" />
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-lg text-white/90">{description}</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
                What's Coming
              </h2>
            </div>

            {/* Features Grid */}
            {features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                We're working hard to bring you this feature. Stay tuned for updates!
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>

          {/* Footer Animation */}
          <div className="bg-gray-50 p-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-600">Building something amazing...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;