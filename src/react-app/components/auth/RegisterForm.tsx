import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { pricingPlans } from '../../data/pricingPlans';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  showSwitchLink?: boolean;
}





export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin, showSwitchLink = true }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'free' as 'free' | 'pro' | 'enterprise',
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
      // Set default role based on plan selection
      const defaultRole = formData.plan === 'enterprise' ? 'professional' : 'professional';
      await register(formData.email, formData.name, formData.password, defaultRole, formData.plan);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Pricing Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Choose your plan
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  formData.plan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, plan: plan.id as any }))}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={formData.plan === plan.id}
                    onChange={() => setFormData(prev => ({ ...prev, plan: plan.id as any }))}
                    className="text-blue-600 focus:ring-blue-500 mb-3"
                  />

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-2xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-sm text-gray-500">/{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-1 text-left">
                    {plan.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-gray-500 text-center mt-2">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Password Requirements */}
        {formData.password && (
          <div className="text-xs bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2 font-medium">Password must include:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { check: formData.password.length >= 8, text: 'At least 8 characters' },
                { check: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
                { check: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
                { check: /\d/.test(formData.password), text: 'One number' },
                { check: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), text: 'One special character' },
              ].map((req, index) => (
                <div key={index} className={`flex items-center space-x-2 ${req.check ? 'text-green-600' : 'text-red-500'}`}>
                  <span className="text-xs font-bold">{req.check ? '✓' : '✗'}</span>
                  <span>{req.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
