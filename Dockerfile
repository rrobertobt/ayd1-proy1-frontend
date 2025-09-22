FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Install Angular CLI globally
RUN npm install -g @angular/cli

FROM node:20-alpine
WORKDIR /app

# Install Angular CLI globally in runtime stage
RUN npm install -g @angular/cli

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from build stage
COPY --from=build /app .

# Expose Angular dev server port
EXPOSE 4200

# Start the development server
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--disable-host-check"]