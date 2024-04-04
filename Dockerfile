# Stage 1: Build
# Use an official Node.js runtime as a parent image for the build stage
FROM node:20 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies including 'devDependencies'
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Run
# Use a smaller base image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built artifacts from the 'builder' stage
COPY --from=builder /usr/src/app/dist ./dist

# Open the port your app runs on
EXPOSE 8080

# Define the command to run your app
CMD [ "node", "dist" ]
