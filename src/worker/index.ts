import { Hono } from "hono";
import { JWTService, SessionService } from "./auth/jwt";
import { UserRepository } from "./db/repository";
import { PasswordService } from "./services/passwordService";
import { StripeService } from "./services/stripeService";
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
      const product = await stripeService.createProduct(
        productData.name,
        productData.description,
        { plan_type: productData.planType }
      );

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

export default app;
