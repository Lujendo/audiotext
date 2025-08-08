import { Hono } from 'hono';
import { JWTService, SessionService, hashPassword, verifyPassword } from '../auth/jwt';
import { UserRepository } from '../db/repository';
import { rateLimitMiddleware } from '../auth/middleware';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(128),
  role: z.enum(['student', 'professional', 'copywriter', 'video_editor']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

// const changePasswordSchema = z.object({
//   currentPassword: z.string().min(1),
//   newPassword: z.string().min(8).max(128),
// });

export function createAuthRoutes(
  getJwtService: (c: any) => JWTService,
  getSessionService: (c: any) => SessionService,
  getUserRepo: (c: any) => UserRepository,
  getKv: (c: any) => KVNamespace
) {
  const auth = new Hono<{ Bindings: Env }>();

  // Rate limiting for auth endpoints
  auth.use('*', async (c, next) => {
    const kv = getKv(c);
    return rateLimitMiddleware(kv, 10, 60000)(c, next);
  });

  // Register
  auth.post('/register', async (c) => {
    try {
      const jwtService = getJwtService(c);
      const sessionService = getSessionService(c);
      const userRepo = getUserRepo(c);

      const body = await c.req.json();
      const validatedData = registerSchema.parse(body);

      // Check if user already exists
      const existingUser = await userRepo.findByEmail(validatedData.email);
      if (existingUser) {
        return c.json({ error: 'User already exists with this email' }, 400);
      }

      // Hash password
      const passwordHash = await hashPassword(validatedData.password);

      // Create user
      const user = await userRepo.create({
        email: validatedData.email,
        name: validatedData.name,
        password_hash: passwordHash,
        role: validatedData.role,
      });

      // Generate JWT token
      const token = await jwtService.generateToken(user.id, user.email, user.role);

      // Create session
      const sessionId = await sessionService.createSession(user.id, token);

      // Set session cookie
      c.header('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

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
          },
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Invalid input data', details: error.issues }, 400);
      }
      return c.json({ error: 'Registration failed' }, 500);
    }
  });

  // Login
  auth.post('/login', async (c) => {
    try {
      const jwtService = getJwtService(c);
      const sessionService = getSessionService(c);
      const userRepo = getUserRepo(c);

      const body = await c.req.json();
      const validatedData = loginSchema.parse(body);

      // Find user
      const user = await userRepo.findByEmail(validatedData.email);
      if (!user) {
        return c.json({ error: 'Invalid email or password' }, 401);
      }

      // Verify password
      const isValidPassword = await verifyPassword(validatedData.password, user.password_hash);
      if (!isValidPassword) {
        return c.json({ error: 'Invalid email or password' }, 401);
      }

      // Generate JWT token
      const token = await jwtService.generateToken(user.id, user.email, user.role);

      // Create session
      const sessionId = await sessionService.createSession(user.id, token);

      // Set session cookie
      c.header('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

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
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Invalid input data', details: error.issues }, 400);
      }
      return c.json({ error: 'Login failed' }, 500);
    }
  });

  // Logout
  auth.post('/logout', async (c) => {
    try {
      const sessionService = getSessionService(c);
      const sessionCookie = c.req.header('Cookie')?.match(/session=([^;]+)/)?.[1];

      if (sessionCookie) {
        await sessionService.deleteSession(sessionCookie);
      }

      // Clear session cookie
      c.header('Set-Cookie', 'session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');

      return c.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return c.json({ error: 'Logout failed' }, 500);
    }
  });

  // Get current user - temporarily disabled due to context type issues
  auth.get('/me', async (c) => {
    return c.json({ error: 'Endpoint temporarily disabled' }, 501);
  });

  // Refresh token
  auth.post('/refresh', async (c) => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: 'Token required' }, 401);
      }

      const token = authHeader.substring(7);
      const jwtService = getJwtService(c);
      const newToken = await jwtService.refreshToken(token);

      if (!newToken) {
        return c.json({ error: 'Invalid or expired token' }, 401);
      }

      return c.json({
        success: true,
        data: { token: newToken },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return c.json({ error: 'Token refresh failed' }, 500);
    }
  });

  // Request password reset
  auth.post('/reset-password', async (c) => {
    try {
      const userRepo = getUserRepo(c);
      const kv = getKv(c);

      const body = await c.req.json();
      const validatedData = resetPasswordSchema.parse(body);

      const user = await userRepo.findByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if user exists or not
        return c.json({ success: true, message: 'If the email exists, a reset link has been sent' });
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token in KV
      await kv.put(`password_reset:${resetToken}`, JSON.stringify({
        userId: user.id,
        email: user.email,
        expiresAt: resetExpiry.toISOString(),
      }), {
        expirationTtl: 60 * 60, // 1 hour
      });

      // TODO: Send email with reset link
      // For now, just return success
      return c.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Password reset request error:', error);
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Invalid input data', details: error.issues }, 400);
      }
      return c.json({ error: 'Password reset request failed' }, 500);
    }
  });

  return auth;
}
