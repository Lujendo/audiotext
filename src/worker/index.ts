import { Hono } from "hono";
import { JWTService, SessionService } from "./auth/jwt";
import { UserRepository } from "./db/repository";
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
  environment: c.env.ENVIRONMENT
}));

// Simple test route for now - auth routes will be added later
app.get('/api/auth/test', (c) => {
  return c.json({ message: 'Auth endpoint working' });
});

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

export default app;
