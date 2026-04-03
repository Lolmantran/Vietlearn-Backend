FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# prisma generate + nest build (strips src/ prefix → dist/main.js)
RUN DATABASE_URL="postgresql://ci:ci@localhost:5432/ci" npm run build

# Fail fast if output is missing
RUN test -f dist/main.js || (echo "ERROR: dist/main.js missing" && exit 1)

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
