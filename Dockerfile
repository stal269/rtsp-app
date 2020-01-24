FROM node:12.14

WORKDIR /usr/src/rtsp-app
COPY package*.json ./
RUN npm install 
COPY . .
WORKDIR /usr/src/rtsp-app/frontend
RUN npm install
RUN npm run build
WORKDIR /usr/src/rtsp-app
RUN npm run build
CMD [ "npm", "start" ]  