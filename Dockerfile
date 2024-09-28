# Use Node.js 20 Alpine as the base image
FROM node:20-alpine

# Install build dependencies (needed for packages with native code)
RUN apk add --no-cache python3 make g++

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (for production only)
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Build the TypeScript files (will output to the 'dist' folder)
RUN npm run build

# Expose the port that your app will run on
EXPOSE 3001

# Set the default NODE_ENV to production
ENV NODE_ENV=production

# Command to run the app
CMD ["node", "dist/server.js"]