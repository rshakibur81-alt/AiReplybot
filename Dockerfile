# ============================================
# ReplyMind AI - Multi-stage Docker Build
# ============================================

# ---- Stage 1: Build Backend ----
FROM node:20-alpine AS backend-build
WORKDIR /app/backend

# Install dependencies
COPY backend/package*.json ./
RUN npm ci

# Copy source and build
COPY backend/ .
RUN npx prisma generate && npm run build

# ---- Stage 2: Build Frontend ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ .
RUN npm run build

# ---- Stage 3: Production Image ----
FROM node:20-alpine AS production
WORKDIR /app

# Install runtime dependencies for backend
RUN apk add --no-cache curl

# Copy backend
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package.json ./backend/package.json
COPY --from=backend-build /app/backend/prisma ./backend/prisma

# Copy frontend
COPY --from=frontend-build /app/frontend/.next ./frontend/.next
COPY --from=frontend-build /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-build /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/next.config.js ./frontend/next.config.js

# Expose ports
EXPOSE 4000 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start both services
CMD ["sh", "-c", "cd backend && npx prisma db push && node dist/server.js & cd frontend && npm start & wait"]