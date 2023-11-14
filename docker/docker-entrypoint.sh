#!/bin/sh


if [ "$#" -eq 0 ] || [ "${1#-}" != "$1" ]; then
     TYPEORM_CONNECTION='postgres' \
     TYPEORM_HOST=${POSTGRES_HOST} \
     TYPEORM_PORT=${POSTGRES_PORT} \
     TYPEORM_USERNAME=${POSTGRES_USER} \
     TYPEORM_DATABASE=${POSTGRES_DB_NAME} \
     TYPEORM_PASSWORD=${POSTGRES_PASSWORD} \
     TYPEORM_MIGRATIONS='./dist/src/migrations/*.js' \
     TYPEORM_SYNC=true \
      yarn typeorm migration:run -d ./ormconfig.ts

     TYPEORM_CONNECTION='postgres' \
     TYPEORM_HOST=${POSTGRES_HOST} \
     TYPEORM_PORT=${POSTGRES_PORT} \
     TYPEORM_USERNAME=${POSTGRES_USER} \
     TYPEORM_DATABASE=${POSTGRES_DB_NAME} \
     TYPEORM_PASSWORD=${POSTGRES_PASSWORD} \
     TYPEORM_MIGRATIONS='./dist/src/migrations-seeding/*.js' \
     TYPEORM_SYNC=false \
      yarn typeorm migration:run -d ./ormconfig.ts

    node dist/src/main.js

else
    # else default to run whatever the user wanted like "bash" or "sh"
    exec "$@"
fi


