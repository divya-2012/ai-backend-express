# Stage 1: Build the application
FROM node:18 AS build

WORKDIR /app

# First copy package files for dependency installation
COPY package*.json ./
COPY prisma ./prisma

# Install ALL dependencies (including devDependencies) for building
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy all other files
COPY . .

# Run the build
RUN npm run build

# Stage 2: Create a minimal production image
FROM node:18-alpine

# Install curl and dockerize
RUN apk add --no-cache curl && \
  curl -L https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz \
  | tar -C /usr/local/bin -xz

WORKDIR /app

# Copy only production files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

EXPOSE 8001

ENV NODE_ENV=production

CMD ["sh", "-c", "dockerize -wait tcp://db:3306 -timeout 30s && npx prisma migrate deploy && node dist/src/server.js"]