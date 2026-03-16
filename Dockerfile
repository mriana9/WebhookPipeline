# Build
# Node Verstion
FROM node:18-alpine AS build 

# Create app folder in container
WORKDIR /app

# Copy All Package -> package.json file
COPY package*.json ./

# Install All Package 
RUN npm install
COPY . .

#TypeScript to JavaScript
RUN npm run build 
# Add  "build": "tsc" -> package.json

# Production
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# Copy
COPY --from=build /app/dist ./dist

#Port 3000
EXPOSE 3000

#Create dist folder to run app
CMD ["node", "dist/index.js"]


#alpine ->  Minimize docker image size