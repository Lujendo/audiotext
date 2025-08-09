import { Hono } from "hono";
import { JWTService, SessionService } from "./auth/jwt";
import { UserRepository } from "./db/repository";
import { PasswordService } from "./services/passwordService";
import { StripeService } from "./services/stripeService";
import { TranscriptionService } from "./services/transcriptionService";
// import { createAuthRoutes } from "./routes/auth";
import { createAuthMiddleware, corsMiddleware } from "./auth/middleware";

type Variables = {
  jwtService: JWTService;
  sessionService: SessionService;
  userRepo: UserRepository;
  stripeService: StripeService;
  auth?: any;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS middleware
app.use('*', corsMiddleware());

// Initialize services
app.use('*', async (c, next) => {
  // Initialize services and attach to context
  const jwtService = new JWTService(c.env.JWT_SECRET);
  const sessionService = new SessionService(c.env.SESSIONS);
  const userRepo = new UserRepository(c.env.DB);
  const stripeService = new StripeService(c.env.STRIPE_SECRET_KEY);

  c.set('jwtService', jwtService);
  c.set('sessionService', sessionService);
  c.set('userRepo', userRepo);
  c.set('stripeService', stripeService);

  await next();
});

// Health check
app.get("/api/health", (c) => c.json({
  status: "ok",
  timestamp: new Date().toISOString(),
  environment: c.env.ENVIRONMENT,
  message: "AudioText API is running - v2.0",
  version: "2.0.0",
  services: {
    database: !!c.env.DB,
    sessions: !!c.env.SESSIONS,
    cache: !!c.env.CACHE,
    storage: !!c.env.AUDIO_BUCKET,
    ai: !!c.env.AI,
    vectorize: !!c.env.VECTORIZE_INDEX,
    analytics: !!c.env.ANALYTICS
  }
}));

// Auth routes - create a sub-app with proper context
const authApp = new Hono<{ Bindings: Env; Variables: Variables }>();
authApp.use('*', async (_c, next) => {
  // Services are already initialized in parent middleware
  await next();
});

// Add auth routes to sub-app
authApp.post('/register', async (c) => {
  try {

    const body = await c.req.json();
    const { email, name, password, role, plan } = body;

    if (!email || !name || !password || !role) {
      return c.json({ success: false, error: 'All fields are required' }, 400);
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return c.json({
        error: 'Password does not meet requirements',
        details: passwordValidation.errors
      }, 400);
    }

    // Check if user already exists
    const userRepo = c.get('userRepo');
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }

    // Hash the password
    const passwordHash = await PasswordService.hashPassword(password);

    // Create user in database
    const newUser = await userRepo.create({
      email: email,
      name: name,
      password_hash: passwordHash,
      role: role as any,
      email_verified: false,
      subscription_status: plan === 'free' ? 'free' : 'free', // All start as free, upgrade later
      plan_type: plan || 'free',
      is_active: true
    });

    // Generate JWT token
    const jwtService = c.get('jwtService');
    const sessionService = c.get('sessionService');
    const token = await jwtService.generateToken(newUser.id, newUser.email, newUser.role);

    // Create session
    const sessionId = await sessionService.createSession(newUser.id, token);

    // Set session cookie
    c.header('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

    return c.json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          avatar: newUser.avatar,
          emailVerified: newUser.email_verified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ success: false, error: 'Registration failed' }, 500);
  }
});

authApp.post('/login', async (c) => {
  try {
    const jwtService = c.get('jwtService') as JWTService;
    const sessionService = c.get('sessionService') as SessionService;
    // const userRepo = c.get('userRepo') as UserRepository;

    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400);
    }

    // Try to find user in database
    const userRepo = c.get('userRepo');
    const user = await userRepo.findByEmail(email);

    if (user) {
      // Verify password using hashed password
      const isValidPassword = await PasswordService.verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        return c.json({ success: false, error: 'Invalid credentials' }, 401);
      }

      // Update last login
      await userRepo.updateLastLogin(user.id);

      // Use the database user
      var authenticatedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        email_verified: user.email_verified,
      };
    } else {
      // For development: create a demo user if not found in database
      authenticatedUser = {
        id: 'demo-user-' + Date.now(),
        email: email,
        name: email.split('@')[0],
        role: 'professional' as const,
        avatar: undefined,
        email_verified: false,
      };
    }

    // Generate JWT token
    const token = await jwtService.generateToken(authenticatedUser.id, authenticatedUser.email, authenticatedUser.role);

    // Create session
    const sessionId = await sessionService.createSession(authenticatedUser.id, token);

    // Set session cookie
    c.header('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

    return c.json({
      success: true,
      data: {
        user: {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          name: authenticatedUser.name,
          role: authenticatedUser.role,
          avatar: authenticatedUser.avatar,
          emailVerified: authenticatedUser.email_verified,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Login failed' }, 500);
  }
});

authApp.post('/logout', async (c) => {
  try {
    const sessionService = c.get('sessionService') as SessionService;
    const sessionCookie = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1];

    if (sessionCookie) {
      await sessionService.deleteSession(sessionCookie);
    }

    // Clear session cookie
    c.header('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');

    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return c.json({ success: false, error: 'Logout failed' }, 500);
  }
});

authApp.get('/me', async (c) => {
  try {
    const jwtService = c.get('jwtService') as JWTService;
    const sessionService = c.get('sessionService') as SessionService;
    const userRepo = c.get('userRepo') as UserRepository;

    // Get session from cookie
    const sessionCookie = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1];

    if (!sessionCookie) {
      return c.json({ success: false, error: 'No session found' }, 401);
    }

    // Get session data
    const sessionData = await sessionService.getSession(sessionCookie);
    if (!sessionData) {
      return c.json({ success: false, error: 'Invalid session' }, 401);
    }

    // Verify JWT token
    const payload = await jwtService.verifyToken(sessionData.token);
    if (!payload) {
      return c.json({ success: false, error: 'Invalid token' }, 401);
    }

    // Get user data
    const user = await userRepo.findById(payload.userId);
    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.email_verified,
        }
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return c.json({ success: false, error: 'Authentication failed' }, 500);
  }
});

app.route('/api/auth', authApp);

// Protected routes (require authentication)
app.use('/api/protected/*', async (c, next) => {
  const jwtService = c.get('jwtService') as JWTService;
  const sessionService = c.get('sessionService') as SessionService;
  const userRepo = c.get('userRepo') as UserRepository;

  return createAuthMiddleware(jwtService, sessionService, userRepo)(c, next);
});

// Test protected route
app.get("/api/protected/test", (c) => {
  const auth = c.get('auth');
  return c.json({
    message: "This is a protected route",
    user: auth?.user || 'No user'
  });
});

// Dashboard routes
app.get("/api/protected/dashboard", (c) => {
  const auth = c.get('auth');
  return c.json({
    message: "Dashboard data",
    user: auth?.user,
    dashboardType: auth?.user?.role || 'default'
  });
});

// Admin API routes with proper authentication middleware
app.get("/api/admin/users", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const userRepo = c.get('userRepo');
    const { role, search } = c.req.query();

    let users;
    if (role && role !== 'all') {
      users = await userRepo.getUsersByRole(role);
    } else if (search) {
      users = await userRepo.searchUsers(search);
    } else {
      users = await userRepo.getAllUsers();
    }

    return c.json({ users });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.get("/api/admin/stats", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const userRepo = c.get('userRepo');

    const total = await userRepo.getUserCount();
    const byRole = await userRepo.getUserCountByRole();

    // Mock data for now - in production, you'd calculate these from the database
    const recentSignups = Math.floor(total * 0.1); // 10% of total as recent
    const activeToday = Math.floor(total * 0.3); // 30% of total as active today

    return c.json({
      total,
      byRole,
      recentSignups,
      activeToday
    });
  } catch (error) {
    console.error('Admin stats fetch error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

app.get("/api/admin/system-stats", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const userRepo = c.get('userRepo');
    const totalUsers = await userRepo.getUserCount();

    // Mock system data - replace with real data sources when available
    const systemStats = {
      totalUsers,
      activeUsers: Math.floor(totalUsers * 0.3), // 30% active users
      totalProjects: 0, // Will be implemented when projects table exists
      totalTranscriptions: 0, // Will be implemented when transcriptions table exists
      storageUsed: '0 GB', // Will be calculated from actual storage
      apiCalls: 0 // Will be tracked when analytics are implemented
    };

    return c.json(systemStats);
  } catch (error) {
    console.error('System stats fetch error:', error);
    return c.json({ error: 'Failed to fetch system stats' }, 500);
  }
});

app.post("/api/admin/users/:id/:action", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const userRepo = c.get('userRepo');
    const { id, action } = c.req.param();

    let result: any = null;

    switch (action) {
      case 'activate':
        result = await userRepo.update(id, { is_active: true });
        break;
      case 'deactivate':
        result = await userRepo.update(id, { is_active: false });
        break;
      case 'delete':
        result = await userRepo.delete(id);
        break;
      default:
        return c.json({ error: 'Invalid action' }, 400);
    }

    if (result) {
      return c.json({ success: true });
    } else {
      return c.json({ error: 'Action failed' }, 500);
    }
  } catch (error) {
    console.error('Admin user action error:', error);
    return c.json({ error: 'Failed to perform action' }, 500);
  }
});

// Initialize development users with hashed passwords
app.post("/api/admin/init-dev-users", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const userRepo = c.get('userRepo');

    const devUsers = [
      { email: 'admin@audiotext.com', name: 'Admin User', role: 'admin', password: 'Admin123!' },
      { email: 'subscriber@audiotext.com', name: 'Premium Subscriber', role: 'subscriber', password: 'Sub123!' },
      { email: 'student@audiotext.com', name: 'Student User', role: 'student', password: 'Student123!' },
      { email: 'pro@audiotext.com', name: 'Professional User', role: 'professional', password: 'Pro123!' },
      { email: 'writer@audiotext.com', name: 'Content Writer', role: 'copywriter', password: 'Writer123!' },
      { email: 'editor@audiotext.com', name: 'Video Editor', role: 'video_editor', password: 'Editor123!' },
    ];

    const results = [];

    for (const userData of devUsers) {
      // Check if user already exists
      const existingUser = await userRepo.findByEmail(userData.email);
      if (existingUser) {
        results.push({ email: userData.email, status: 'already_exists' });
        continue;
      }

      // Hash the password
      const passwordHash = await PasswordService.hashPassword(userData.password);

      // Create the user
      const user = await userRepo.create({
        email: userData.email,
        name: userData.name,
        password_hash: passwordHash,
        role: userData.role as any,
        email_verified: true
      });

      results.push({ email: userData.email, status: 'created', id: user.id });
    }

    return c.json({
      success: true,
      message: 'Development users initialized',
      results
    });
  } catch (error) {
    console.error('Dev users init error:', error);
    return c.json({ error: 'Failed to initialize development users' }, 500);
  }
});

// Stripe API endpoints
app.get("/api/stripe/products", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const stripeService = c.get('stripeService');
    const products = await stripeService.listProducts();
    const prices = await stripeService.listPrices();

    return c.json({
      success: true,
      products: products.data,
      prices: prices.data
    });
  } catch (error) {
    console.error('Stripe products fetch error:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

app.post("/api/stripe/sync-products", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const stripeService = c.get('stripeService');

    // Create or update products in Stripe based on our pricing plans
    const products = [
      {
        name: 'AudioText Pro',
        description: 'For professionals and content creators',
        price: 2900, // $29.00 in cents
        interval: 'month' as const,
        planType: 'pro'
      },
      {
        name: 'AudioText Enterprise',
        description: 'For teams and large organizations',
        price: 9900, // $99.00 in cents
        interval: 'month' as const,
        planType: 'enterprise'
      }
    ];

    const results = [];

    for (const productData of products) {
      // Create product in Stripe
      const product = await stripeService.createProduct({
        name: productData.name,
        description: productData.description,
        active: true,
        metadata: { plan_type: productData.planType }
      });

      // Create price for the product
      const price = await stripeService.createPrice(
        product.id,
        productData.price,
        'usd',
        { interval: productData.interval }
      );

      results.push({
        product,
        price,
        planType: productData.planType
      });
    }

    return c.json({
      success: true,
      message: 'Products synced successfully',
      results
    });
  } catch (error) {
    console.error('Stripe sync error:', error);
    return c.json({ error: 'Failed to sync products' }, 500);
  }
});

app.post("/api/stripe/create-checkout", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');
  const { priceId, planType } = await c.req.json();

  try {
    const stripeService = c.get('stripeService');
    const user = auth?.user;

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Create or get Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripeService.createCustomer(
        user.email,
        user.name,
        { user_id: user.id }
      );
      customerId = customer.id;

      // Update user with Stripe customer ID
      await userRepo.update(user.id, { stripe_customer_id: customerId });
    }

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${c.req.url.split('/api')[0]}/dashboard?success=true`,
      `${c.req.url.split('/api')[0]}/register?canceled=true`,
      planType === 'pro' ? 7 : undefined // 7-day trial for pro plan
    );

    return c.json({
      success: true,
      checkoutUrl: session.url
    });
  } catch (error) {
    console.error('Checkout creation error:', error);
    return c.json({ error: 'Failed to create checkout session' }, 500);
  }
});

// Stripe webhook endpoint
app.post("/api/stripe/webhook", async (c) => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');
    const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return c.json({ error: 'Missing signature or webhook secret' }, 400);
    }

    // Verify webhook signature
    const isValid = StripeService.verifyWebhookSignature(signature, webhookSecret);
    if (!isValid) {
      return c.json({ error: 'Invalid signature' }, 400);
    }

    const event = JSON.parse(body);
    const userRepo = c.get('userRepo');

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Find user by Stripe customer ID
        const users = await userRepo.searchUsers(customerId);
        const user = users.find(u => u.stripe_customer_id === customerId);

        if (user) {
          await userRepo.update(user.id, {
            subscription_status: subscription.status,
            subscription_id: subscription.id,
            plan_type: subscription.metadata?.plan_type || 'pro'
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        const deletedCustomerId = deletedSubscription.customer;

        const deletedUsers = await userRepo.searchUsers(deletedCustomerId);
        const deletedUser = deletedUsers.find(u => u.stripe_customer_id === deletedCustomerId);

        if (deletedUser) {
          await userRepo.update(deletedUser.id, {
            subscription_status: 'canceled',
            plan_type: 'free'
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Enhanced Stripe Product Management Endpoints

// Create new Stripe product
app.post("/api/stripe/products", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const { name, description, active, metadata } = await c.req.json();

    if (!name) {
      return c.json({ error: 'Product name is required' }, 400);
    }

    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

    const product = await stripe.createProduct({
      name,
      description: description || '',
      active: active !== false,
      metadata: metadata || {}
    });

    return c.json({ product });
  } catch (error) {
    console.error('Product creation error:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Update existing Stripe product
app.put("/api/stripe/products/:id", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const productId = c.req.param('id');
    const { name, description, active, metadata } = await c.req.json();

    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;
    if (metadata !== undefined) updateData.metadata = metadata;

    const product = await stripe.updateProduct(productId, updateData);

    return c.json({ product });
  } catch (error) {
    console.error('Product update error:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Sync single Stripe product
app.post("/api/stripe/sync-product/:id", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const productId = c.req.param('id');
    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

    // Fetch the specific product from Stripe
    const product = await stripe.getProduct(productId);

    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }

    // Here you could sync the product to your local database if needed
    // For now, we'll just return the updated product data

    return c.json({
      message: 'Product synced successfully',
      product
    });
  } catch (error) {
    console.error('Product sync error:', error);
    return c.json({ error: 'Failed to sync product' }, 500);
  }
});

// Stripe Price Management Endpoints

// Get prices for a product
app.get("/api/stripe/prices", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const productId = c.req.query('product');
    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

    const pricesData = await stripe.listPrices(productId);

    return c.json({ prices: pricesData.data });
  } catch (error) {
    console.error('Prices fetch error:', error);
    return c.json({ error: 'Failed to fetch prices' }, 500);
  }
});

// Create new price
app.post("/api/stripe/prices", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware manually
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult; // Return error response if authentication failed
  }

  const auth = c.get('auth');

  // Check if user is admin
  if (auth?.user?.role !== 'admin') {
    return c.json({ error: 'Unauthorized - Admin access required' }, 403);
  }

  try {
    const { productId, unitAmount, currency, recurring } = await c.req.json();

    if (!productId || !unitAmount) {
      return c.json({ error: 'Product ID and unit amount are required' }, 400);
    }

    const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);

    const price = await stripe.createPrice(
      productId,
      unitAmount,
      currency || 'usd',
      recurring,
      {}
    );

    return c.json({ price });
  } catch (error) {
    console.error('Price creation error:', error);
    return c.json({ error: 'Failed to create price' }, 500);
  }
});

// Audio Upload and Transcription Endpoints

// Upload audio file
app.post("/api/audio/upload", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  // Apply authentication middleware
  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult;
  }

  const auth = c.get('auth');

  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File;
    const projectId = formData.get('projectId') as string;

    if (!audioFile) {
      return c.json({ error: 'No audio file provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm', 'video/mp4'];
    if (!allowedTypes.includes(audioFile.type)) {
      return c.json({ error: 'Unsupported file type' }, 400);
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 100MB' }, 400);
    }

    // Generate unique filename
    const fileId = crypto.randomUUID();
    const extension = audioFile.name.split('.').pop() || 'mp3';
    const filename = `${fileId}.${extension}`;

    // Upload to R2 bucket
    await c.env.AUDIO_BUCKET.put(filename, audioFile.stream(), {
      httpMetadata: {
        contentType: audioFile.type,
      },
      customMetadata: {
        originalName: audioFile.name,
        userId: auth.user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Save audio file record to database
    await c.env.DB.prepare(`
      INSERT INTO audio_files (id, user_id, project_id, filename, original_name, size, mime_type, url, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      fileId,
      auth.user.id,
      projectId || null,
      filename,
      audioFile.name,
      audioFile.size,
      audioFile.type,
      `https://audiotext-files.${c.env.ENVIRONMENT}.workers.dev/${filename}`,
      'processing',
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // Start transcription process asynchronously
    c.executionCtx.waitUntil(
      processTranscription(c.env, fileId, filename, auth.user.id)
    );

    return c.json({
      success: true,
      audioFile: {
        id: fileId,
        filename: audioFile.name,
        size: audioFile.size,
        status: 'processing',
      },
    });
  } catch (error) {
    console.error('Audio upload error:', error);
    return c.json({ error: 'Failed to upload audio file' }, 500);
  }
});

// Get audio file with transcription
app.get("/api/audio/:id", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult;
  }

  const auth = c.get('auth');
  const audioId = c.req.param('id');

  try {
    // Get audio file
    const audioFile = await c.env.DB.prepare(`
      SELECT * FROM audio_files WHERE id = ? AND user_id = ?
    `).bind(audioId, auth.user.id).first();

    if (!audioFile) {
      return c.json({ error: 'Audio file not found' }, 404);
    }

    // Get transcription if exists
    const transcription = await c.env.DB.prepare(`
      SELECT * FROM transcriptions WHERE audio_file_id = ?
    `).bind(audioId).first();

    return c.json({
      audioFile: {
        ...audioFile,
        transcription: transcription ? {
          ...transcription,
          segments: JSON.parse((transcription.segments as string) || '[]'),
        } : null,
      },
    });
  } catch (error) {
    console.error('Get audio file error:', error);
    return c.json({ error: 'Failed to get audio file' }, 500);
  }
});

// Update transcription text
app.put("/api/transcriptions/:id", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult;
  }

  const auth = c.get('auth');
  const transcriptionId = c.req.param('id');

  try {
    const { editedText } = await c.req.json();

    if (!editedText) {
      return c.json({ error: 'Edited text is required' }, 400);
    }

    // Update transcription
    await c.env.DB.prepare(`
      UPDATE transcriptions
      SET edited_text = ?, last_edited_at = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).bind(
      editedText,
      new Date().toISOString(),
      new Date().toISOString(),
      transcriptionId,
      auth.user.id
    ).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Update transcription error:', error);
    return c.json({ error: 'Failed to update transcription' }, 500);
  }
});

// Enhance transcription with AI
app.post("/api/transcriptions/enhance", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult;
  }

  try {
    const { text, context } = await c.req.json();

    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }

    const transcriptionService = new TranscriptionService(c.env.AI, c.env.AUDIO_BUCKET);
    const enhancedText = await transcriptionService.enhanceTranscription(text, context);

    return c.json({ enhancedText });
  } catch (error) {
    console.error('Enhancement error:', error);
    return c.json({ error: 'Failed to enhance transcription' }, 500);
  }
});

// Generate summary of transcription
app.post("/api/transcriptions/summarize", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult;
  }

  try {
    const { text, type = 'brief' } = await c.req.json();

    if (!text) {
      return c.json({ error: 'Text is required' }, 400);
    }

    const transcriptionService = new TranscriptionService(c.env.AI, c.env.AUDIO_BUCKET);
    const summary = await transcriptionService.generateSummary(text, type);

    return c.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error);
    return c.json({ error: 'Failed to generate summary' }, 500);
  }
});

// Export transcription in different formats
app.post("/api/transcriptions/export", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult;
  }

  try {
    const { transcriptionId, format, content } = await c.req.json();

    if (!transcriptionId || !format || !content) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    let exportContent = '';
    let contentType = '';
    let filename = '';

    switch (format) {
      case 'txt':
        // Strip HTML tags for plain text
        exportContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        contentType = 'text/plain';
        filename = 'transcription.txt';
        break;

      case 'pdf':
        // For PDF, we'd need a PDF generation library
        // For now, return HTML that can be converted to PDF client-side
        exportContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Transcription</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
              h1, h2, h3 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Audio Transcription</h1>
            <div>${content}</div>
          </body>
          </html>
        `;
        contentType = 'text/html';
        filename = 'transcription.html';
        break;

      case 'docx':
        // For DOCX, we'd need a DOCX generation library
        // For now, return RTF format which can be opened by Word
        const rtfContent = content
          .replace(/<h[1-6][^>]*>/g, '\\b ')
          .replace(/<\/h[1-6]>/g, '\\b0\\par ')
          .replace(/<p[^>]*>/g, '')
          .replace(/<\/p>/g, '\\par ')
          .replace(/<strong[^>]*>/g, '\\b ')
          .replace(/<\/strong>/g, '\\b0 ')
          .replace(/<em[^>]*>/g, '\\i ')
          .replace(/<\/em>/g, '\\i0 ')
          .replace(/<[^>]*>/g, '');

        exportContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 ${rtfContent}}`;
        contentType = 'application/rtf';
        filename = 'transcription.rtf';
        break;

      default:
        return c.json({ error: 'Unsupported format' }, 400);
    }

    return new Response(exportContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return c.json({ error: 'Failed to export transcription' }, 500);
  }
});

// Get user's audio files
app.get("/api/audio", async (c) => {
  const jwtService = c.get('jwtService');
  const sessionService = c.get('sessionService');
  const userRepo = c.get('userRepo');

  const authMiddleware = createAuthMiddleware(jwtService, sessionService, userRepo);
  const authResult = await authMiddleware(c, async () => {});

  if (authResult) {
    return authResult;
  }

  const auth = c.get('auth');

  try {
    const audioFiles = await c.env.DB.prepare(`
      SELECT af.*, t.id as transcription_id, t.text, t.edited_text, t.confidence, t.language, t.status as transcription_status
      FROM audio_files af
      LEFT JOIN transcriptions t ON af.id = t.audio_file_id
      WHERE af.user_id = ?
      ORDER BY af.created_at DESC
    `).bind(auth.user.id).all();

    return c.json({
      audioFiles: audioFiles.results.map((file: any) => ({
        ...file,
        transcription: file.transcription_id ? {
          id: file.transcription_id,
          text: file.text,
          editedText: file.edited_text,
          confidence: file.confidence,
          language: file.language,
          status: file.transcription_status,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Get audio files error:', error);
    return c.json({ error: 'Failed to get audio files' }, 500);
  }
});

export default app;

// Helper function to process transcription
async function processTranscription(env: Env, audioFileId: string, _filename: string, userId: string) {
  try {
    const transcriptionService = new TranscriptionService(env.AI, env.AUDIO_BUCKET);

    // Get audio file record
    const audioFile = await env.DB.prepare(`
      SELECT * FROM audio_files WHERE id = ?
    `).bind(audioFileId).first();

    if (!audioFile) {
      throw new Error('Audio file not found');
    }

    // Perform transcription
    const result = await transcriptionService.transcribeAudio(audioFile as any);

    // Save transcription to database
    const transcriptionId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO transcriptions (id, audio_file_id, user_id, text, confidence, language, status, segments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      transcriptionId,
      audioFileId,
      userId,
      result.text,
      result.confidence,
      result.language,
      'completed',
      JSON.stringify(result.segments),
      new Date().toISOString(),
      new Date().toISOString()
    ).run();

    // Update audio file status
    await env.DB.prepare(`
      UPDATE audio_files SET status = ?, updated_at = ? WHERE id = ?
    `).bind('completed', new Date().toISOString(), audioFileId).run();

  } catch (error) {
    console.error('Transcription processing error:', error);

    // Update audio file status to failed
    await env.DB.prepare(`
      UPDATE audio_files SET status = ?, updated_at = ? WHERE id = ?
    `).bind('failed', new Date().toISOString(), audioFileId).run();
  }
}
