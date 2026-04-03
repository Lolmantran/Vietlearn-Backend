FROM node:20-alpine

WORKDIR /app

# Install ALL deps (including devDeps needed for build)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Generate Prisma client + compile TypeScript
RUN npm run build

# Fail the build early if dist/main.js wasn't produced
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found after build" && exit 1)

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
