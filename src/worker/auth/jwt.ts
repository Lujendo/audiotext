import { sign, verify } from '@tsndr/cloudflare-worker-jwt';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class JWTService {
  constructor(private secret: string) {}

  async generateToken(userId: string, email: string, role: string): Promise<string> {
    const payload: JWTPayload = {
      userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    };

    return await sign(payload, this.secret);
  }

  async verifyToken(token: string): Promise<JWTPayload | null> {
    try {
      const isValid = await verify(token, this.secret);
      if (!isValid) return null;

      const payload = JSON.parse(atob(token.split('.')[1])) as JWTPayload;
      
      // Check if token is expired
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }

  async refreshToken(token: string): Promise<string | null> {
    const payload = await this.verifyToken(token);
    if (!payload) return null;

    // Only refresh if token expires within 24 hours
    const timeUntilExpiry = payload.exp - Math.floor(Date.now() / 1000);
    if (timeUntilExpiry > 24 * 60 * 60) {
      return token; // Token is still fresh
    }

    return await this.generateToken(payload.userId, payload.email, payload.role);
  }
}

export class SessionService {
  constructor(private kv: KVNamespace) {}

  async createSession(userId: string, token: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      token,
      createdAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    await this.kv.put(`session:${sessionId}`, JSON.stringify(sessionData), {
      expirationTtl: 7 * 24 * 60 * 60, // 7 days
    });

    // Also store user's active sessions
    const userSessionsKey = `user_sessions:${userId}`;
    const existingSessions = await this.kv.get(userSessionsKey);
    const sessions = existingSessions ? JSON.parse(existingSessions) : [];
    sessions.push(sessionId);

    await this.kv.put(userSessionsKey, JSON.stringify(sessions), {
      expirationTtl: 7 * 24 * 60 * 60,
    });

    return sessionId;
  }

  async getSession(sessionId: string): Promise<any | null> {
    const sessionData = await this.kv.get(`session:${sessionId}`);
    if (!sessionData) return null;

    const session = JSON.parse(sessionData);
    
    // Update last accessed time
    session.lastAccessedAt = new Date().toISOString();
    await this.kv.put(`session:${sessionId}`, JSON.stringify(session), {
      expirationTtl: 7 * 24 * 60 * 60,
    });

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionData = await this.kv.get(`session:${sessionId}`);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      
      // Remove from user's active sessions
      const userSessionsKey = `user_sessions:${session.userId}`;
      const existingSessions = await this.kv.get(userSessionsKey);
      if (existingSessions) {
        const sessions = JSON.parse(existingSessions).filter((id: string) => id !== sessionId);
        if (sessions.length > 0) {
          await this.kv.put(userSessionsKey, JSON.stringify(sessions), {
            expirationTtl: 7 * 24 * 60 * 60,
          });
        } else {
          await this.kv.delete(userSessionsKey);
        }
      }
    }

    await this.kv.delete(`session:${sessionId}`);
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    const userSessionsKey = `user_sessions:${userId}`;
    const existingSessions = await this.kv.get(userSessionsKey);
    
    if (existingSessions) {
      const sessions = JSON.parse(existingSessions);
      
      // Delete all sessions
      await Promise.all(
        sessions.map((sessionId: string) => this.kv.delete(`session:${sessionId}`))
      );
      
      // Delete user sessions list
      await this.kv.delete(userSessionsKey);
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
