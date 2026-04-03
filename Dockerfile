# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npx nest build

# ── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY prisma ./prisma

# Copy compiled output
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
