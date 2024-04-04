# Step 1: Use an official Node.js runtime as a parent image
FROM node:20

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Step 4: Install project dependencies
RUN npm install

# Step 5: Copy the rest of your app's source code
COPY . .

# Step 6: Compile TypeScript to JavaScript
RUN npm run build

# Step 7: Open the port your app runs on
EXPOSE 8000

# Step 8: Define the command to run your app using npm start script
CMD [ "npm", "run", "start-prod" ]
