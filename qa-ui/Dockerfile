FROM node:lts-alpine3.17

EXPOSE 3001

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY *.json ./

RUN npm install

COPY . .

CMD [ "astro", "dev" ]