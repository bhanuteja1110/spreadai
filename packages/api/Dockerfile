FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm ci --omit=dev

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "src/index.js"]

