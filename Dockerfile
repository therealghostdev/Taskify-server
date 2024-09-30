FROM node:latest

WORKDIR /usr/src/taskify

COPY /package*json ./

RUN npm install

COPY . .

CMD [ "npm", "run", "dev" ]

EXPOSE 3000