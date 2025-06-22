# Base stage for installing dependencies
FROM node:20-alpine AS base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Builder stage for building the Next.js application
FROM base AS builder

# Copy the entire application code
COPY . .

# Disable Next.js telemetry (optional, but can speed up build)
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application for production
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy only necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Command to run the Next.js application in production mode
CMD ["npm", "start"]