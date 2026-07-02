import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  server: {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/replymind_ai',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    baseUrl: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  },

 facebook: {
  appId: process.env.FACEBOOK_APP_ID || '',
  appSecret: process.env.FACEBOOK_APP_SECRET || '',
  redirectUri: process.env.FACEBOOK_REDIRECT_URI || '',
  pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
  webhookVerifyToken: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || '',
  graphApiVersion: process.env.FACEBOOK_GRAPH_API_VERSION || 'v19.0',
},

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
    priceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY || '',
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },

  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

export default config;
