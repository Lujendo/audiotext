import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('*', async (c, next) => {
  const origin = c.req.header('Origin');
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://audiotext.info-eac.workers.dev',
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
});

// Health check
app.get("/api/health", (c) => c.json({
  status: "ok",
  timestamp: new Date().toISOString(),
  environment: c.env?.ENVIRONMENT || 'production',
  message: "AudioText API is running"
}));

// Simple API endpoint
app.get('/api/info', (c) => {
  return c.json({
    name: 'AudioText API',
    version: '1.0.0',
    description: 'Professional Audio to Text Transcription Platform'
  });
});

// Catch all for SPA routing
app.get('*', (c) => {
  return c.json({
    message: 'AudioText - Professional Audio to Text Transcription',
    api: '/api/health'
  });
});

export default app;
