# Use an official Node.js runtime as a parent image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json into the container at /app
COPY package.json package-lock.json ./

# Install any needed packages
RUN npm install

# Copy the rest of the project files into the container at /app
COPY . .

# Build the Next.js project
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]