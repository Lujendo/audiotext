import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { UserRole } from '../../types';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  showSwitchLink?: boolean;
}

const roleOptions = [
  { value: 'subscriber' as UserRole, label: 'Subscriber', icon: '👤', description: 'Premium features and priority support' },
  { value: 'student' as UserRole, label: 'Student', icon: '🎓', description: 'For academic research and learning' },
  { value: 'professional' as UserRole, label: 'Professional', icon: '💼', description: 'For business and professional use' },
  { value: 'copywriter' as UserRole, label: 'Copywriter', icon: '✍️', description: 'For content creation and writing' },
  { value: 'video_editor' as UserRole, label: 'Video Editor', icon: '🎬', description: 'For video production and editing' },
  { value: 'admin' as UserRole, label: 'Admin', icon: '🛡️', description: 'System administration and management' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin, showSwitchLink = true }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'professional' as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation function
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('At least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('At least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character');
    }

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password strength
    const passwordValidationErrors = validatePassword(formData.password);
    if (passwordValidationErrors.length > 0) {
      setError(`Password requirements: ${passwordValidationErrors.join(', ')}`);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register(formData.email, formData.name, formData.password, formData.role);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
        <p className="text-gray-600">Join AudioText and start transcribing</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="relative">
          <Input
            label="Full name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
            className="pl-10"
          />
          <User className="absolute left-3 top-9 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative">
          <Input
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="pl-10"
          />
          <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            I am a...
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  formData.role === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">{option.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Create a password"
            className="pl-10 pr-10"
          />
          <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>

          {/* Password Requirements */}
          {formData.password && (
            <div className="mt-2 text-xs">
              <p className="text-gray-600 mb-1">Password must include:</p>
              <ul className="space-y-1">
                {[
                  { check: formData.password.length >= 8, text: 'At least 8 characters' },
                  { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                  { check: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                  { check: /\d/.test(formData.password), text: 'One number' },
                  { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'One special character' },
                ].map((req, index) => (
                  <li key={index} className={`flex items-center space-x-2 ${req.check ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="text-xs">{req.check ? '✓' : '✗'}</span>
                    <span>{req.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative">
          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm your password"
            className="pl-10 pr-10"
          />
          <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 h-5 w-5 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            required
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <span className="ml-2 text-sm text-gray-600">
            I agree to the{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
          </span>
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Create account
        </Button>
      </form>

      {showSwitchLink && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
