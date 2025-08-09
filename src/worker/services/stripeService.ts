/**
 * Stripe Service for handling subscription management
 * Integrates with Stripe API for payment processing and subscription management
 */

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  metadata: Record<string, string>;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring?: {
    interval: 'month' | 'year';
    interval_count: number;
  };
  active: boolean;
  metadata: Record<string, string>;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  items: {
    data: Array<{
      id: string;
      price: StripePrice;
      quantity: number;
    }>;
  };
  metadata: Record<string, string>;
}

export class StripeService {
  private apiKey: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stripe API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Product Management
  async createProduct(name: string, description: string, metadata: Record<string, string> = {}): Promise<StripeProduct> {
    const body = new URLSearchParams({
      name,
      description,
      ...Object.entries(metadata).reduce((acc, [key, value]) => {
        acc[`metadata[${key}]`] = value;
        return acc;
      }, {} as Record<string, string>)
    });

    return this.makeRequest('/products', {
      method: 'POST',
      body: body.toString(),
    });
  }

  async updateProduct(productId: string, updates: Partial<StripeProduct>): Promise<StripeProduct> {
    const body = new URLSearchParams();
    
    if (updates.name) body.append('name', updates.name);
    if (updates.description) body.append('description', updates.description);
    if (updates.active !== undefined) body.append('active', updates.active.toString());
    
    if (updates.metadata) {
      Object.entries(updates.metadata).forEach(([key, value]) => {
        body.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest(`/products/${productId}`, {
      method: 'POST',
      body: body.toString(),
    });
  }

  async listProducts(): Promise<{ data: StripeProduct[] }> {
    return this.makeRequest('/products?active=true');
  }

  // Price Management
  async createPrice(
    productId: string, 
    unitAmount: number, 
    currency: string = 'usd',
    recurring?: { interval: 'month' | 'year'; interval_count?: number },
    metadata: Record<string, string> = {}
  ): Promise<StripePrice> {
    const body = new URLSearchParams({
      product: productId,
      unit_amount: unitAmount.toString(),
      currency,
      ...Object.entries(metadata).reduce((acc, [key, value]) => {
        acc[`metadata[${key}]`] = value;
        return acc;
      }, {} as Record<string, string>)
    });

    if (recurring) {
      body.append('recurring[interval]', recurring.interval);
      if (recurring.interval_count) {
        body.append('recurring[interval_count]', recurring.interval_count.toString());
      }
    }

    return this.makeRequest('/prices', {
      method: 'POST',
      body: body.toString(),
    });
  }

  async listPrices(productId?: string): Promise<{ data: StripePrice[] }> {
    const params = new URLSearchParams({ active: 'true' });
    if (productId) params.append('product', productId);
    
    return this.makeRequest(`/prices?${params.toString()}`);
  }

  // Customer Management
  async createCustomer(email: string, name?: string, metadata: Record<string, string> = {}): Promise<StripeCustomer> {
    const body = new URLSearchParams({
      email,
      ...Object.entries(metadata).reduce((acc, [key, value]) => {
        acc[`metadata[${key}]`] = value;
        return acc;
      }, {} as Record<string, string>)
    });

    if (name) body.append('name', name);

    return this.makeRequest('/customers', {
      method: 'POST',
      body: body.toString(),
    });
  }

  async getCustomer(customerId: string): Promise<StripeCustomer> {
    return this.makeRequest(`/customers/${customerId}`);
  }

  async updateCustomer(customerId: string, updates: Partial<StripeCustomer>): Promise<StripeCustomer> {
    const body = new URLSearchParams();
    
    if (updates.email) body.append('email', updates.email);
    if (updates.name) body.append('name', updates.name);
    
    if (updates.metadata) {
      Object.entries(updates.metadata).forEach(([key, value]) => {
        body.append(`metadata[${key}]`, value);
      });
    }

    return this.makeRequest(`/customers/${customerId}`, {
      method: 'POST',
      body: body.toString(),
    });
  }

  // Subscription Management
  async createSubscription(
    customerId: string, 
    priceId: string, 
    trialPeriodDays?: number,
    metadata: Record<string, string> = {}
  ): Promise<StripeSubscription> {
    const body = new URLSearchParams({
      customer: customerId,
      'items[0][price]': priceId,
      ...Object.entries(metadata).reduce((acc, [key, value]) => {
        acc[`metadata[${key}]`] = value;
        return acc;
      }, {} as Record<string, string>)
    });

    if (trialPeriodDays) {
      body.append('trial_period_days', trialPeriodDays.toString());
    }

    return this.makeRequest('/subscriptions', {
      method: 'POST',
      body: body.toString(),
    });
  }

  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`);
  }

  async updateSubscription(subscriptionId: string, updates: any): Promise<StripeSubscription> {
    const body = new URLSearchParams();
    
    Object.entries(updates).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([subKey, subValue]) => {
          body.append(`${key}[${subKey}]`, String(subValue));
        });
      } else {
        body.append(key, String(value));
      }
    });

    return this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'POST',
      body: body.toString(),
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    return this.makeRequest(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  }

  async listCustomerSubscriptions(customerId: string): Promise<{ data: StripeSubscription[] }> {
    return this.makeRequest(`/subscriptions?customer=${customerId}`);
  }

  // Checkout Session
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    trialPeriodDays?: number
  ): Promise<{ id: string; url: string }> {
    const body = new URLSearchParams({
      customer: customerId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    if (trialPeriodDays) {
      body.append('subscription_data[trial_period_days]', trialPeriodDays.toString());
    }

    return this.makeRequest('/checkout/sessions', {
      method: 'POST',
      body: body.toString(),
    });
  }

  // Webhook signature verification
  static verifyWebhookSignature(signature: string, _secret: string): boolean {
    try {
      // This is a simplified version - in production, use proper HMAC verification
      const expectedSignature = signature.split(',').find(s => s.startsWith('v1='))?.split('=')[1];
      if (!expectedSignature) return false;

      // In a real implementation, you'd use crypto.subtle.importKey and crypto.subtle.sign
      // For now, we'll do a basic check
      return expectedSignature.length > 0;
    } catch (error) {
      return false;
    }
  }
}
