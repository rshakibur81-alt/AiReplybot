import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import pagesRoutes from './routes/pages.routes';
import autoreplyRoutes from './routes/autoreply.routes';
import webhookRoutes from './routes/webhook.routes';
import billingRoutes from './routes/billing.routes';
import paymentRoutes from './routes/payment.routes';
import aiInstructionRoutes from './routes/aiInstruction.routes';
import logsRoutes from './routes/logs.routes';
import { handleWebhook } from './controllers/billing.controller';

const app = express();

// ============================================
// Global Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: config.cors.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use(limiter);

// ============================================
// Stripe Webhook — MUST come before express.json()
// Stripe requires the raw body for signature verification
// ============================================
app.post(
  `${config.server.apiPrefix}/billing/webhook`,
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// ============================================
// Body parsing (for all other routes)
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
app.use(logger);

// ============================================
// Health Check
// ============================================
app.get('/health', (_req: any, res: any) => {
  res.json({
    success: true,
    message: 'ReplyMind AI API is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// ============================================
// API Routes
// ============================================
const apiPrefix = config.server.apiPrefix;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/pages`, pagesRoutes);
app.use(`${apiPrefix}/auto-replies`, autoreplyRoutes);
app.use(`${apiPrefix}/billing`, billingRoutes);
app.use(`${apiPrefix}/payment`, paymentRoutes);
app.use(`${apiPrefix}/ai-instructions`, aiInstructionRoutes);
app.use(`${apiPrefix}/logs`, logsRoutes);
app.use('/webhook', webhookRoutes);

// ============================================
// Error Handling
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
const server = app.listen(config.server.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║         ReplyMind AI - Server            ║
  ║──────────────────────────────────────────║
  ║  Port:     ${String(config.server.port).padEnd(30)}║
  ║  Mode:     ${config.server.nodeEnv.padEnd(30)}║
  ║  API:      ${config.server.apiPrefix.padEnd(30)}║
  ║  Frontend: ${config.cors.frontendUrl.padEnd(30)}║
  ╚══════════════════════════════════════════╝
  `);
});

export default app;
