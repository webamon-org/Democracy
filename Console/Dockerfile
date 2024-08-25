# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies with --legacy-peer-deps flag
RUN npm install --legacy-peer-deps

# Copy the rest of the application files to the container
COPY . .

# Expose the port that the React app runs on
EXPOSE 3000

# Command to start the React application
CMD ["npm", "start"]
