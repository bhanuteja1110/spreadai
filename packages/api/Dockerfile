# packages/api/Dockerfile
FROM node:18-alpine

# set workdir
WORKDIR /app

# copy entire repo into image (keeps build simple and avoids context issues)
COPY . .

# Install only the API's production deps (fallback if no lockfile)
RUN cd packages/api && \
    if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# expose port for Render (informational)
EXPOSE 8080

ENV NODE_ENV=production

# start app (ensure this path exists in your repo)
CMD ["node", "packages/api/src/index.js"]
