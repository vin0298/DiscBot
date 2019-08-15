FROM node:7
WORKDIR /app
COPY package.json /app
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 8081

