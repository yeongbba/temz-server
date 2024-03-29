FROM node:16.16.0

ARG IS_TEST
ARG ACCESS_SECRET
ARG REFRESH_SECRET
ARG ACCESS_EXPIRES_SEC
ARG REFRESH_EXPIRES_SEC
ARG ACCESS_TOKEN_KEY
ARG REFRESH_TOKEN_KEY
ARG BCRYPT_SALT_ROUNDS
ARG HOST_PORT
ARG DB_HOST
ARG DB_NAME
ARG REDIS_URL
ARG RATE_LIMIT_DB
ARG VERIFY_CODE_DB
ARG CORS_ALLOW_ORIGIN
ARG CSRF_SECRET_KEY
ARG CSRF_TOKEN_KEY
ARG RATE_LIMIT_WINDOW_MS
ARG RATE_LIMIT_MAX_REQUEST
ARG SENS_HOST_PHONE
ARG SENS_SERVICE_ID
ARG SENS_ACCESS_KEY
ARG SENS_SECRET_KEY
ARG VERIFICATION_ALLOW_COUNT
ARG VERIFICATION_GENERAL_EXPIRE_MINUTE
ARG VERIFICATION_BLOCK_EXPIRE_MINUTE

ENV IS_TEST $IS_TEST
ENV ACCESS_SECRET $ACCESS_SECRET
ENV REFRESH_SECRET $REFRESH_SECRET
ENV ACCESS_EXPIRES_SEC $ACCESS_EXPIRES_SEC
ENV REFRESH_EXPIRES_SEC $REFRESH_EXPIRES_SEC
ENV ACCESS_TOKEN_KEY $ACCESS_TOKEN_KEY
ENV REFRESH_TOKEN_KEY $REFRESH_TOKEN_KEY
ENV BCRYPT_SALT_ROUNDS $BCRYPT_SALT_ROUNDS
ENV HOST_PORT $HOST_PORT
ENV DB_HOST $DB_HOST
ENV DB_NAME $DB_NAME
ENV REDIS_URL $REDIS_URL
ENV RATE_LIMIT_DB $RATE_LIMIT_DB
ENV VERIFY_CODE_DB $VERIFY_CODE_DB
ENV CORS_ALLOW_ORIGIN $CORS_ALLOW_ORIGIN
ENV CSRF_SECRET_KEY $CSRF_SECRET_KEY
ENV CSRF_TOKEN_KEY $CSRF_TOKEN_KEY
ENV RATE_LIMIT_WINDOW_MS $RATE_LIMIT_WINDOW_MS
ENV RATE_LIMIT_MAX_REQUEST $RATE_LIMIT_MAX_REQUEST
ENV SENS_HOST_PHONE $SENS_HOST_PHONE
ENV SENS_SERVICE_ID $SENS_SERVICE_ID
ENV SENS_ACCESS_KEY $SENS_ACCESS_KEY
ENV SENS_SECRET_KEY $SENS_SECRET_KEY
ENV VERIFICATION_ALLOW_COUNT $VERIFICATION_ALLOW_COUNT
ENV VERIFICATION_GENERAL_EXPIRE_MINUTE $VERIFICATION_GENERAL_EXPIRE_MINUTE
ENV VERIFICATION_BLOCK_EXPIRE_MINUTE $VERIFICATION_BLOCK_EXPIRE_MINUTE

WORKDIR /app
COPY . /app

RUN yarn install
RUN yarn build
RUN mkdir /app/dist/src/api
RUN cp -r /app/src/api/* /app/dist/src/api

CMD [ "yarn", "run", "start:prod"]