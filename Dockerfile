# Stage 1 - Build the TypeScript code
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/
RUN npm ci

COPY ./src ./src
RUN npm run build

#Stage 2 - Create a slim production image
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

COPY ./public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]