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
  { value: 'student' as UserRole, label: 'Student', icon: '🎓', description: 'For academic research and learning' },
  { value: 'professional' as UserRole, label: 'Professional', icon: '💼', description: 'For business and professional use' },
  { value: 'copywriter' as UserRole, label: 'Copywriter', icon: '✍️', description: 'For content creation and writing' },
  { value: 'video_editor' as UserRole, label: 'Video Editor', icon: '🎬', description: 'For video production and editing' },
  { value: 'admin' as UserRole, label: 'Admin', icon: '🛡️', description: 'System administration and management' },
];

const pricingPlans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: '$0',
    period: '7 days',
    description: 'Perfect for trying out AudioText',
    features: [
      '30 minutes of transcription',
      'Basic AI transcription',
      'Standard support',
      'Export to TXT, SRT',
      'Web app access'
    ],
    popular: false,
    stripePriceId: null
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'month',
    description: 'For professionals and content creators',
    features: [
      '500 minutes/month',
      'Advanced AI models',
      'Speaker identification',
      'Custom vocabulary',
      'Priority processing',
      'All export formats',
      'API access',
      'Priority support'
    ],
    popular: true,
    stripePriceId: 'price_pro_monthly' // Will be set from Stripe
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: 'month',
    description: 'For teams and large organizations',
    features: [
      'Unlimited transcription',
      'Custom AI training',
      'Team collaboration',
      'Advanced analytics',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee'
    ],
    popular: false,
    stripePriceId: 'price_enterprise_monthly' // Will be set from Stripe
  }
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin, showSwitchLink = true }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'professional' as UserRole,
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

        {/* Pricing Plan Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Choose your plan
          </label>
          <div className="space-y-3">
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
                  <div className="absolute -top-2 left-4">
                    <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={formData.plan === plan.id}
                        onChange={() => setFormData(prev => ({ ...prev, plan: plan.id as any }))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                    </div>
                    <div className="mt-2 ml-6">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-sm text-gray-500">/{plan.period}</span>
                      </div>
                      <ul className="mt-2 space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-center">
                            <span className="text-green-500 mr-1">✓</span>
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-gray-500">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
