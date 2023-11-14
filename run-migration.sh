TYPEORM_CONNECTION='postgres' \
     TYPEORM_HOST=127.0.0.1 \
     TYPEORM_PORT=5431 \
     TYPEORM_USERNAME=postgres \
     TYPEORM_DATABASE=briedb \
     TYPEORM_PASSWORD=postgres \
     TYPEORM_MIGRATIONS='./src/migrations/*.ts' \
     TYPEORM_SYNC=false \
      yarn typeorm migration:run -d ./ormconfig.ts
