FROM node:10.16.0

# Create app directory
WORKDIR /usr/src/srv

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

CMD [ "npm", "start" ]