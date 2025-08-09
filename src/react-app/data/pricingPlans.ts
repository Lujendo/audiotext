export interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  popular: boolean;
  color: string;
  stripePriceId: string | null;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    period: '7 days',
    description: 'Perfect for trying out AudioText',
    features: [
      '30 minutes of transcription',
      'Basic AI transcription',
      'Standard support',
      'Export to TXT, SRT',
      'Web app access'
    ],
    limitations: [
      'Limited to 7 days',
      'Basic accuracy',
      'No priority support',
    ],
    cta: 'Start Free Trial',
    popular: false,
    color: 'gray',
    stripePriceId: null
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
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
    limitations: [],
    cta: 'Start Pro Plan',
    popular: true,
    color: 'primary',
    stripePriceId: 'price_pro_monthly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
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
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    color: 'purple',
    stripePriceId: 'price_enterprise_monthly'
  },
];

// Helper function to get plan by ID
export const getPlanById = (id: string): PricingPlan | undefined => {
  return pricingPlans.find(plan => plan.id === id);
};

// Helper function to get Stripe price ID by plan ID
export const getStripePriceId = (planId: string): string | null => {
  const plan = getPlanById(planId);
  return plan?.stripePriceId || null;
};
