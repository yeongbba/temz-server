FROM node:16.16.0

WORKDIR /app
COPY . /app
COPY ./.env /app/.env

RUN yarn build
RUN mkdir dist/src/api && cp -r src/api/ dist/src/api/

CMD [ "yarn", "run", "start:prod"]