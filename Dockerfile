FROM node:16-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install

# Bundle app source
COPY . /app

# Build typescript
RUN npm run build

# Expose port
EXPOSE 9000

# Run app
CMD [ "npm", "start" ]
