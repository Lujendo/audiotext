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
  // const jwtService = c.get('jwtService') as JWTService;
  // const sessionService = c.get('sessionService') as SessionService;
  // const userRepo = c.get('userRepo') as UserRepository;

  // Import the auth route logic here for now
  return c.json({ message: 'Registration endpoint - implementation in progress' });
});

authApp.post('/login', async (c) => {
  // const jwtService = c.get('jwtService') as JWTService;
  // const sessionService = c.get('sessionService') as SessionService;
  // const userRepo = c.get('userRepo') as UserRepository;

  return c.json({ message: 'Login endpoint - implementation in progress' });
});

authApp.post('/logout', async (c) => {
  // const sessionService = c.get('sessionService') as SessionService;
  return c.json({ message: 'Logout endpoint - implementation in progress' });
});

authApp.get('/me', async (c) => {
  return c.json({ message: 'User profile endpoint - implementation in progress' });
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
