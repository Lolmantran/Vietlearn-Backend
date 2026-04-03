FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npx nest build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]
