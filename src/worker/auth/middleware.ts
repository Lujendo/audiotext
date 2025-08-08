import { Context, Next } from 'hono';
import { JWTService, SessionService } from './jwt';
import { UserRepository } from '../db/repository';

export interface AuthContext {
  user: {
    id: string;
    email: string;
    role: string;
  };
  session: {
    id: string;
    token: string;
  };
}

export function createAuthMiddleware(jwtService: JWTService, sessionService: SessionService, userRepo: UserRepository) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const sessionCookie = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1];

    if (!authHeader && !sessionCookie) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    try {
      let token: string;
      let sessionId: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (sessionCookie) {
        sessionId = sessionCookie;
        const session = await sessionService.getSession(sessionId);
        if (!session) {
          return c.json({ error: 'Invalid session' }, 401);
        }
        token = session.token;
      } else {
        return c.json({ error: 'Invalid authentication format' }, 401);
      }

      const payload = await jwtService.verifyToken(token);
      if (!payload) {
        return c.json({ error: 'Invalid or expired token' }, 401);
      }

      // Verify user still exists and is active
      const user = await userRepo.findById(payload.userId);
      if (!user) {
        return c.json({ error: 'User not found' }, 401);
      }

      // Add auth context to request
      c.set('auth', {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        session: {
          id: sessionId || '',
          token,
        },
      } as AuthContext);

      await next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return c.json({ error: 'Authentication failed' }, 401);
    }
  };
}

export function requireRole(allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth') as AuthContext;
    
    if (!auth) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (!allowedRoles.includes(auth.user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
}

export function optionalAuth(jwtService: JWTService, sessionService: SessionService, userRepo: UserRepository) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const sessionCookie = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1];

    if (!authHeader && !sessionCookie) {
      await next();
      return;
    }

    try {
      let token: string;
      let sessionId: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (sessionCookie) {
        sessionId = sessionCookie;
        const session = await sessionService.getSession(sessionId);
        if (!session) {
          await next();
          return;
        }
        token = session.token;
      } else {
        await next();
        return;
      }

      const payload = await jwtService.verifyToken(token);
      if (!payload) {
        await next();
        return;
      }

      const user = await userRepo.findById(payload.userId);
      if (!user) {
        await next();
        return;
      }

      c.set('auth', {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        session: {
          id: sessionId || '',
          token,
        },
      } as AuthContext);

      await next();
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      await next();
    }
  };
}

export function corsMiddleware() {
  return async (c: Context, next: Next) => {
    const origin = c.req.header('Origin');
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://audiotext.pages.dev',
      // Add your production domain here
    ];

    if (origin && allowedOrigins.includes(origin)) {
      c.header('Access-Control-Allow-Origin', origin);
    }

    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Max-Age', '86400');

    if (c.req.method === 'OPTIONS') {
      return new Response('', { status: 204 });
    }

    await next();
  };
}

export function rateLimitMiddleware(kv: KVNamespace, maxRequests = 100, windowMs = 60000) {
  return async (c: Context, next: Next) => {
    const clientIP = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const key = `rate_limit:${clientIP}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      const existing = await kv.get(key);
      let requests: number[] = existing ? JSON.parse(existing) : [];

      // Remove old requests outside the window
      requests = requests.filter(timestamp => timestamp > windowStart);

      if (requests.length >= maxRequests) {
        return c.json({ error: 'Rate limit exceeded' }, 429);
      }

      // Add current request
      requests.push(now);

      // Store updated requests with TTL
      await kv.put(key, JSON.stringify(requests), {
        expirationTtl: Math.ceil(windowMs / 1000),
      });

      await next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Continue on error to avoid blocking legitimate requests
      await next();
    }
  };
}
