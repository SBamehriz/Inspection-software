# server/Dockerfile
FROM node:18-alpine

# 1. Install deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Copy source
COPY . .

# 3. Run migrations & launch
#    (you can split this into an entrypoint script if you like)
CMD ["sh", "-c", "npm run migrate:push && npm run dev"]
