# Stage 1: build the CMS React app
FROM node:22-slim AS cms-builder
WORKDIR /build
COPY cms/package*.json ./
RUN npm ci
COPY cms/ .
RUN npm run build

# Stage 2: production image
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
COPY --from=cms-builder /build/build ./cms/build
EXPOSE 3003
CMD ["node", "app.js"]
