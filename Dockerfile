FROM node:25-alpine

WORKDIR /app

# Upgrade base packages (fixes zlib CVE-2026-22184 and other Alpine CVEs)
RUN apk update && apk upgrade -a && rm -rf /var/cache/apk/*

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application code
COPY index.js ./

# App listens on PORT env or 3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "index.js"]
