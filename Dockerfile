# Stage 1: Build the application
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json, package-lock.json, and Prisma schema for dependency installation
COPY package*.json prisma ./

# Install production dependencies
RUN npm install --only=production

# Generate the Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Create a minimal production image
FROM node:18-alpine

# Install minimal tools required for the application
RUN apk add --no-cache curl

# Set the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/prisma ./prisma

# Expose the port the app will run on
EXPOSE 8001

# Set environment variable for production
ENV NODE_ENV=production

# Run database migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]