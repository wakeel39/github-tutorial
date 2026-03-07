# Build stage (optional: use if you need build steps later)
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application code
COPY index.js ./

# App listens on PORT env or 3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
