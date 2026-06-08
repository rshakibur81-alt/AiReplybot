# 🚀 ReplyMind AI — Deployment Guide

This guide walks you through deploying ReplyMind AI to production.

## 📋 Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/) (or use Railway/Supabase for managed DB)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)
- Accounts for: [Vercel](https://vercel.com), [Railway](https://railway.app) or [Render](https://render.com)

### API Keys Needed
| Service | Get Keys From |
|---------|---------------|
| Google Gemini AI | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| Facebook App | [Facebook Developers](https://developers.facebook.com) |
| Stripe | [Stripe Dashboard](https://dashboard.stripe.com) |
| Google OAuth | [Google Cloud Console](https://console.cloud.google.com) |
| Facebook OAuth | [Facebook Developers](https://developers.facebook.com) |

---

## 📦 Option 1: Deploy with Docker (Recommended)

### 1. Clone & Configure
```bash
git clone https://github.com/your-org/replymind-ai.git
cd replymind-ai

# Copy environment files
cp .env.example .env
# Edit .env with your actual API keys and secrets
```

### 2. Build & Run
```bash
# Build all services
docker-compose up --build -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

### 3. Run Database Migrations
```bash
docker exec replymind-backend npx prisma db push
# Or for proper migrations:
docker exec replymind-backend npx prisma migrate dev --name init
```

### 4. Verify
```bash
curl http://localhost:4000/health
# Should return: {"success":true,"message":"ReplyMind AI API is running",...}

open http://localhost:3000
```

---

## 🎨 Option 2: Deploy Frontend to Vercel

### 1. Prepare Frontend
```bash
cd frontend

# Install dependencies
npm install

# Generate Prisma client (for NextAuth adapter)
npx prisma generate
```

### 2. Environment Variables (Vercel Dashboard)
Add these to your Vercel project settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `https://your-backend.railway.app/api/v1`) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain (e.g. `https://replymind-ai.vercel.app`) |
| `NEXTAUTH_URL` | Same as NEXT_PUBLIC_APP_URL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From Stripe Dashboard |
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `FACEBOOK_CLIENT_ID` | From Facebook Developers |
| `FACEBOOK_CLIENT_SECRET` | From Facebook Developers |

### 3. Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

### 4. Configure Build Settings (if not auto-detected)
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## ⚙️ Option 3: Deploy Backend to Railway or Render

### Railway (Recommended)

#### Setup
1. Create a [Railway](https://railway.app) account
2. Click **New Project** → **Deploy from GitHub repo**
3. Set **Root Directory** to `backend`
4. Add environment variables (see below)

#### Environment Variables (Railway Dashboard)
Add all variables from `backend/.env.example` to Railway:

| Required Variables |
|--------------------|
| `PORT=4000` |
| `NODE_ENV=production` |
| `API_PREFIX=/api/v1` |
| `DATABASE_URL` (Railway provides PostgreSQL) |
| `JWT_SECRET` |
| `GEMINI_API_KEY` |
| `FACEBOOK_APP_ID` |
| `FACEBOOK_APP_SECRET` |
| `FACEBOOK_WEBHOOK_VERIFY_TOKEN` |
| `STRIPE_SECRET_KEY` |
| `STRIPE_WEBHOOK_SECRET` |
| `STRIPE_PRICE_ID_MONTHLY` |
| `STRIPE_PRICE_ID_YEARLY` |
| `FRONTEND_URL` (your Vercel domain) |
| `CORS_ORIGIN` (your Vercel domain) |

#### Start Command
```bash
npx prisma generate && npx prisma db push && node dist/server.js
```

#### Build Command
```bash
npm install && npx prisma generate && npm run build
```

#### Add PostgreSQL Database
1. In Railway, click **New** → **Database** → **Add PostgreSQL**
2. Copy the `DATABASE_URL` connection string
3. Add it to your backend environment variables

### Render

1. Create a [Render](https://render.com) account
2. Click **New +** → **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && node dist/server.js`
5. Add all environment variables (same as Railway table above)
6. Add a PostgreSQL database from Render Dashboard

---

## 🔗 Option 4: Deploy Full Stack with Render Blueprint

Create a `render.yaml` at the project root:

```yaml
services:
  - type: web
    name: replymind-backend
    env: node
    rootDir: backend
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npx prisma db push && node dist/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "4000"
      - key: DATABASE_URL
        fromDatabase:
          name: replymind-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - fromGroup: replymind-secrets

  - type: web
    name: replymind-frontend
    env: node
    rootDir: frontend
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NEXT_PUBLIC_API_URL
        fromService:
          name: replymind-backend
          type: web
          property: host
          value: /api/v1
      - fromGroup: replymind-secrets

databases:
  - name: replymind-db
    databaseName: replymind
    user: replymind

envVarGroups:
  - name: replymind-secrets
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: NEXTAUTH_SECRET
        sync: false
```

---

## 🔐 Facebook Webhook Setup

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Select your app → **Products** → **Messenger**
3. Under **Webhooks**, configure:
   - **Callback URL**: `https://your-backend.railway.app/webhook/facebook`
   - **Verify Token**: Your `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
4. Subscribe to: `messages`, `messaging_postbacks`
5. Generate a **Page Access Token** in Messenger settings
6. Add the token to your environment variables

---

## 💳 Stripe Webhook Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-backend.railway.app/api/v1/billing/webhook`
4. **Events to listen to**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`

---

## 🧪 Environment Verification Checklist

Before going live, verify all of these:

- [ ] `GEMINI_API_KEY` — Test: `curl https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY`
- [ ] `DATABASE_URL` — Test: `psql YOUR_DATABASE_URL -c "SELECT 1"`
- [ ] `STRIPE_SECRET_KEY` — Test: `curl https://api.stripe.com/v1/charges -u sk_test_...:`
- [ ] `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` — Facebook Login works
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — Google Login works
- [ ] `NEXTAUTH_SECRET` — Generated with `openssl rand -base64 32`
- [ ] Facebook Webhook — Verified with `hub.challenge` response
- [ ] Stripe Webhook — Test event sends in Stripe Dashboard
- [ ] CORS — Frontend can reach backend API
- [ ] Health check — `/health` returns 200

---

## 📊 Post-Deployment

### Monitor
```bash
# Railway
railway logs

# Docker
docker logs replymind-backend -f
docker logs replymind-frontend -f

# Health checks
curl https://your-backend.railway.app/health
```

### Backup Database
```bash
# Railway PostgreSQL
railway connect
pg_dump --no-owner DATABASE_URL > backup_$(date +%Y%m%d).sql

# Docker PostgreSQL
docker exec replymind-postgres pg_dump -U replymind replymind_ai > backup.sql
```

### Update
```bash
# Docker
git pull
docker-compose up --build -d

# Railway/Render
git push  # Auto-deploys if connected
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Prisma connection error** | Check `DATABASE_URL` format: `postgresql://user:pass@host:5432/db?schema=public` |
| **NextAuth sign in fails** | Verify `NEXTAUTH_URL` matches your frontend domain exactly |
| **Stripe webhook 400** | Ensure webhook endpoint is registered **before** `express.json()` in server.ts |
| **Facebook webhook 403** | Verify `FACEBOOK_WEBHOOK_VERIFY_TOKEN` matches exactly |
| **Gemini API errors** | Check `GEMINI_API_KEY` has billing enabled in Google Cloud |
| **CORS errors** | Set `FRONTEND_URL` / `CORS_ORIGIN` to your exact frontend domain |
| **404 on page refresh** | Vercel: ensure `vercel.json` exists with Next.js framework preset |
| **Memory issues** | Increase Node memory: `NODE_OPTIONS="--max-old-space-size=512"` |

---

## 📁 Project Structure for Deployment

```
replymind-ai/
├── backend/          # → Deploy to Railway/Render
│   ├── dist/         # Compiled JS (build output)
│   ├── prisma/       # Schema + migrations
│   ├── src/          # TypeScript source
│   └── package.json
├── frontend/         # → Deploy to Vercel
│   ├── .next/        # Build output (auto-generated)
│   ├── src/          # Source code
│   └── package.json
├── docker-compose.yml  # → Docker deployment
├── Dockerfile          # → Docker deployment
├── vercel.json         # → Vercel config
└── render.yaml         # → Render blueprint
```

---

**Built with ❤️ by the ReplyMind AI Team**