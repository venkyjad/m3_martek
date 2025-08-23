# Use Node.js LTS version with full glibc support for transformers
FROM node:18-slim

# Install system dependencies for transformers
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Install all dependencies (including dev) if NODE_ENV is development, otherwise omit dev
ARG NODE_ENV=production
RUN if [ "$NODE_ENV" = "development" ] ; then npm install ; else npm install --omit=dev ; fi

# Copy source code
COPY src/ ./src/

# Create non-root user
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health/live', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]
