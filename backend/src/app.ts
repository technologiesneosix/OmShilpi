import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { notFoundHandler } from './middleware/notFound.middleware';
import { errorHandler } from './middleware/error.middleware';
import v1Router from './routes';
import { setupSwagger } from './config/swagger';

const app: Application = express();

// Disable Express fingerprinting header
app.disable('x-powered-by');

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow external scripts/checkouts/swagger UI/fonts
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'sameorigin' },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// Environment-aware CORS Configuration supporting multi-origin CORS_ORIGINS
const allowedOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : [env.FRONTEND_URL];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// Cookie parsing middleware
app.use(cookieParser(env.COOKIE_SECRET));

// Raw body parsing for Razorpay Webhook endpoint BEFORE general JSON parser
app.use('/api/v1/payments/webhook/razorpay', express.raw({ type: 'application/json' }));

// Request payload size limits (prevents payload-flooding DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging
app.use(requestLogger);

// Mount Interactive Swagger API Documentation UI (/api/docs & /api-docs)
setupSwagger(app as any);

// Root REST API Server Status route
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '🚀 Om Shilpi Jewellers API Server Running',
    documentation: '/api/docs',
    healthCheck: '/api/v1/health',
  });
});

// API Routes
app.use('/api/v1', v1Router);

// Root / health check alias for easy verification
app.get('/api/health', (_req, res) => res.redirect('/api/v1/health'));

// 404 handler
app.use(notFoundHandler);

// Central error handler
app.use(errorHandler);

export default app;
