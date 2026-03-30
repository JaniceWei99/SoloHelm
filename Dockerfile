# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Runtime stage ----
FROM node:20-alpine
LABEL maintainer="SoloHelm <github.com/JaniceWei99/OPC-ProjectManagement>"
LABEL org.opencontainers.image.source="https://github.com/JaniceWei99/OPC-ProjectManagement"
LABEL org.opencontainers.image.description="SoloHelm — Personal project management for solo creators"

RUN addgroup -S solohelm && adduser -S solohelm -G solohelm

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY package.json server.js ./
COPY public/ ./public/

# Data directory for SQLite persistence (mount a volume here)
RUN mkdir -p /app/data && chown -R solohelm:solohelm /app/data
VOLUME ["/app/data"]

USER solohelm

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/tasks > /dev/null || exit 1

CMD ["node", "server.js"]
