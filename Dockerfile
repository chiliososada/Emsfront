# Step 1: Build React Vite App
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the React app
RUN npm run build

# Step 2: Use Nginx to Serve React App
FROM nginx:alpine

# Set working directory in Nginx
WORKDIR /usr/share/nginx/html

# Remove default Nginx index page
RUN rm -rf ./*

# Copy the built React app from the previous step
COPY --from=build /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start a Bash shell instead of running Nginx directly
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
