import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Footer } from '../components/landing/Footer';

export const RegisterPage: React.FC = () => {
  const handleSuccess = () => {
    // RegisterForm will handle navigation to dashboard
  };

  const handleSwitchToLogin = () => {
    // This will be handled by Link navigation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back to Home */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>

            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AT</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">AudioText</span>
              </div>
            </div>

            {/* Login Link */}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
            <p className="text-gray-600">Create your AudioText account and start transcribing</p>
          </div>

          {/* Register Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchToLogin}
              showSwitchLink={false} // We'll use the header link instead
            />
            
            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
