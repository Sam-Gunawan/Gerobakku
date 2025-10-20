FROM node:24 AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Serve the application
CMD ["npm", "start", "--", "--host", "0.0.0.0"]