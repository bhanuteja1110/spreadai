FROM node:18-alpine
WORKDIR /app

# copy package manifests first to leverage Docker cache
COPY package*.json ./
COPY package.json ./packages/api/package.json

# Copy everything so that if a package-lock exists it gets used
COPY . .

# Prefer npm ci if a package-lock exists; otherwise fallback to npm install
RUN if [ -f packages/api/package-lock.json ]; then \
      cd packages/api && npm ci --omit=dev ; \
    else \
      cd packages/api && npm install --omit=dev ; \
    fi

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "src/index.js"]