FROM --platform=linux/amd64 mongo:8.0.0
ENV MONGO_INITDB_DATABASE=dev
COPY ./seed.js /docker-entrypoint-initdb.d/
