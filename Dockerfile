FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY node/package*.json ./
COPY node/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY node/src ./src

# Build
RUN npm run build

# Default command (can be overridden)
CMD ["npm", "start"]
