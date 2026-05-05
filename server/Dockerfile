# Use official Node.js runtime
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose gRPC port
EXPOSE 50051

# Start server
CMD ["node", "src/server.js"]