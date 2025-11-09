# packages/api/Dockerfile (resilient - works with either build context)
FROM node:18-alpine
WORKDIR /app

# Copy build context
COPY . .

# Install dependencies:
# - If packages/api/package.json exists in context, install there.
# - Otherwise, if package.json exists in root of context, install there.
RUN set -eux; \
    if [ -f packages/api/package.json ]; then \
      cd packages/api; \
      if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi; \
    elif [ -f package.json ]; then \
      if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi; \
    else \
      echo "No package.json found in build context (neither packages/api nor root)" && ls -la && exit 1; \
    fi

EXPOSE 8080
ENV NODE_ENV=production

# Start the app from whichever path exists
CMD ["sh", "-c", "if [ -f packages/api/src/index.js ]; then node packages/api/src/index.js; elif [ -f src/index.js ]; then node src/index.js; else echo 'entrypoint not found' && exit 1; fi"]
