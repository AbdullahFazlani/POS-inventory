# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set working directory to root
WORKDIR /

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy all files to the root directory
COPY . .

# Expose the port your app runs on (change if needed)
EXPOSE 3000

# Start the application using npm start
CMD ["npm", "start"]
