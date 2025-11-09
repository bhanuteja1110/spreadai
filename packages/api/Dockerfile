# packages/api/Dockerfile (resilient: works whether build context is repo root or packages/api)
FROM node:18-alpine
WORKDIR /app

# Copy whole build context into image
COPY . .

# Install dependencies:
# - If packages/api/package.json exists, install there.
# - Otherwise, if package.json exists in the root of the context, install there.
RUN set -eux; \
    if [ -f packages/api/package.json ]; then \
      cd packages/api; \
      if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi; \
    elif [ -f package.json ]; then \
      if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi; \
    else \
      echo "No package.json found in context (neither packages/api nor root). Listing files for debug:"; \
      ls -la; \
      exit 1; \
    fi

EXPOSE 8080
ENV NODE_ENV=production

# Start app:
# - If packages/api exists, start the app there; otherwise assume entrypoint is in the current context at src/index.js
CMD ["sh", "-c", "if [ -f packages/api/src/index.js ]; then node packages/api/src/index.js; elif [ -f src/index.js ]; then node src/index.js; else echo 'entrypoint not found' && exit 1; fi"]
