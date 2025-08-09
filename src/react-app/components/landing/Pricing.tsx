import React from 'react';
import { Button } from '../ui/Button';
import { Check, Star, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for trying out AudioText',
    features: [
      '30 minutes of transcription per month',
      'Basic text editor',
      'Standard export formats (TXT, PDF)',
      'Email support',
      '1 GB storage',
    ],
    limitations: [
      'Watermarked exports',
      'No collaboration features',
      'Basic accuracy',
    ],
    cta: 'Get Started Free',
    popular: false,
    color: 'gray',
  },
  {
    name: 'Basic',
    price: 19,
    period: 'month',
    description: 'Great for students and casual users',
    features: [
      '300 minutes of transcription per month',
      'Advanced text editor with formatting',
      'All export formats (PDF, DOCX, SRT, VTT)',
      'Priority email support',
      '10 GB storage',
      'Speaker identification',
      'Timestamp precision',
    ],
    limitations: [],
    cta: 'Start Basic Plan',
    popular: false,
    color: 'blue',
  },
  {
    name: 'Pro',
    price: 49,
    period: 'month',
    description: 'Perfect for professionals and teams',
    features: [
      '1,000 minutes of transcription per month',
      'Professional rich text editor',
      'All export formats + custom templates',
      'Priority support + live chat',
      '100 GB storage',
      'Advanced AI features',
      'Team collaboration (up to 5 members)',
      'Custom branding',
      'API access',
      'Advanced analytics',
    ],
    limitations: [],
    cta: 'Start Pro Plan',
    popular: true,
    color: 'primary',
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'month',
    description: 'For large teams and organizations',
    features: [
      'Unlimited transcription',
      'Enterprise-grade editor',
      'All features + custom integrations',
      'Dedicated account manager',
      'Unlimited storage',
      'Custom AI model training',
      'Unlimited team members',
      'White-label solution',
      'Advanced security & compliance',
      'Custom workflows',
      'SLA guarantee',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    color: 'purple',
  },
];

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your
            <span className="gradient-text"> Perfect Plan</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. All plans include our core transcription features
            with no hidden fees or usage limits within your tier.
          </p>
          
          {/* Billing toggle */}
          <div className="inline-flex items-center p-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md">
              Monthly
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Annual
              <span className="ml-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-primary-500 ring-2 ring-primary-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-full">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 ml-1">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>

                {/* Free trial note */}
                {plan.price > 0 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    14-day free trial included
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-16 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Need a Custom Solution?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              We offer custom pricing for high-volume users, educational institutions, 
              and organizations with specific requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">
                Schedule a Demo
              </Button>
              <Button>
                Contact Sales
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ link */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300">
            Have questions about our pricing?{' '}
            <a href="#faq" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
              Check our FAQ
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
