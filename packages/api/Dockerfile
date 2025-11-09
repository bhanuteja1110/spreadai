# packages/api/Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package manifests first (for caching)
COPY packages/api/package.json ./packages/api/package.json
# Copy lockfile if it exists
COPY packages/api/package-lock.json ./packages/api/package-lock.json

# Install dependencies
RUN cd packages/api && \
    if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy all project files
COPY . .

# Expose port (for Render)
EXPOSE 8080

ENV NODE_ENV=production

# Start the API
CMD ["node", "packages/api/src/index.js"]
