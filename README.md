# 🤖 ReplyMind AI

**AI-powered Facebook Messenger Auto-Reply System**

ReplyMind AI is a production-ready SaaS platform that automatically responds to Facebook Messenger messages using Google Gemini AI. Connect your Facebook pages, set up smart auto-reply rules, and provide 24/7 customer support with intelligent, context-aware responses.

## ✨ Features

- **🤖 AI-Powered Responses** - Google Gemini API generates contextually relevant, natural replies
- **📝 Keyword Triggers** - Create custom keyword, regex, greeting, and farewell auto-reply rules
- **🔌 Facebook Page Integration** - Connect multiple Facebook pages via Facebook Graph API
- **🌐 Webhook Support** - Real-time message processing via Facebook Messenger webhooks
- **📊 Dashboard** - Track conversations, messages, and usage statistics
- **💳 Subscription Plans** - Stripe-powered billing with free, starter, and professional tiers
- **🔐 Authentication** - Email/password + Google OAuth + Facebook OAuth (NextAuth.js)
- **⚡ Scalable** - PostgreSQL + Prisma ORM, Docker-ready, TypeScript throughout

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express.js (REST API) |
| **Database** | PostgreSQL, Prisma ORM |
| **AI** | Google Gemini API |
| **Auth** | NextAuth.js (Credentials + OAuth) |
| **Payments** | Stripe |
| **Deployment** | Docker, Docker Compose |

## 📁 Project Structure

```
replymind-ai/
├── backend/                     # Express.js API server
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── config/              # App configuration, database, logger
│   │   ├── controllers/         # Route handlers (auth, pages, autoreply, billing)
│   │   ├── middleware/          # Auth, error handling
│   │   ├── routes/              # Express route definitions
│   │   ├── services/            # Business logic (Gemini, Facebook)
│   │   ├── validators/          # Zod validation schemas
│   │   └── server.ts            # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                    # Next.js 14 application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── api/auth/[...nextauth]/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── components/ui/       # shadcn/ui components
│   │   ├── lib/                 # Utilities, API client, auth config
│   │   └── types/               # TypeScript type definitions
│   ├── public/
│   ├── package.json
│   └── next.config.js
├── docker-compose.yml           # Docker Compose configuration
├── Dockerfile                   # Multi-stage Docker build
├── .env.example                 # Environment variables template
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+
- A [Google Gemini API key](https://makersuite.google.com/app/apikey)
- A [Facebook App](https://developers.facebook.com/) with Messenger integration
- A [Stripe account](https://stripe.com)

### Local Development Setup

#### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd replymind-ai

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

#### 2. Configure Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

#### 3. Set Up Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx ts-node prisma/seed.ts
```

#### 4. Start Development Servers

```bash
# Terminal 1 - Backend (port 4000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

Visit **http://localhost:3000** to see the application.

### Docker Setup

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Backend API** on port 4000
- **Frontend** on port 3000

## 🔧 Configuration

### Required Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `FACEBOOK_APP_ID` | Facebook App ID |
| `FACEBOOK_APP_SECRET` | Facebook App Secret |
| `FACEBOOK_WEBHOOK_VERIFY_TOKEN` | Webhook verification token |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

**Frontend (`frontend/.env.local`)**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `NEXTAUTH_URL` | Frontend URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FACEBOOK_CLIENT_ID` | Facebook OAuth client ID |
| `FACEBOOK_CLIENT_SECRET` | Facebook OAuth client secret |

### Facebook Messenger Webhook Setup

1. Go to your [Facebook App Dashboard](https://developers.facebook.com)
2. Add the **Messenger** product
3. Under **Webhooks**, configure:
   - **Callback URL**: `https://your-domain.com/webhook/facebook`
   - **Verify Token**: Your `FACEBOOK_WEBHOOK_VERIFY_TOKEN`
4. Subscribe to `messages` and `messaging_postbacks` fields
5. Under **Settings > Advanced**, generate a Page Access Token
6. In the app dashboard, connect your Facebook Page

### Stripe Setup

1. Create products and prices in your Stripe dashboard
2. Set the price IDs in your `backend/.env`:
   - `STRIPE_PRICE_ID_MONTHLY`
   - `STRIPE_PRICE_ID_YEARLY`
3. Configure the webhook endpoint in Stripe dashboard:
   - Endpoint: `https://your-domain.com/api/v1/billing/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/profile` | Get user profile 🔒 |
| PUT | `/api/v1/auth/profile` | Update profile 🔒 |

### Facebook Pages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/pages` | Get connected pages 🔒 |
| POST | `/api/v1/pages/connect` | Connect Facebook page 🔒 |
| DELETE | `/api/v1/pages/:pageId` | Disconnect page 🔒 |

### Auto-Reply Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auto-replies` | Get rules 🔒 |
| POST | `/api/v1/auto-replies` | Create rule 🔒 |
| PUT | `/api/v1/auto-replies/:id` | Update rule 🔒 |
| DELETE | `/api/v1/auto-replies/:id` | Delete rule 🔒 |
| PATCH | `/api/v1/auto-replies/:id/toggle` | Toggle active status 🔒 |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/billing/create-checkout-session` | Create Stripe checkout 🔒 |
| GET | `/api/v1/billing/subscription` | Get subscription 🔒 |
| POST | `/api/v1/billing/cancel` | Cancel subscription 🔒 |
| POST | `/webhook/stripe` | Stripe webhook |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhook/facebook` | Facebook webhook verification |
| POST | `/webhook/facebook` | Facebook message events |

🔒 = Requires authentication

## 🧪 Running Tests

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## 🐳 Production Deployment

### Build for Production

```bash
# Build Docker images
docker-compose -f docker-compose.yml build

# Run production build (modify docker-compose for production)
docker-compose up -d
```

For production, update the `docker-compose.yml` to use the `production` build target:

```yaml
backend:
  build:
    context: .
    target: production
```

### Manual Deployment

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini API](https://ai.google.dev/) for AI capabilities
- [Facebook Graph API](https://developers.facebook.com/) for Messenger integration
- [Next.js](https://nextjs.org/) for the frontend framework
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Prisma](https://www.prisma.io/) for database ORM

---

**Built with ❤️ by the ReplyMind AI Team**