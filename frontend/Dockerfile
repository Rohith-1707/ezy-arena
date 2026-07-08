FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# We disable next build telemetry and disable typescript checks for fast production bundling
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV production
ENV PORT 3000

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
