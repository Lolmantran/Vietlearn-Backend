FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Step 1: generate Prisma client (uses fallback URL from prisma.config.ts)
RUN DATABASE_URL="postgresql://ci:ci@localhost:5432/ci" npx prisma generate

# Step 2: compile TypeScript directly (more transparent than nest build)
RUN npx tsc -p tsconfig.build.json 2>&1

# Step 3: fail fast if output is missing
RUN test -f dist/main.js || (echo "ERROR: dist/main.js missing - tsc may have errored above" && exit 1)

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
