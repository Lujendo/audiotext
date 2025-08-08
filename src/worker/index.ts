import { Hono } from "hono";
import { JWTService, SessionService } from "./auth/jwt";
import { UserRepository } from "./db/repository";
// import { createAuthRoutes } from "./routes/auth";
import { createAuthMiddleware, corsMiddleware } from "./auth/middleware";

type Variables = {
  jwtService: JWTService;
  sessionService: SessionService;
  userRepo: UserRepository;
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

  c.set('jwtService', jwtService);
  c.set('sessionService', sessionService);
  c.set('userRepo', userRepo);

  await next();
});

// Health check
app.get("/api/health", (c) => c.json({
  status: "ok",
  timestamp: new Date().toISOString(),
  environment: c.env.ENVIRONMENT,
  message: "AudioText API is running",
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
    const jwtService = c.get('jwtService') as JWTService;
    const sessionService = c.get('sessionService') as SessionService;
    // const userRepo = c.get('userRepo') as UserRepository;

    const body = await c.req.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password || !role) {
      return c.json({ success: false, error: 'All fields are required' }, 400);
    }

    // For now, create a demo user for registration
    // In a real implementation, you'd hash the password and store in DB
    const newUser = {
      id: 'user-' + Date.now(),
      email: email,
      name: name,
      role: role,
      avatar: null,
      email_verified: false,
    };

    // Generate JWT token
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

    // For now, create a demo user if login is attempted
    // In a real implementation, you'd verify the password
    const demoUser = {
      id: 'demo-user-' + Date.now(),
      email: email,
      name: email.split('@')[0],
      role: 'professional' as const,
      avatar: null,
      email_verified: true,
    };

    // Generate JWT token
    const token = await jwtService.generateToken(demoUser.id, demoUser.email, demoUser.role);

    // Create session
    const sessionId = await sessionService.createSession(demoUser.id, token);

    // Set session cookie
    c.header('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

    return c.json({
      success: true,
      data: {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          avatar: demoUser.avatar,
          emailVerified: demoUser.email_verified,
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

export default app;
